output "vpc_id" {
  value = aws_vpc.vpc.id
}
output "eip_nat_gw" {
  value = aws_nat_gateway.nat.allocation_id
}
output "public_subnet_id" {
  value = aws_subnet.public.id
}
output "private_subnet_1a_id" {
  value = aws_subnet.private_1a.id
}
output "private_subnet_1b_id" {
  value = aws_subnet.private_1b.id
}
