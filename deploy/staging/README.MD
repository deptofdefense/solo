# AWS Architecture through Terraform

## Requirements
* AWS account
* Generate an IAM role
* Create a S3 bucket

## Sequence of events
The architecture is staged in `3.5` steps. The `3` main steps are infrastructure, 
platform, and application. The `.5` is the database. Follow the instructions in 
the README.MD in this folder order:
1. Infrastructure
1. Platform
1. Application

* Database is only used if there is a big change to the resources used for it. Also,
the Application will need to run again to ensure the Elastic Container Service catches
the updated database.