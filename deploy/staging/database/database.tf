/*

Variables are inputs that are served as parameters.
The actual values are centrally stored in the tfvars.
This file will create or modify:

// 1. Security group for the Relational Database
// 2. Relational Database utilizing postgres
// 3. Systems Manager parameter store to send the postgres host address
// 4. Systems Manager parameter store to send the postgres database name
// 5. Database subnet group with two availability zone (private subnet 1b is only used as a filler subnet)

*/

// Used to create a timestamp with correct
locals {
  timestamp           = "${timestamp()}"
  timestamp_sanitized = "${replace("${local.timestamp}", "/[- TZ:]/", "")}"
}

variable "region" { description = "AWS Region" }
variable "project" { description = "Name of the project" }
variable "remote_state_bucket" { description = "Remote State Bucket for s3" }
variable "remote_state_key" { description = "Remote State Key for s3" }
data "aws_ssm_parameter" "db_username" { name = "/solo/stage/POSTGRES_USER" }
data "aws_ssm_parameter" "db_password" { name = "/solo/stage/POSTGRES_PASSWORD" }

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

// 1. Security group for the Relational Database
resource "aws_security_group" "rds_sg" {
  name        = "solo-stage-tf-rds-sg"
  description = "RDS allowing access between app and rds"
  vpc_id      = data.terraform_remote_state.platform_stage.outputs.vpc_id

  ingress {
    from_port       = 5432
    protocol        = "TCP"
    to_port         = 5432
    security_groups = [data.terraform_remote_state.platform_stage.outputs.security_group_app]
  }

  egress {
    from_port   = 0
    protocol    = -1
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Name    = "solo_stage_tf_rds_sg"
    Project = var.project
  }
}

// 2. Relational Database utilizing postgres
resource "aws_db_instance" "db" {
  identifier                = "solo-stage-tf-db"
  instance_class            = "db.t2.small"
  allocated_storage         = 20
  max_allocated_storage     = 1000
  storage_type              = "gp2"
  engine                    = "postgres"
  engine_version            = "11.5"
  skip_final_snapshot       = false
  final_snapshot_identifier = "solo-stage-final-snapshot-${local.timestamp_sanitized}"
  availability_zone         = "us-gov-west-1a"
  multi_az                  = false

  // database information
  name     = "solodb"
  username = data.aws_ssm_parameter.db_username.value
  password = data.aws_ssm_parameter.db_password.value
  port     = 5432

  //  List of VPC security groups to associate
  vpc_security_group_ids = [aws_security_group.rds_sg.id]

  //  DB instance will be created in the VPC associated with the DB subnet group.
  db_subnet_group_name = aws_db_subnet_group.db_sg.id

  tags = {
    Name    = "solo_stage_tf_db"
    Project = var.project
  }
}

// 3. Systems Manager parameter store to send the postgres host address
resource "aws_ssm_parameter" "solo_stage_tf_send_rds_host" {
  name  = "/solo/stage/POSTGRES_HOST"
  type  = "String"
  value = aws_db_instance.db.address

  tags = {
    Project = var.project
  }
}

// 4. Systems Manager parameter store to send the postgres database name
resource "aws_ssm_parameter" "solo_stage_tf_send_rds_name" {
  name  = "/solo/stage/POSTGRES_DB"
  type  = "String"
  value = aws_db_instance.db.name
}

// 5. Database subnet group with two availability zone (private subnet 1b is only used as a filler subnet)
resource "aws_db_subnet_group" "db_sg" {
  name        = "solo_stage_tf_db_sg"
  description = "Postgres DB subnet group"

  //  If the subnets are part of a VPC that doesn’t have an Internet gateway attached to it, the DB instance is private.
  //  This will only be accessed within the private subnet and not to the public
  subnet_ids = [data.terraform_remote_state.platform_stage.outputs.private_subnet_1a_id, data.terraform_remote_state.platform_stage.outputs.private_subnet_1b_id]

  tags = {
    Name    = "solo_stage_tf_db_sg"
    Project = var.project
  }
}
