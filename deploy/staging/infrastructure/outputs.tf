// vpc id
output "vpc_id" {
  value = aws_vpc.solo_stage_tf_vpc.id
}

output "aws_eip" {
  value = aws_nat_gateway.solo_stage_tf_nat_gw.allocation_id
}

// use to create security groups
output "vpc_cidr_block" {
  value = aws_vpc.solo_stage_tf_vpc.cidr_block
}

// use to create the autoscaling group
output "public_subnet_id" {
  value = aws_subnet.solo_stage_tf_public_subnet.id
}

// use to create the autoscaling group
output "private_subnet_id" {
  value = aws_subnet.solo_stage_tf_private_subnet.id
}