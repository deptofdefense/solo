/*

 1. Create ECS Cluster
 2. Create Network Load Balancer
 3. Create NLB Target Group
 4. Create NLB Listener on port 443
 5. Create Security Group for the SOLO VPC
 6. Security Group for the frontend
 7. Security group rule for the frontend ingress on port 443
 8. Security group rule for the frontend ingress on port 80
 9. Security group for the Relational Database
 10. Creates the Amazon Relational Database as postgres inside the VPC
 11. Create a Systems Manager parameter store to send the postgres host address
 12. Create a Systems Manager parameter store to send the postgres database name
 13. Databas subnet group

*/

variable "region" { description = "AWS Region" }
variable "project" { description = "Name of the project" }
variable "remote_state_bucket" { description = "S3 bucket location" }
variable "remote_state_key" { description = "S3 bucket key" }
variable "internet_cidr_block" { description = "How to get outside" }
variable "nlb_eip_1a" { description = "Network LB static ip for az 1a" }
variable "nlb_eip_1b" { description = "Network LB static ip for az 1b" }
variable "availability_zone" { type = list(string) }

// Access already created parameter store secert values and EIPs from AWS
data "aws_ssm_parameter" "db_username" { name = "/solo/stage/POSTGRES_USER" }
data "aws_ssm_parameter" "db_password" { name = "/solo/stage/POSTGRES_PASSWORD" }
data "aws_eip" "solo_stage_tf_eip_for_nlb_1a" { id = var.nlb_eip_1a }
data "aws_eip" "solo_stage_tf_eip_for_nlb_1b" { id = var.nlb_eip_1b }

provider "aws" {
  region = var.region
}

// Keep the {} empty so variables will be passed in dynamically during initialization
terraform {
  backend "s3" {}
}

// Reads in infrastructure stage in order to use the outputs defined in the infrastructre directory
data "terraform_remote_state" "infrastructure_stage" {
  backend = "s3"
  config = {
    bucket = var.remote_state_bucket
    key    = var.remote_state_key
    region = var.region
  }
}

// 1. Elastic Container Service Cluster
resource "aws_ecs_cluster" "solo_stage_tf_ecs_cluster" {
  name = "solo_stage_tf_ecs_cluster"

  tags = {
    Name : "solo_stage_tf_ecs_cluster"
    Project : var.project
  }
}

// 2. Network Load Balancer residing in the public subnets
resource "aws_lb" "solo_stage_tf_nlb" {
  name                             = "solo-stage-tf-nlb"
  internal                         = false
  load_balancer_type               = "network"
  enable_cross_zone_load_balancing = true

  subnet_mapping {
    subnet_id     = data.terraform_remote_state.infrastructure_stage.outputs.public_subnet_id_1a
    allocation_id = data.aws_eip.solo_stage_tf_eip_for_nlb_1a.id
  }
  subnet_mapping {
    subnet_id     = data.terraform_remote_state.infrastructure_stage.outputs.public_subnet_id_1b
    allocation_id = data.aws_eip.solo_stage_tf_eip_for_nlb_1b.id
  }

  tags = {
    Name    = "solo_stage_tf_nlb"
    Project = var.project
  }
}

// 3. NLB Target Group
resource "aws_lb_target_group" "solo_stage_tf_nlb_target_group" {
  name        = "solo-stage-tf-nlb-target-group"
  protocol    = "TCP"
  target_type = "ip"
  vpc_id      = data.terraform_remote_state.infrastructure_stage.outputs.vpc_id
  port        = 443

  health_check {
    enabled  = true
    interval = 30
    protocol = "HTTPS"
    port     = 443
  }

  stickiness {
    type    = "lb_cookie"
    enabled = false
  }

  tags = {
    Name    = "solo_stage_tf_nlb_target_group"
    Project = var.project
  }
}

// 4. NLB Listener on port 443
resource "aws_lb_listener" "solo_stage_tf_nlb_listener_443" {
  load_balancer_arn = aws_lb.solo_stage_tf_nlb.arn
  protocol          = "TCP"
  port              = 443

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.solo_stage_tf_nlb_target_group.arn
  }
}

// 5. Security Group for the NLB
resource "aws_security_group" "solo_stage_tf_nlb_sg" {
  name        = "solo-stage-tf-nlb-sg"
  description = "NLB allowing inbound access only"
  vpc_id      = data.terraform_remote_state.infrastructure_stage.outputs.vpc_id

  ingress {
    from_port   = 443
    protocol    = "TCP"
    to_port     = 443
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    protocol    = -1
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "solo_stage_tf_nlb_sg"
    Project = var.project
  }
}

// 6. Security Group for the application
resource "aws_security_group" "solo_stage_tf_app_sg" {
  name        = "solo-stage-tf-app-sg"
  description = "APP allowing inbound and outbound between nlb and app"
  vpc_id      = data.terraform_remote_state.infrastructure_stage.outputs.vpc_id

  egress {
    from_port   = 0
    protocol    = -1
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "solo_stage_tf_app_sg"
    Project = var.project
  }
}

// 7. Security group rule for the app ingress on port 443
resource "aws_security_group_rule" "solo_stage_tf_app_sg_ingress_rule_443" {
  security_group_id = aws_security_group.solo_stage_tf_app_sg.id

  type        = "ingress"
  protocol    = "TCP"
  cidr_blocks = ["0.0.0.0/0"]
  from_port   = 443
  to_port     = 443
}

// 8. Security group rule for the app ingress on port 80
resource "aws_security_group_rule" "solo_stage_tf_app_sg_ingress_rule_80" {
  security_group_id = aws_security_group.solo_stage_tf_app_sg.id

  type        = "ingress"
  protocol    = "TCP"
  cidr_blocks = ["0.0.0.0/0"]
  from_port   = 80
  to_port     = 80
}
