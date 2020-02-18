output "vpc_id" {
  value = data.terraform_remote_state.infrastructure_stage.outputs.vpc_id
}

output "ecs_cluter" {
  value = aws_ecs_cluster.solo_stage_tf_ecs_cluster.id
}

output "security_group" {
  value = aws_security_group.solo_stage_tf_sg.id
}

output "public_subnet" {
  value = data.terraform_remote_state.infrastructure_stage.outputs.public_subnet_id
}

output "private_subnet" {
  value = data.terraform_remote_state.infrastructure_stage.outputs.private_subnet_id
}

output "network_load_balancer" {
  value = aws_lb.solo_stage_tf_nlb.id
}

output "target_group_arn" {
  value = aws_lb_target_group.solo_stage_tf_nlb_target_group.arn
}

output "vpc_cidr_block" {
  value = data.terraform_remote_state.infrastructure_stage.outputs.vpc_cidr_block
}
