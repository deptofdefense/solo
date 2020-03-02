output "task_def_id" {
  value = aws_ecs_task_definition.ecs_td_application.id
}

output "ecs_service_id" {
  value = aws_ecs_service.ecs_service.id
}

output "cloudwatch_backend_id" {
  value = aws_cloudwatch_log_group.backend_cw_lg.id
}

output "cloudwatch_frontend_id" {
  value = aws_cloudwatch_log_group.frontend_cw_lg.id
}

output "cloudwatch_worker_id" {
  value = aws_cloudwatch_log_group.worker_cw_lg.id
}
