// Variables that will be passed through CLI

region                 = "us-gov-west-1"
project                = "SOLO"
solo_stage_tf_vpc_cidr = "10.0.0.0/16"

// CIDR /24 gives 254 usable hosts
solo_stage_tf_public_subnet_1a  = "10.0.5.0/24"
solo_stage_tf_public_subnet_1b  = "10.0.7.0/24"
solo_stage_tf_private_subnet_1a = "10.0.6.0/24"
solo_stage_tf_private_subnet_1b = "10.0.8.0/24"

// IGW destination cidr block for the out to hit it
igw_cidr_block = "0.0.0.0/0"

// NAT GW Egress EIP
nat_eip_1a = "eipalloc-1dd95820"
nat_eip_1b = "eipalloc-45fa7c78"

// Availability Zones
availability_zone_1a = "us-gov-west-1a"
availability_zone_1b = "us-gov-west-1b"

zones                   = ["us-gov-west-1a", "us-gov-west-1b"]
public_subnet_tag_names = ["solo_stage_tf_public_subnet_1a", "solo_stage_tf_public_subnet_1b"]
public_subnet_cidr      = ["10.0.5.0/24", "10.0.7.0/24"]
