provider "aws" {
  region = var.region
}

// Implement backend configuration
// Keep the {} empty so variables will be passed in dynamically during initialization
terraform {
  backend "s3" {}
}

// Resource block defines a resource that exists within the infrastructure
// In this case, the creation or modification of AWS resources

// 1. Virtual Private Cloud
resource "aws_vpc" "solo_stage_tf_vpc" {
  cidr_block = var.solo_stage_tf_vpc_cidr

  tags = {
    Name    = "solo_stage_tf_vpc"
    Project = "SOLO"
  }
}

// 2. Public Subnet
resource "aws_subnet" "solo_stage_tf_public_subnet" {
  cidr_block        = var.solo_stage_tf_public_subnet
  vpc_id            = aws_vpc.solo_stage_tf_vpc.id
  availability_zone = var.availability_zone

  tags = {
    Name    = "solo_stage_tf_public_subnet"
    Project = "SOLO"
  }
}

// 3. Private Subnet
resource "aws_subnet" "solo_stage_tf_private_subnet" {
  cidr_block        = var.solo_stage_tf_private_subnet
  vpc_id            = aws_vpc.solo_stage_tf_vpc.id
  availability_zone = var.availability_zone

  tags = {
    Name    = "solo_stage_tf_private_subnet"
    Project = "SOLO"
  }
}

// 4. Route Tables for Public Subnet
resource "aws_route_table" "solo_stage_tf_public_route_table" {
  vpc_id    = aws_vpc.solo_stage_tf_vpc.id

  tags = {
    Name    = "solo_stage_tf_public_route_table"
    Project = "SOLO"
  }
}

// 5. Route Tables for Private Subnet
resource "aws_route_table" "solo_stage_tf_private_route_table" {
  vpc_id    = aws_vpc.solo_stage_tf_vpc.id

  tags = {
    Name    = "solo_stage_tf_private_route_table"
    Project = "SOLO"
  }
}

// 6. Associate Route Table with Public Subnet
resource "aws_route_table_association" "solo_stage_tf_public_subnet_association" {
  route_table_id = aws_route_table.solo_stage_tf_public_route_table.id
  subnet_id      = aws_subnet.solo_stage_tf_public_subnet.id
}

// 7. Associate Route Table with Private Subnet
resource "aws_route_table_association" "solo_stage_tf_private_subnet_association" {
  route_table_id = aws_route_table.solo_stage_tf_private_route_table.id
  subnet_id      = aws_subnet.solo_stage_tf_private_subnet.id
}

// 8. Internet Gateway
resource "aws_internet_gateway" "solo_stage_tf_igw" {
  vpc_id = aws_vpc.solo_stage_tf_vpc.id

  tags = {
    Name    = "solo_stage_tf_igw"
    Project = "SOLO"
  }
}

// 9. Update Public Route Table with IGW
resource "aws_route" "solo_stage_tf_public_igw_route" {
  route_table_id         = aws_route_table.solo_stage_tf_public_route_table.id
  gateway_id             = aws_internet_gateway.solo_stage_tf_igw.id
  destination_cidr_block = "0.0.0.0/0"
}

// 10. Network Address Translation Gateway
// Access already created EIP from AWS
data "aws_eip" "solo_stage_tf_eip_for_nat_gw" {
  id = "eipalloc-98f574a5"
}
resource "aws_nat_gateway" "solo_stage_tf_nat_gw" {
  allocation_id = data.aws_eip.solo_stage_tf_eip_for_nat_gw.id
  subnet_id     = aws_subnet.solo_stage_tf_public_subnet.id

  tags = {
    Name    = "solo_stage_tf_nat_gw"
    Project = "SOLO"
  }
  depends_on = [data.aws_eip.solo_stage_tf_eip_for_nat_gw]
}

// 11. Associate NAT with Route Table
resource "aws_route" "solo_stage_tf_nat_gw_route" {
  route_table_id = aws_route_table.solo_stage_tf_private_route_table.id
  nat_gateway_id = aws_nat_gateway.solo_stage_tf_nat_gw.id

//  allows traffic from the private resource to the outside world only oneway
  destination_cidr_block = "0.0.0.0/0"
}