/*

Variables are inputs that are served as parameters.
The actual values are centrally stored in the tfvars.
This file will create or modify:

1.   VPC
2.   Public Subnet (consisting of Availability Zone 1a and 1b)
3a.  Private Subnet 1a
3b.  Private Subnet 1b
4.   Public Route Table for the Public Subnet
5a.  Private Route Table 1a for the Private Subnet 1a
5b.  Private Route Table 1b for the Private Subnet 1b
6.   Associate Public Route Table to the Public Subnet (1a and 1b)
7a.  Associate Private Route Table 1a to the Private Subnet 1a
7b.  Associate Private Route Table 1b to the Private Subnet 1b
8.   Internet Gateway into the Internet
9.   Associate Public Route Table to the IGW
10a. Network Address Translation Gateway (NAT GW) inside Public Subnet 1a for outbound traffic
10b. Network Address Translation Gateway (NAT GW) inside Public Subnet 1b for outbound traffic
11a. Associate NAT GW 1a with Private Route Table 1a for communication
11b. Associate NAT GW 1b with Private Route Table 1b for communication


*/

variable "region" { description = "AWS Region" }
variable "project" { description = "name of the project" }
variable "availability_zone_1a" { description = "Availability Zone 1a" }
variable "availability_zone_1b" { description = "Availability Zone 1b" }
variable "solo_stage_tf_vpc_cidr" { description = "VPC CIDR Block" }
variable "solo_stage_tf_public_subnet_1a" { description = "Public Subnet 1a" }
variable "solo_stage_tf_public_subnet_1b" { description = "Public Subnet 1b" }
variable "solo_stage_tf_private_subnet_1a" { description = "Private Subnet 1a" }
variable "solo_stage_tf_private_subnet_1b" { description = "Private Subnet 1a" }
variable "nat_eip_1a" { description = "This is the Egress for 1a" }
variable "nat_eip_1b" { description = "This is the Egress for 1b" }
variable "igw_cidr_block" { description = "IWG to have outside hit it" }
variable "zones" { type = list(string) }
variable "public_subnet_tag_names" { type = list(string) }
variable "public_subnet_cidr" { type = list(string) }

// Access already created EIP from AWS
data "aws_eip" "solo_stage_tf_eip_for_nat_gw_1a" { id = var.nat_eip_1a }
data "aws_eip" "solo_stage_tf_eip_for_nat_gw_1b" { id = var.nat_eip_1b }

provider "aws" {
  region = var.region
}

// Keep the {} empty so variables will be passed in dynamically during initialization
terraform {
  backend "s3" {}
}

// 1. Virtual Private Cloud
resource "aws_vpc" "solo_stage_tf_vpc" {
  cidr_block = var.solo_stage_tf_vpc_cidr

  tags = {
    Name    = "solo_stage_tf_vpc"
    Project = var.project
  }
}

// 2. Public Subnet (1a and 1b)
resource "aws_subnet" "solo_stage_tf_public_subnet" {
  count             = length(var.public_subnet_cidr)
  vpc_id            = aws_vpc.solo_stage_tf_vpc.id
  availability_zone = var.zones[count.index]
  cidr_block        = var.public_subnet_cidr[count.index]

  tags = {
    Name    = var.public_subnet_tag_names[count.index]
    Project = var.project
  }
}

// 3a. Private Subnet for 1a
resource "aws_subnet" "solo_stage_tf_private_subnet_1a" {
  cidr_block        = var.solo_stage_tf_private_subnet_1a
  vpc_id            = aws_vpc.solo_stage_tf_vpc.id
  availability_zone = var.availability_zone_1a

  tags = {
    Name    = "solo_stage_tf_private_subnet_1a"
    Project = var.project
  }
}

// 3b. Private Subnet for 1b
resource "aws_subnet" "solo_stage_tf_private_subnet_1b" {
  cidr_block        = var.solo_stage_tf_private_subnet_1b
  vpc_id            = aws_vpc.solo_stage_tf_vpc.id
  availability_zone = var.availability_zone_1b

  tags = {
    Name    = "solo_stage_tf_private_subnet_1b"
    Project = var.project
  }
}

// 4. Route Tables for Public Subnet - only one is needed
resource "aws_route_table" "solo_stage_tf_public_route_table" {
  vpc_id = aws_vpc.solo_stage_tf_vpc.id

  tags = {
    Name    = "solo_stage_tf_public_rt_to_igw"
    Project = var.project
  }
}

// 5a. Route Tables for Private Subnet 1a
resource "aws_route_table" "solo_stage_tf_private_route_table_1a" {
  vpc_id = aws_vpc.solo_stage_tf_vpc.id

  tags = {
    Name    = "solo_stage_tf_private_rt_1a_to_nat_gw"
    Project = var.project
  }
}

// 5b. Route Tables for Private Subnet 1b
resource "aws_route_table" "solo_stage_tf_private_route_table_1b" {
  vpc_id = aws_vpc.solo_stage_tf_vpc.id

  tags = {
    Name    = "solo_stage_tf_private_rt_1b_to_nat_gw"
    Project = var.project
  }
}

// 6. Associate Route Table with the single Public Subnet which holds 1a and 1b
resource "aws_route_table_association" "solo_stage_tf_public_subnet_association" {
  count          = length(var.public_subnet_cidr)
  subnet_id      = element(aws_subnet.solo_stage_tf_public_subnet.*.id, count.index)
  route_table_id = aws_route_table.solo_stage_tf_public_route_table.id
}

// 7a. Associate Route Table with Private Subnet 1a
resource "aws_route_table_association" "solo_stage_tf_private_subnet_association_1a" {
  route_table_id = aws_route_table.solo_stage_tf_private_route_table_1a.id
  subnet_id      = aws_subnet.solo_stage_tf_private_subnet_1a.id
}

// 7b. Associate Route Table with Private Subnet 1b
resource "aws_route_table_association" "solo_stage_tf_private_subnet_association_1b" {
  route_table_id = aws_route_table.solo_stage_tf_private_route_table_1b.id
  subnet_id      = aws_subnet.solo_stage_tf_private_subnet_1b.id
}

// 8. Internet Gateway - only one is needed
resource "aws_internet_gateway" "solo_stage_tf_igw" {
  vpc_id = aws_vpc.solo_stage_tf_vpc.id

  tags = {
    Name    = "solo_stage_tf_igw"
    Project = var.project
  }
}

// 9. Update Public Route Table with IGW
resource "aws_route" "solo_stage_tf_public_igw_route" {
  route_table_id         = aws_route_table.solo_stage_tf_public_route_table.id
  gateway_id             = aws_internet_gateway.solo_stage_tf_igw.id
  destination_cidr_block = "0.0.0.0/0"
}

// 10. Network Address Translation Gateway
// https://docs.aws.amazon.com/vpc/latest/userguide/vpc-ug.pdf#NAT
// created inside the public 1a subnet
resource "aws_nat_gateway" "solo_stage_tf_nat_gw_1a" {
  allocation_id = data.aws_eip.solo_stage_tf_eip_for_nat_gw_1a.id

  //  This is the subnet where it will resides which is in Public
  subnet_id = element(aws_subnet.solo_stage_tf_public_subnet.*.id, 0)

  tags = {
    Name    = "solo_stage_tf_nat_gw_1a"
    Project = var.project
  }
  depends_on = [data.aws_eip.solo_stage_tf_eip_for_nat_gw_1a]
}

// created inside the public 1b subnet
resource "aws_nat_gateway" "solo_stage_tf_nat_gw_1b" {
  allocation_id = data.aws_eip.solo_stage_tf_eip_for_nat_gw_1b.id

  //  This is the subnet where it will resides which is in Public
  subnet_id = element(aws_subnet.solo_stage_tf_public_subnet.*.id, 1)

  tags = {
    Name    = "solo_stage_tf_nat_gw_1b"
    Project = var.project
  }
  depends_on = [data.aws_eip.solo_stage_tf_eip_for_nat_gw_1b]
}

// 11. Associate NAT with Route Table
resource "aws_route" "solo_stage_tf_nat_gw_route_1a" {

  //  Associated with the Private route table for 1a
  route_table_id = aws_route_table.solo_stage_tf_private_route_table_1a.id
  nat_gateway_id = aws_nat_gateway.solo_stage_tf_nat_gw_1a.id

  //  allows traffic from the private resource to the outside world only oneway
  destination_cidr_block = var.igw_cidr_block
}

resource "aws_route" "solo_stage_tf_nat_gw_route_1b" {

  //  Associated with the Private route table for 1b
  route_table_id = aws_route_table.solo_stage_tf_private_route_table_1b.id
  nat_gateway_id = aws_nat_gateway.solo_stage_tf_nat_gw_1b.id

  //  allows traffic from the private resource to the outside world only oneway
  destination_cidr_block = var.igw_cidr_block
}