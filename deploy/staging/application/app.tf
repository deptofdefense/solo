/*

Variables are inputs that are served as parameters.
The actual values are centrally stored in the tfvars.
This file will create or modify:

1. RENDER CONTAINER DEFINITION TEMPLATE FILES
2. CREATE ECS TASK DEFINITION RESOURCES
3. CREATE ECS SERVICE RESOURCES
4. CREATE SCHEDULED TASKS THROUGH CLOUDWATCH
5. CREATE CLOUDWATCH LOG GROUPS
6. AUTO SCALE SERVICES

*/

variable "region" { description = "AWS Region us-gov-west" }
variable "project" { description = "Name of the project" }
variable "remote_state_bucket" { description = "Remote State Bucket for s3" }
variable "remote_state_key" { description = "Remote State Key for s3" }

variable "backend_container_repo" { description = "ECR backend repo name" }
variable "frontend_container_repo" { description = "ECR backend repo name" }

variable "application_service_name" { description = "ECS application service name" }
variable "worker_service_name" { description = "ECS worker service name" }
variable "scheduler_service_name" { description = "ECS scheduled data transfer service name" }

variable "ecs_task_role" { description = "ECS task role" }
variable "ecs_task_exe_role" { description = "ECS task execution role" }

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
data "aws_ssm_parameter" "GCSS_PRIVATE_KEY" { name = "/solo/stage/GCSS_PRIVATE_KEY" }
data "aws_ssm_parameter" "GCSS_PUBLIC_CERT" { name = "/solo/stage/GCSS_PUBLIC_CERT" }

data "aws_iam_role" "ecs_task_role" { name = var.ecs_task_role }
data "aws_iam_role" "ecs_task_exe_role" { name = var.ecs_task_exe_role }

data "aws_ecr_repository" "backend_repo" { name = var.backend_container_repo }
data "aws_ecr_repository" "frontend_repo" { name = var.frontend_container_repo }


data "aws_ecr_image" "frontend_digest" {
  repository_name = var.frontend_container_repo
  image_tag       = "latest"
}
data "aws_ecr_image" "backend_digest" {
  repository_name = var.backend_container_repo
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


/////////////////////////////////////////////////////////
//
//  1. RENDER CONTAINER DEFINITION TEMPLATE FILES
//
/////////////////////////////////////////////////////////
data "template_file" "app_task_def_template" {
  template = "${file("template_application.json")}"
  vars = {
    region                   = var.region
    project                  = var.project
    application_service_name = var.application_service_name
    backend_image_url        = data.aws_ecr_repository.backend_repo.repository_url
    backend_digest           = data.aws_ecr_image.backend_digest.image_digest
    frontend_image_url       = data.aws_ecr_repository.frontend_repo.repository_url
    frontend_digest          = data.aws_ecr_image.frontend_digest.image_digest

    POSTGRES_DB       = data.aws_ssm_parameter.POSTGRES_DB.arn
    POSTGRES_USER     = data.aws_ssm_parameter.POSTGRES_USER.arn
    POSTGRES_PASSWORD = data.aws_ssm_parameter.POSTGRES_PASSWORD.arn
    POSTGRES_HOST     = data.aws_ssm_parameter.POSTGRES_HOST.arn
    MAIN_DOMAIN       = data.aws_ssm_parameter.MAIN_DOMAIN.arn
    NGINX_SSL_CERT    = data.aws_ssm_parameter.NGINX_SSL_CERT.arn
    NGINX_SSL_KEY     = data.aws_ssm_parameter.NGINX_SSL_KEY.arn
    API_DOMAIN        = data.aws_ssm_parameter.API_DOMAIN.arn
    AUTH_DOMAIN       = data.aws_ssm_parameter.AUTH_DOMAIN.arn
    BACKEND_PROXY     = data.aws_ssm_parameter.BACKEND_PROXY.arn
    SECRET_KEY        = data.aws_ssm_parameter.SECRET_KEY.arn
  }
}

data "template_file" "worker_task_def_template" {
  template = "${file("template_worker.json")}"
  vars = {
    region              = var.region
    project             = var.project
    worker_service_name = var.worker_service_name
    backend_image_url   = data.aws_ecr_repository.backend_repo.repository_url
    backend_digest      = data.aws_ecr_image.backend_digest.image_digest

    POSTGRES_DB       = data.aws_ssm_parameter.POSTGRES_DB.arn
    POSTGRES_USER     = data.aws_ssm_parameter.POSTGRES_USER.arn
    POSTGRES_PASSWORD = data.aws_ssm_parameter.POSTGRES_PASSWORD.arn
    POSTGRES_HOST     = data.aws_ssm_parameter.POSTGRES_HOST.arn
    SECRET_KEY        = data.aws_ssm_parameter.SECRET_KEY.arn
    GCSS_PRIVATE_KEY  = data.aws_ssm_parameter.GCSS_PRIVATE_KEY.arn
    GCSS_PUBLIC_CERT  = data.aws_ssm_parameter.GCSS_PUBLIC_CERT.arn
  }
}

data "template_file" "scheduler_task_def_template" {
  template = "${file("template_scheduler.json")}"
  vars = {
    region                 = var.region
    project                = var.project
    scheduler_service_name = var.worker_service_name
    backend_image_url      = data.aws_ecr_repository.backend_repo.repository_url
    backend_digest         = data.aws_ecr_image.backend_digest.image_digest

    POSTGRES_DB       = data.aws_ssm_parameter.POSTGRES_DB.arn
    POSTGRES_USER     = data.aws_ssm_parameter.POSTGRES_USER.arn
    POSTGRES_PASSWORD = data.aws_ssm_parameter.POSTGRES_PASSWORD.arn
    POSTGRES_HOST     = data.aws_ssm_parameter.POSTGRES_HOST.arn
    SECRET_KEY        = data.aws_ssm_parameter.SECRET_KEY.arn
  }
}


/////////////////////////////////////////////////////////
//
//  2. CREATE ECS TASK DEFINITION RESOURCES
//
/////////////////////////////////////////////////////////
resource "aws_ecs_task_definition" "app_task_def" {
  container_definitions = data.template_file.app_task_def_template.rendered
  family                = var.application_service_name
  network_mode          = "awsvpc"

  requires_compatibilities = ["FARGATE"]
  cpu                      = 512
  memory                   = 2048
  task_role_arn            = data.aws_iam_role.ecs_task_role.arn
  execution_role_arn       = data.aws_iam_role.ecs_task_exe_role.arn

  tags = {
    Name    = var.application_service_name
    Project = var.project
  }
}

resource "aws_ecs_task_definition" "worker_task_def" {
  container_definitions = data.template_file.worker_task_def_template.rendered
  family                = var.worker_service_name
  network_mode          = "awsvpc"

  requires_compatibilities = ["FARGATE"]
  cpu                      = 512
  memory                   = 2048
  task_role_arn            = data.aws_iam_role.ecs_task_role.arn
  execution_role_arn       = data.aws_iam_role.ecs_task_exe_role.arn

  tags = {
    Name    = var.worker_service_name
    Project = var.project
  }
}

resource "aws_ecs_task_definition" "scheduler_task_def" {
  container_definitions = data.template_file.scheduler_task_def_template.rendered
  family                = var.scheduler_service_name
  network_mode          = "awsvpc"

  requires_compatibilities = ["FARGATE"]
  cpu                      = 512
  memory                   = 2048
  task_role_arn            = data.aws_iam_role.ecs_task_role.arn
  execution_role_arn       = data.aws_iam_role.ecs_task_exe_role.arn

  tags = {
    Name    = var.scheduler_service_name
    Project = var.project
  }
}

/////////////////////////////////////////////////////////
//
//  3. CREATE ECS SERVICE RESOURCES
//
/////////////////////////////////////////////////////////
resource "aws_ecs_service" "app_service" {
  name            = var.application_service_name
  task_definition = aws_ecs_task_definition.app_task_def.arn
  cluster         = data.terraform_remote_state.platform_stage.outputs.ecs_cluter
  desired_count   = 1
  launch_type     = "FARGATE"

  load_balancer {
    container_name   = "${var.application_service_name}-frontend"
    container_port   = 443
    target_group_arn = data.terraform_remote_state.platform_stage.outputs.target_group_arn
  }

  network_configuration {
    subnets         = [data.terraform_remote_state.platform_stage.outputs.private_subnet_1a_id]
    security_groups = [data.terraform_remote_state.platform_stage.outputs.security_group_app]
  }
}

resource "aws_ecs_service" "worker_service" {
  name            = var.worker_service_name
  task_definition = aws_ecs_task_definition.worker_task_def.arn
  cluster         = data.terraform_remote_state.platform_stage.outputs.ecs_cluter
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [data.terraform_remote_state.platform_stage.outputs.private_subnet_1a_id]
    security_groups = [data.terraform_remote_state.platform_stage.outputs.security_group_app]
  }
}

resource "aws_ecs_service" "scheduler_service" {
  name            = var.scheduler_service_name
  task_definition = aws_ecs_task_definition.scheduler_task_def.arn
  cluster         = data.terraform_remote_state.platform_stage.outputs.ecs_cluter
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [data.terraform_remote_state.platform_stage.outputs.private_subnet_1a_id]
    security_groups = [data.terraform_remote_state.platform_stage.outputs.security_group_app]
  }
}

/////////////////////////////////////////////////////////
//
//  5. CREATE CLOUDWATCH LOG GROUPS
//
/////////////////////////////////////////////////////////
resource "aws_cloudwatch_log_group" "application_cw_lg" {
  name = var.application_service_name

  tags = {
    Name    = var.application_service_name
    Project = var.project
  }
}

resource "aws_cloudwatch_log_group" "worker_cw_lg" {
  name = var.worker_service_name

  tags = {
    Name    = var.worker_service_name
    Project = var.project
  }
}

resource "aws_cloudwatch_log_group" "scheduler_cw_lg" {
  name = var.scheduler_service_name

  tags = {
    Name    = var.scheduler_service_name
    Project = var.project
  }
}

/////////////////////////////////////////////////////////
//
//  6. AUTO SCALE SERVICES
//
/////////////////////////////////////////////////////////
resource "aws_appautoscaling_target" "app_autoscale_target" {
  max_capacity       = 8 // max amount of tasks running
  min_capacity       = 1 // min amount of tasks running
  resource_id        = "service/${data.terraform_remote_state.platform_stage.outputs.ecs_cluster_name}/${aws_ecs_service.app_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "app_scale_policy" {
  name               = "app_scale_policy"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.app_autoscale_target.resource_id
  scalable_dimension = aws_appautoscaling_target.app_autoscale_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.app_autoscale_target.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value       = 55 //this is the target CPU Utilization where a scale-up event will occur
    scale_out_cooldown = 60 //this is the amount of seconds before another scale up period begins
    scale_in_cooldown  = 60 //this is the amount of seconds before scaling down occurs
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
  }
}

resource "aws_appautoscaling_target" "worker_autoscale_target" {
  max_capacity       = 8
  min_capacity       = 1
  resource_id        = "service/${data.terraform_remote_state.platform_stage.outputs.ecs_cluster_name}/${aws_ecs_service.worker_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}


resource "aws_appautoscaling_policy" "worker_scale_policy" {
  name               = "worker_scale_policy"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.worker_autoscale_target.resource_id
  scalable_dimension = aws_appautoscaling_target.worker_autoscale_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.worker_autoscale_target.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value       = 55
    scale_out_cooldown = 60
    scale_in_cooldown  = 60

    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
  }
}
