# Terraform Platform 
1. `terraform init -backend-config=platform-stage.config`
1. `terraform validate`
1. `tflint`
1. `terraform plan -var-file=platform-stage.tfvars`
1. `terraform appy -auto-approve -var-file=platform-stage.tfvars`