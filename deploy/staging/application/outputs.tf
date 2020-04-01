output "app_task_def_id" {
  value = aws_ecs_task_definition.app_task_def.id
}

output "app_service_id" {
  value = aws_ecs_service.app_service.id
}

output "cloudwatch_backend_id" {
  value = aws_cloudwatch_log_group.application_cw_lg.id
}

output "cloudwatch_frontend_id" {
  value = aws_cloudwatch_log_group.worker_cw_lg.id
}

output "cloudwatch_worker_id" {
  value = aws_cloudwatch_log_group.scheduler_cw_lg.id
}
