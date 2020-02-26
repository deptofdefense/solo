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

// 9. Security group for the Relational Database
resource "aws_security_group" "solo_stage_tf_rds_sg" {
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

// 10. Creates the Amazon Relational Database as postgres inside the VPC
resource "aws_db_instance" "solo_stage_tf_db" {
  identifier            = "solo-stage-tf-db"
  instance_class        = "db.t2.small"
  allocated_storage     = 20
  max_allocated_storage = 1000
  storage_type          = "gp2"
  engine                = "postgres"
  engine_version        = "11.5"
  //  storage_encrypted      = true
  skip_final_snapshot       = true
  final_snapshot_identifier = "solo-stage-tf-db-micro"

  //  DO NOT COMMIT THIS
  name     = "solodb"
  username = data.aws_ssm_parameter.db_username.value
  password = data.aws_ssm_parameter.db_password.value
  port     = 5432
  //

  //  List of VPC security groups to associate
  vpc_security_group_ids = [aws_security_group.solo_stage_tf_rds_sg.id]

  //  DB instance will be created in the VPC associated with the DB subnet group.
  db_subnet_group_name = aws_db_subnet_group.solo_stage_tf_db_sg.id

  tags = {
    Name    = "solo_stage_tf_db"
    Project = var.project
  }
}

// 11. Create a Systems Manager parameter store to send the postgres host address
resource "aws_ssm_parameter" "solo_stage_tf_send_rds_host" {
  name  = "/solo/stage/POSTGRES_HOST"
  type  = "String"
  value = aws_db_instance.solo_stage_tf_db.address

  tags = {
    Project = var.project
  }
}

// 12. Create a Systems Manager parameter store to send the postgres database name
resource "aws_ssm_parameter" "solo_stage_tf_send_rds_name" {
  name  = "/solo/stage/POSTGRES_DB"
  type  = "String"
  value = aws_db_instance.solo_stage_tf_db.name
}

// 13. Databas subnet group
resource "aws_db_subnet_group" "solo_stage_tf_db_sg" {
  name        = "db_sg"
  description = "Postgres DB subnet group"

  //  If the subnets are part of a VPC that doesn’t have an Internet gateway attached to it, the DB instance is private.
  //  This will only be accessed within the private subnet and not to the public
  subnet_ids = [data.terraform_remote_state.platform_stage.outputs.private_subnet_1a, data.terraform_remote_state.platform_stage.outputs.private_subnet_1b]

  tags = {
    Name    = "solo_stage_tf_db_sg"
    Project = var.project
  }
}
