// vpc id
output "vpc_id" {
  value = aws_vpc.solo_stage_tf_vpc.id
}

output "nat_eip_1a" {
  value = aws_nat_gateway.solo_stage_tf_nat_gw_1a.allocation_id
}
output "nat_eip_1b" {
  value = aws_nat_gateway.solo_stage_tf_nat_gw_1b.allocation_id
}

// use to create security groups
output "vpc_cidr_block" {
  value = aws_vpc.solo_stage_tf_vpc.cidr_block
}

// use to create the autoscaling group
output "public_subnet_id_1a" {
  value = element(aws_subnet.solo_stage_tf_public_subnet.*.id, 0)
}
output "public_subnet_id_1b" {
  value = element(aws_subnet.solo_stage_tf_public_subnet.*.id, 1)
}

// use to create the autoscaling group
output "private_subnet_id_1a" {
  value = aws_subnet.solo_stage_tf_private_subnet_1a.id
}
output "private_subnet_id_1b" {
  value = aws_subnet.solo_stage_tf_private_subnet_1b.id
}