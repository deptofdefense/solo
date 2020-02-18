variable "region" {
  default = "us-gov-west-1"
}

variable "remote_state_bucket" {}
variable "remote_state_key" {}

variable "task_definition_name" {
  default = "solo_stage_tf_task"
}

variable "frontend_container_name" {
  default = "solo-stage-task-def-frontend"
}

variable "ecs_service_name" {
  default = "solo_stage_tf_ecs_service"
}

variable "solo_iam_role_name" {
  default = "solo-fargate"
}

variable "solo_repo_name" {
  default = "solo/frontend"
}

variable "memory" {
  default = "512"
}
variable "cpu" {
  default = "256"
}
variable "docker_container_port" {
  default = "80"
}

