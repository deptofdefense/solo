# 1. Store State Remotely in S3 bucket for
terraform {}

# 2. create infrastructure as code

variable "region" {
    default     = "us-gov-west-1"
    description = "AWS Region"
}

variable "availability_zone" {
    default = "us-gov-west-1a"
}

variable "solo_stage_tf_vpc_cidr" {
    default     = "10.0.0.0/16"
    description = "VPC CIDR Block"
}

// the ip range will be passed in as a variable in stage.tfvars
variable "solo_stage_tf_public_subnet" {
    description = "Public Subnet"
}

// the ip range will be passed in as a variable in stage.tfvars
variable "solo_stage_tf_private_subnet" {
    description = "Private Subnet"
}
