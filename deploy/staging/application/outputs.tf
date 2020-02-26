output "task_def_id" {
  value = aws_ecs_task_definition.solo_stage_tf_ecs_td_application.id
}

output "ecs_service_id" {
  value = aws_ecs_service.solo_stage_tf_ecs_service.id
}

output "cloudwatch_backend_id" {
  value = aws_cloudwatch_log_group.solo_stage_tf_backend_cw_lg.id
}

output "cloudwatch_frontend_id" {
  value = aws_cloudwatch_log_group.solo_stage_tf_frontend_cw_lg.id
}