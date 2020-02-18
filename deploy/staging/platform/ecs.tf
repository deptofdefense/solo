provider "aws" {
  region = var.region
}

terraform {
  backend "s3" {}
}

// Implement backend configuration
// Keep the {} empty so variables will be passed in dynamically during initialization
// reads in infrastructure stage IOT use the outputs defined in the infrastructre directory
data "terraform_remote_state" "infrastructure_stage" {
  backend = "s3"

  config = {
  bucket = var.remote_state_bucket
  key    = var.remote_state_key
  region = var.region
  }
}

data "aws_eip" "solo_stage_tf_eip_for_nlb" {
  id = "eipalloc-64e66759"
}

// 1. Create ECS Cluster
resource "aws_ecs_cluster" "solo_stage_tf_ecs_cluster" {
  name = "solo_stage_tf_ecs_cluster"
}

// 2. Create Network Load Balancer
resource "aws_lb" "solo_stage_tf_nlb" {
  name               = "solo-stage-tf-nlb"
  internal           = false
  load_balancer_type = "network"

  subnet_mapping {
    subnet_id     = data.terraform_remote_state.infrastructure_stage.outputs.public_subnet_id
    allocation_id = data.aws_eip.solo_stage_tf_eip_for_nlb.id
  }

  tags = {
    Name    = "solo_stage_tf_nlb"
    Project = "SOLO"
  }
}

// 3. Create NLB Target Group
resource "aws_lb_target_group" "solo_stage_tf_nlb_target_group" {
  name        = "solo-stage-tf-nlb-target-group"
  port        = 80
  protocol    = "TCP"
  target_type = "ip"
  vpc_id      = data.terraform_remote_state.infrastructure_stage.outputs.vpc_id

  tags = {
    Name    = "solo_stage_tf_nlb_target_group"
    Project = "SOLO"
  }
}

// 4. Create NLB Listener
resource "aws_lb_listener" "solo_stage_tf_nlb_listener" {
  load_balancer_arn = aws_lb.solo_stage_tf_nlb.arn
  port              = 80
  protocol          = "TCP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.solo_stage_tf_nlb_target_group.arn
  }
}

// 5. Create Security Group for the SOLO VPC
resource "aws_security_group" "solo_stage_tf_sg" {
  name        = "solo-stage-tf-sg"
  description = "Security Group allowing inbound access only"
  vpc_id      = data.terraform_remote_state.infrastructure_stage.outputs.vpc_id

  ingress {
    from_port   = 80
    protocol    = "TCP"
    to_port     = 80
    cidr_blocks = [var.internet_cidr_block]
  }

  egress {
    from_port   = 0
    protocol    = "-1"
    to_port     = 0
    cidr_blocks = [var.internet_cidr_block]
  }

  tags = {
    Name    = "solo_stage_tf_sg"
    Project = "SOLO"
  }
}