output "vpc_id" {
  value = data.terraform_remote_state.infrastructure_stage.outputs.vpc_id
}
output "ecs_cluter" {
  value = aws_ecs_cluster.ecs_cluster.id
}
output "ecs_cluster_name" {
  value = aws_ecs_cluster.ecs_cluster.name
}
output "security_group_nlb" {
  value = aws_security_group.nlb_sg.id
}
output "security_group_app" {
  value = aws_security_group.app_sg.id
}
output "public_subnet_id" {
  value = data.terraform_remote_state.infrastructure_stage.outputs.public_subnet_id
}
output "private_subnet_1a_id" {
  value = data.terraform_remote_state.infrastructure_stage.outputs.private_subnet_1a_id
}
output "private_subnet_1b_id" {
  value = data.terraform_remote_state.infrastructure_stage.outputs.private_subnet_1b_id
}
output "network_load_balancer" {
  value = aws_lb.nlb.id
}
output "target_group_arn" {
  value = aws_lb_target_group.nlb_target_group.arn
}

output "compression_instance_sg" {
  value = aws_security_group.compression_instance_sg.id
}
output "compression_nlb_dns_name" {
  value = aws_lb.compression_nlb.dns_name
}
output "compression_tg_arn" {
  value = aws_lb_target_group.compression_tg.arn
}
