/*

Variables are inputs that are served as parameters.
The actual values are centrally stored in the tfvars.
This file will create or modify:

0. Template File for the Task Definition
1. Task Definition
2. ECS service
3. Cloudwatch for backend
4. Cloudwatch for frontend

*/

variable "region" { description = "AWS Region us-gov-west" }
variable "project" { description = "Name of the project" }
variable "remote_state_bucket" { description = "Remote State Bucket for s3" }
variable "remote_state_key" { description = "Remote State Key for s3" }
variable "task_definition" { description = "Task Def name" }
variable "backend_container" { description = "Backend container name" }
variable "frontend_container" { description = "Frontend container name" }
variable "ecs_task_def_service" { description = "ECS task def service name" }
variable "ecs_task_role" { description = "ECS task role" }
variable "ecs_task_exe_role" { description = "ECS task execution role" }
variable "backend_repo" { description = "ECR backend repo name" }
variable "frontend_repo" { description = "ECR backend repo name" }

data "aws_ssm_parameter" "MAIN_DOMAIN" { name = "/solo/stage/MAIN_DOMAIN" }
data "aws_ssm_parameter" "NGINX_SSL_CERT" { name = "/solo/stage/NGINX_SSL_CERT" }
data "aws_ssm_parameter" "NGINX_SSL_KEY" { name = "/solo/stage/NGINX_SSL_KEY" }
data "aws_ssm_parameter" "API_DOMAIN" { name = "/solo/stage/API_DOMAIN" }
data "aws_ssm_parameter" "AUTH_DOMAIN" { name = "/solo/stage/AUTH_DOMAIN" }
data "aws_ssm_parameter" "BACKEND_PROXY" { name = "/solo/stage/BACKEND_PROXY" }
data "aws_ssm_parameter" "POSTGRES_PASSWORD" { name = "/solo/stage/POSTGRES_PASSWORD" }
data "aws_ssm_parameter" "POSTGRES_USER" { name = "/solo/stage/POSTGRES_USER" }
data "aws_ssm_parameter" "SECRET_KEY" { name = "/solo/stage/SECRET_KEY" }
data "aws_ssm_parameter" "POSTGRES_HOST" { name = "/solo/stage/POSTGRES_HOST" }
data "aws_ssm_parameter" "POSTGRES_DB" { name = "/solo/stage/POSTGRES_DB" }
data "aws_ecr_repository" "solo_stage_tf_ecr_backend_repo" { name = var.backend_repo }
data "aws_ecr_repository" "solo_stage_tf_ecr_frontend_repo" { name = var.frontend_repo }
data "aws_iam_role" "ecs_task_role" { name = var.ecs_task_role }
data "aws_iam_role" "ecs_task_exe_role" { name = var.ecs_task_exe_role }

data "aws_ecr_image" "frontend_digest" {
  repository_name = var.frontend_repo
  image_tag       = "latest"
}
data "aws_ecr_image" "backend_digest" {
  repository_name = var.backend_repo
  image_tag       = "latest"
}

provider "aws" {
  region = var.region
}

terraform {
  backend "s3" {}
}

data "terraform_remote_state" "platform_stage" {
  backend = "s3"

  config = {
    key    = var.remote_state_key
    bucket = var.remote_state_bucket
    region = var.region
  }
}

/*
This holds the fronend (nginx) and backend container so it can be served up to the user when landing on
the home page.
*/

// 0. Template File that will feed into the Task Definition
data "template_file" "task_def_template" {
  template = "${file("containers_definition.json")}"
  vars = {
    region               = var.region
    backend_container    = var.backend_container
    frontend_container   = var.frontend_container
    ecs_task_def_service = var.ecs_task_def_service
    backend_image_url    = data.aws_ecr_repository.solo_stage_tf_ecr_backend_repo.repository_url
    frontend_image_url   = data.aws_ecr_repository.solo_stage_tf_ecr_frontend_repo.repository_url
    backend_digest       = data.aws_ecr_image.backend_digest.image_digest
    frontend_digest      = data.aws_ecr_image.frontend_digest.image_digest

    //  Database
    POSTGRES_DB       = data.aws_ssm_parameter.POSTGRES_DB.arn
    POSTGRES_USER     = data.aws_ssm_parameter.POSTGRES_USER.arn
    POSTGRES_PASSWORD = data.aws_ssm_parameter.POSTGRES_PASSWORD.arn
    POSTGRES_HOST     = data.aws_ssm_parameter.POSTGRES_HOST.arn

    //  Container
    MAIN_DOMAIN    = data.aws_ssm_parameter.MAIN_DOMAIN.arn
    NGINX_SSL_CERT = data.aws_ssm_parameter.NGINX_SSL_CERT.arn
    NGINX_SSL_KEY  = data.aws_ssm_parameter.NGINX_SSL_KEY.arn
    API_DOMAIN     = data.aws_ssm_parameter.API_DOMAIN.arn
    AUTH_DOMAIN    = data.aws_ssm_parameter.AUTH_DOMAIN.arn
    BACKEND_PROXY  = data.aws_ssm_parameter.BACKEND_PROXY.arn
    SECRET_KEY     = data.aws_ssm_parameter.SECRET_KEY.arn
  }
}

//1. Task Definition
resource "aws_ecs_task_definition" "ecs_td_application" {
  container_definitions = data.template_file.task_def_template.rendered
  family                = var.ecs_task_def_service
  network_mode          = "awsvpc"

  //  Required for Fargate
  requires_compatibilities = ["FARGATE"]
  cpu                      = 512
  memory                   = 2048
  task_role_arn            = data.aws_iam_role.ecs_task_role.arn
  execution_role_arn       = data.aws_iam_role.ecs_task_exe_role.arn

  tags = {
    Name    = "solo_stage_tf_td_application"
    Project = var.project
  }
}

// 2. Elastic Container Service
resource "aws_ecs_service" "ecs_service" {
  name            = var.ecs_task_def_service
  task_definition = aws_ecs_task_definition.ecs_td_application.arn
  cluster         = data.terraform_remote_state.platform_stage.outputs.ecs_cluter
  desired_count   = 1
  launch_type     = "FARGATE"

  load_balancer {
    container_name   = var.frontend_container
    container_port   = 443
    target_group_arn = data.terraform_remote_state.platform_stage.outputs.target_group_arn
  }

  network_configuration {
    subnets         = [data.terraform_remote_state.platform_stage.outputs.private_subnet_1a_id]
    security_groups = [data.terraform_remote_state.platform_stage.outputs.security_group_app]
  }

}

// 3. Cloudwatch for backend
resource "aws_cloudwatch_log_group" "backend_cw_lg" {
  name = "${var.ecs_task_def_service}_backend_logGroup"

  tags = {
    Name    = "solo_stage_tf_backend_cw_lg"
    Project = var.project
  }
}

// 4. Cloudwatch for frontend
resource "aws_cloudwatch_log_group" "frontend_cw_lg" {
  name = "${var.ecs_task_def_service}_frontend_logGroup"

  tags = {
    Name    = "solo_stage_tf_frontend_cw_lg"
    Project = var.project
  }
}