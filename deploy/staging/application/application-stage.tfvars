remote_state_bucket       = "solo-stage-ecs-fargate-terraform-remote-state"
remote_state_key          = "STAGE/platform-stage.tfstate"
project                   = "SOLO"
internet_cidr_block       = "0.0.0.0/0"
region                    = "us-gov-west-1"
solo_iam_role_name        = "solo-fargate"
ecs_task_def_service_name = "solo_stage_tf_service_application"
task_definition_name      = "solo_stage_tf_task"
solo_iam_task_exe_role    = "soloStageTaskExeRole"
backend_container_name    = "solo-stage-tf-backend-container-name"
frontend_container_name   = "solo-stage-tf-frontend-container-name"
backend_repo_name         = "solo-stage-backend"
frontend_repo_name        = "solo-stage-frontend"
memory                    = "1024"
cpu                       = "512"
docker_container_port     = "8000"