/*

Variables are inputs that are served as parameters.
The actual values are centrally stored in the tfvars.
This file will create or modify:

1.  VPC
2.  Public Subnet
3a. Private Subnet 1a
3b. Private Subnet 1b
4.  Public Route Table for the Public Subnet
5.  Private Route Table 1a for the Private Subnet 1a (1b will be used only for the RDS multiple
    availability zone requirement
6.  Associate Public Route Table to the Public Subnet
7.  Associate Private Route Table 1a to the Private Subnet 1a
8.  Internet Gateway (IGW) into the Internet
9.  Associate Public Route Table to the IGW
10. Network Address Translation Gateway (NAT GW) inside Public Subnet 1a for outbound traffic
11. Associate NAT GW 1a with Private Route Table 1a for communication


*/

variable "project" { description = "name of the project" }
variable "az_1a" { description = "Availability Zone 1a" }
variable "az_1b" { description = "Availability Zone 1b" }
variable "public_subnet" { description = "Public Subnet" }
variable "private_subnet_1a" { description = "Private Subnet 1a" }
variable "private_subnet_1b" { description = "Private Subnet 1a" }
variable "eip_nat_gw" { description = "This is the Egress for 1a" }
data "aws_eip" "eip_nat_gw" { id = var.eip_nat_gw }

provider "aws" {
  region = "us-gov-west-1"
}

// Keep the {} empty so variables will be passed in dynamically during initialization
terraform {
  backend "s3" {}
}

// 1. Virtual Private Cloud
resource "aws_vpc" "vpc" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name    = "solo_stage_tf_vpc"
    Project = var.project
  }
}

// 2. Public Subnet
resource "aws_subnet" "public" {
  cidr_block = var.public_subnet
  vpc_id     = aws_vpc.vpc.id

  tags = {
    Name    = "solo_stage_tf_public_subnet"
    Project = var.project
  }
}

// 3a. Private Subnet for 1a
resource "aws_subnet" "private_1a" {
  cidr_block        = var.private_subnet_1a
  vpc_id            = aws_vpc.vpc.id
  availability_zone = var.az_1a

  tags = {
    Name    = "solo_stage_tf_private_subnet_1a"
    Project = var.project
  }
}

// 3b. Private Subnet for 1b
resource "aws_subnet" "private_1b" {
  cidr_block        = var.private_subnet_1b
  vpc_id            = aws_vpc.vpc.id
  availability_zone = var.az_1b

  tags = {
    Name    = "solo_stage_tf_private_subnet_1b"
    Project = var.project
  }
}

// 4. Route Tables for Public Subnet
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.vpc.id

  tags = {
    Name    = "solo_stage_tf_public_rt_to_igw"
    Project = var.project
  }
}

// 5a. Route Tables for Private Subnet 1a
resource "aws_route_table" "private_rt_1a" {
  vpc_id = aws_vpc.vpc.id

  tags = {
    Name    = "solo_stage_tf_private_rt_to_nat_gw"
    Project = var.project
  }
}

// 6. Associate Route Table with the Public Subnet
resource "aws_route_table_association" "public_subnet_association" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public_rt.id
}

// 7. Associate Route Table with Private Subnet 1a
resource "aws_route_table_association" "private_subnet_association" {
  route_table_id = aws_route_table.private_rt_1a.id
  subnet_id      = aws_subnet.private_1a.id
}

// 8. Internet Gateway - only one is needed
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.vpc.id

  tags = {
    Name    = "solo_stage_tf_igw"
    Project = var.project
  }
}

// 9. Update Public Route Table with IGW
resource "aws_route" "public_igw_route" {
  route_table_id         = aws_route_table.public_rt.id
  gateway_id             = aws_internet_gateway.igw.id
  destination_cidr_block = "0.0.0.0/0"
}

// 10. Network Address Translation Gateway
resource "aws_nat_gateway" "nat" {
  allocation_id = data.aws_eip.eip_nat_gw.id
  subnet_id     = aws_subnet.public.id
  depends_on    = [data.aws_eip.eip_nat_gw]
  tags = {
    Name    = "solo_stage_tf_nat_gw_1a"
    Project = var.project
  }
}

// 11. NAT GW route
resource "aws_route" "nat_gw_rt" {
  route_table_id         = aws_route_table.private_rt_1a.id
  nat_gateway_id         = aws_nat_gateway.nat.id
  destination_cidr_block = "0.0.0.0/0"
}
