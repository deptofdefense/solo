output "rds_id" {
  value = aws_db_instance.solo_stage_tf_db.id
}

output "rds_hostname" {
  value = aws_db_instance.solo_stage_tf_db.address
}

output "rds_db_name" {
  value = aws_db_instance.solo_stage_tf_db.name
}

output "rds_subnet_group" {
  value = aws_db_subnet_group.solo_stage_tf_db_sg.id
}
output "security_group_rds" {
  value = aws_security_group.solo_stage_tf_rds_sg.id
}