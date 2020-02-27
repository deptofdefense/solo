// Remote State
remote_state_bucket = "solo-stage-ecs-fargate-terraform-remote-state"
remote_state_key    = "STAGE/infrastructure-stage.tfstate"
region              = "us-gov-west-1"
project             = "SOLO"

internet_cidr_block = "0.0.0.0/0"

availability_zone = ["us-gov-west-1a", "us-gov-west-1b"]
nlb_eip_1a        = "eipalloc-00df5e3d"
nlb_eip_1b        = "eipalloc-fe8f05c3"
