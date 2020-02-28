output "rds_id" {
  value = aws_db_instance.db.id
}

output "rds_hostname" {
  value = aws_db_instance.db.address
}

output "rds_db_name" {
  value = aws_db_instance.db.name
}

output "rds_subnet_group" {
  value = aws_db_subnet_group.db_sg.id
}
output "security_group_rds" {
  value = aws_security_group.rds_sg.id
}