/*

Variables are inputs that are served as parameters.
The actual values are centrally stored in the tfvars.
This file will create or modify:

1. ECS Cluster
2. Network Load Balancer
3. NLB Target Group
4. NLB Listener on port 443
5. Security Group for the nlb
6. Security Group for the application
7. Security group rule for the application ingress on port 443

*/

variable "region" { description = "AWS Region" }
variable "project" { description = "Name of the project" }
variable "remote_state_bucket" { description = "S3 bucket location" }
variable "remote_state_key" { description = "S3 bucket key" }
variable "eip_nlb" { description = "Network LB static ip for az 1a" }

// Access already created parameter store secert values and EIPs from AWS
data "aws_ssm_parameter" "db_username" { name = "/solo/stage/POSTGRES_USER" }
data "aws_ssm_parameter" "db_password" { name = "/solo/stage/POSTGRES_PASSWORD" }
data "aws_eip" "eip_nlb" { id = var.eip_nlb }

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
resource "aws_ecs_cluster" "ecs_cluster" {
  name = "solo_stage_tf_ecs_cluster"

  tags = {
    Name : "solo_stage_tf_ecs_cluster"
    Project : var.project
  }
}

// 2. app nlb
resource "aws_lb" "nlb" {
  name               = "solo-stage-tf-nlb"
  internal           = false
  load_balancer_type = "network"

  subnet_mapping {
    subnet_id     = data.terraform_remote_state.infrastructure_stage.outputs.public_subnet_id
    allocation_id = data.aws_eip.eip_nlb.id
  }

  tags = {
    Name    = "solo_stage_tf_nlb"
    Project = var.project
  }
}

// 3. app target group
resource "aws_lb_target_group" "nlb_target_group" {
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
resource "aws_lb_listener" "nlb_listener_443" {
  load_balancer_arn = aws_lb.nlb.arn
  protocol          = "TCP"
  port              = 443

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.nlb_target_group.arn
  }
}

// 5. Security Group for the NLB
resource "aws_security_group" "nlb_sg" {
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
resource "aws_security_group" "app_sg" {
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
resource "aws_security_group_rule" "app_sg_ingress_rule_443" {
  security_group_id = aws_security_group.app_sg.id

  type        = "ingress"
  protocol    = "TCP"
  cidr_blocks = ["0.0.0.0/0"]
  from_port   = 443
  to_port     = 443
}


/////////////////////////////////////////////////////////
//
//                  COMPRESSION
//
/////////////////////////////////////////////////////////
resource "aws_lb" "compression_nlb" {
  name               = "solo-stage-compression-nlb"
  internal           = true
  load_balancer_type = "network"

  subnet_mapping {
    subnet_id = data.terraform_remote_state.infrastructure_stage.outputs.public_subnet_id
  }

  tags = {
    Name    = "solo-stage-compression-nlb"
    Project = var.project
  }
}

resource "aws_lb_target_group" "compression_tg" {
  name     = "solo-stage-compression-tg"
  protocol = "TCP"
  vpc_id   = data.terraform_remote_state.infrastructure_stage.outputs.vpc_id
  port     = 8080

  health_check {
    enabled  = true
    interval = 30
    protocol = "TCP"
  }

  tags = {
    Name    = "solo-stage-compression-tg"
    Project = var.project
  }
}

resource "aws_lb_listener" "compression_nlb_listener" {
  load_balancer_arn = aws_lb.compression_nlb.arn
  protocol          = "TCP"
  port              = 80

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.compression_tg.arn
  }
}

resource "aws_security_group" "compression_nlb_sg" {
  name   = "solo-stage-compression-nlb-sg"
  vpc_id = data.terraform_remote_state.infrastructure_stage.outputs.vpc_id

  ingress {
    from_port   = 80
    protocol    = "TCP"
    to_port     = 80
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "solo-stage-compression-nlb-sg"
    Project = var.project
  }
}

resource "aws_security_group" "compression_instance_sg" {
  name   = "solo-stage-compression-intance-sg"
  vpc_id = data.terraform_remote_state.infrastructure_stage.outputs.vpc_id

  ingress {
    from_port   = 8080
    protocol    = "TCP"
    to_port     = 8080
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "solo-stage-compression-instance-sg"
    Project = var.project
  }
}
