remote_state_bucket = "solo-stage-ecs-fargate-terraform-remote-state"
remote_state_key    = "STAGE/platform-stage.tfstate"
project             = "SOLO"
region              = "us-gov-west-1"

ecs_task_role     = "solo-fargate"
ecs_task_exe_role = "soloStageTaskExeRole"

application_service_name = "solo-stage-app"
worker_service_name      = "solo-stage-worker"
scheduler_service_name   = "solo-stage-scheduler"

backend_container_repo  = "solo-stage-backend"
frontend_container_repo = "solo-stage-frontend"
compression_container_repo = "solo-stage-compression-service"
