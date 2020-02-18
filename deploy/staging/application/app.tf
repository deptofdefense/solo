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

data "aws_ecr_repository" "solo_stage_tf_ecr_repo" {
  name = var.solo_repo_name
}

data "aws_iam_role" "ecs_task_execution_role" {
  name = var.solo_iam_role_name
}

// 0. Create Template File for the Task Definition
data "template_file" "solo_stage_tf_ecs_task_def_template" {
  template = "${file("container_definition.json")}"
  vars = {
    frontend_container_name = var.frontend_container_name
    ecs_service_name        = var.ecs_service_name
    docker_image_url        = data.aws_ecr_repository.solo_stage_tf_ecr_repo.repository_url
    memory                  = var.memory
    docker_container_port   = var.docker_container_port
    region                  = var.region
  }
}

//1. Create the Task Definition
resource "aws_ecs_task_definition" "solo_stage_tf_task" {
  container_definitions = data.template_file.solo_stage_tf_ecs_task_def_template.rendered
  family                = var.ecs_service_name
  network_mode          = "awsvpc"

  //  Required for Fargate
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.cpu
  memory                   = var.memory
  task_role_arn            = data.aws_iam_role.ecs_task_execution_role.arn
  execution_role_arn       = data.aws_iam_role.ecs_task_execution_role.arn

  tags = {
    Name    = "solo_stage_tf_task"
    Project = "SOLO"
  }
}

// 2. Create the ECS service
resource "aws_ecs_service" "solo_stage_tf_ecs_service" {
  name            = var.ecs_service_name
  task_definition = aws_ecs_task_definition.solo_stage_tf_task.arn
  cluster         = data.terraform_remote_state.platform_stage.outputs.ecs_cluter
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    //    subnets = [data.terraform_remote_state.platform_stage.outputs.public_subnet]
    subnets         = [data.terraform_remote_state.platform_stage.outputs.private_subnet]
    security_groups = [data.terraform_remote_state.platform_stage.outputs.security_group]
  }

  load_balancer {
    container_name   = var.frontend_container_name
    container_port   = var.docker_container_port
    target_group_arn = data.terraform_remote_state.platform_stage.outputs.target_group_arn
  }
}

// 3. Create Cloudwatch
resource "aws_cloudwatch_log_group" "solo_stage_tf_cw_lg" {
  name = "${var.ecs_service_name}_logGroup"

  tags = {
    Name    = "solo_stage_tf_cw_lg"
    Project = "SOLO"
  }
}