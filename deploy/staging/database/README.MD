# Terraform Platform 
1. `terraform init -backend-config=database-stage.config`
1. `terraform fmt`
1. `terraform validate`
1. `tflint`
1. `terraform plan -var-file=database-stage.tfvars`
1. `terraform appy -auto-approve -var-file=database-stage.tfvars`