#!/bin/bash
installTerraform(){
    set -eux
    wget https://releases.hashicorp.com/terraform/0.12.20/terraform_0.12.20_linux_amd64.zip;
    unzip terraform_0.12.20_linux_amd64.zip -d terraform;
    sudo mv terraform/terraform /usr/local/bin;
   
}
configureAWS(){
    aws configure set aws_access_key_id ${AWS_ACCESS_KEY_ID};
    aws configure set aws_secret_access_key ${AWS_SECRET_ACCESS_KEY};
}
pushFrontendToECR(){
    cd ../../frontend;
    $(aws ecr get-login --no-include-email --region us-gov-west-1);
    docker build -t frontend .;
    docker tag frontend:latest 187588058266.dkr.ecr.us-gov-west-1.amazonaws.com/solo/frontend:latest;
    docker push 187588058266.dkr.ecr.us-gov-west-1.amazonaws.com/solo/frontend:latest;
    cd ../deploy/staging;
}
runTerraform(){
    local dir_name=$1;
    cd $dir_name;
    terraform init -backend-config=$dir_name-stage.config;
    terraform validate;
    terraform plan -var-file=$dir_name-stage.tfvars;
    terraform apply -auto-approve -var-file=$dir_name-stage.tfvars;
    cd ..;
}
createInfrastructure(){
    runTerraform "infrastructure" #directory to traverse into from staging dir
}
createPlatform(){
    runTerraform "platform" #directory to traverse into from staging dir
}
createApplication(){
    runTerraform "application" # directory to traverse into from staging dir
}
installTerraform;
aws --version;
terraform --version;
configureAWS;
#pushFrontendToECR;
createInfrastructure;
createPlatform;
createApplication;

