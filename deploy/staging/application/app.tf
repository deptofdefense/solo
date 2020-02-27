/*

0. Create Template File for the Task Definition
1. Create the Task Definition
2. Create the ECS service
3. Create Cloudwatch for backend
4. Create Cloudwatch for frontend

*/

variable "region" { description = "AWS Region us-gov-west" }
variable "project" { description = "Name of the project" }
variable "remote_state_bucket" { description = "Remote State Bucket for s3" }
variable "remote_state_key" { description = "Remote State Key for s3" }
variable "task_definition_name" { description = "Task Def name" }
variable "backend_container_name" { description = "Backend container name" }
variable "frontend_container_name" { description = "Frontend container name" }
variable "ecs_task_def_service_name" { description = "ECS task def service name" }
variable "solo_iam_role_name" { description = "ECS task role" }
variable "solo_iam_task_exe_role" { description = "ECS task execution role" }
variable "backend_repo_name" { description = "ECR backend repo name" }
variable "frontend_repo_name" { description = "ECR backend repo name" }
variable "memory" { description = "memory" }
variable "cpu" { description = "cpu" }
variable "docker_container_port" { description = "docker container port name" }
//variable "backendTag" {}
//variable "frontendTag" {}

// Pulling secret varibales from aws for creating the task definition
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
data "aws_ecr_repository" "solo_stage_tf_ecr_backend_repo" { name = var.backend_repo_name }
data "aws_ecr_repository" "solo_stage_tf_ecr_frontend_repo" { name = var.frontend_repo_name }
data "aws_iam_role" "ecs_task_role" { name = var.solo_iam_role_name }
data "aws_iam_role" "ecs_task_exe_role" { name = var.solo_iam_task_exe_role }

data "aws_ecr_image" "frontend_digest" {
  repository_name = var.frontend_repo_name
  image_tag = "latest"
}
data "aws_ecr_image" "backend_digest" {
  repository_name = var.backend_repo_name
    image_tag = "latest"
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

Task Definition Name: solo-stage-tf-td-application
This holds the fronend (nginx) and backend container so it can be served up to the user when landing on
the home page.

*/

// 0. Template File that will feed into the Task Definition
data "template_file" "solo_stage_tf_ecs_task_def_template_for_application" {
  template = "${file("containers_definition.json")}"
  vars = {
    backend_container_name    = var.backend_container_name
    frontend_container_name   = var.frontend_container_name
    ecs_task_def_service_name = var.ecs_task_def_service_name

    backend_image_url         = data.aws_ecr_repository.solo_stage_tf_ecr_backend_repo.repository_url
    frontend_image_url        = data.aws_ecr_repository.solo_stage_tf_ecr_frontend_repo.repository_url
    backend_digest            = data.aws_ecr_image.backend_digest.image_digest
    frontend_digest           = data.aws_ecr_image.frontend_digest.image_digest
    memory                    = var.memory
    docker_container_port     = var.docker_container_port
    region                    = var.region

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
resource "aws_ecs_task_definition" "solo_stage_tf_ecs_td_application" {
  container_definitions = data.template_file.solo_stage_tf_ecs_task_def_template_for_application.rendered
  family                = var.ecs_task_def_service_name
  network_mode          = "awsvpc"

  //  Required for Fargate
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.cpu
  memory                   = var.memory
  task_role_arn            = data.aws_iam_role.ecs_task_role.arn
  execution_role_arn       = data.aws_iam_role.ecs_task_exe_role.arn

  tags = {
    Name    = "solo_stage_tf_td_application"
    Project = var.project
  }
}

// 2. Elastic Container Service
resource "aws_ecs_service" "solo_stage_tf_ecs_service" {
  name            = var.ecs_task_def_service_name
  task_definition = aws_ecs_task_definition.solo_stage_tf_ecs_td_application.arn
  cluster         = data.terraform_remote_state.platform_stage.outputs.ecs_cluter
  desired_count   = 1
  launch_type     = "FARGATE"

  load_balancer {
    container_name   = var.frontend_container_name
    container_port   = 443
    target_group_arn = data.terraform_remote_state.platform_stage.outputs.target_group_arn
  }

  network_configuration {
    subnets         = [data.terraform_remote_state.platform_stage.outputs.private_subnet_1a, data.terraform_remote_state.platform_stage.outputs.private_subnet_1b]
    security_groups = [data.terraform_remote_state.platform_stage.outputs.security_group_app]
  }

}

// 3. Cloudwatch for backend
resource "aws_cloudwatch_log_group" "solo_stage_tf_backend_cw_lg" {
  name = "${var.ecs_task_def_service_name}_backend_logGroup"

  tags = {
    Name    = "solo_stage_tf_backend_cw_lg"
    Project = var.project
  }
}

// 4. Cloudwatch for frontend
resource "aws_cloudwatch_log_group" "solo_stage_tf_frontend_cw_lg" {
  name = "${var.ecs_task_def_service_name}_frontend_logGroup"

  tags = {
    Name    = "solo_stage_tf_frontend_cw_lg"
    Project = var.project
  }
}