# Terraform Application setup

1. `terraform init -backend-config=application-stage.config`
1. `terraform validate`
1. `terraform fmt`
1. `tflint`
1. `terraform plan -var-file=application-stage.tfvars`
1. `terraform apply -auto-approve -var-file=application-stage.tfvars`
