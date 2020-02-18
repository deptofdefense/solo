variable "region" {
    default     = "us-gov-west-1"
    description = "AWS Region"
}

variable "remote_state_bucket" {}
variable "remote_state_key" {}
variable "internet_cidr_block" {}

variable "availability_zone" {
    default = "us-gov-west-1a"
}

