#!/bin/bash
installTerraform(){
    set -eux
    wget https://releases.hashicorp.com/terraform/0.12.21/terraform_0.12.21_linux_amd64.zip;
    unzip terraform_0.12.21_linux_amd64.zip -d terraform;
    sudo mv terraform/terraform /usr/local/bin; 
}
configureAWS(){
    aws configure set aws_access_key_id ${AWS_ACCESS_KEY_ID};
    aws configure set aws_secret_access_key ${AWS_SECRET_ACCESS_KEY};
    $(aws ecr get-login --no-include-email --region us-gov-west-1);

}

pushFrontendToECR(){
    cd ../../frontend;
    docker build -t solo-stage-frontend --build-arg API_DOMAIN=api.stage.solo.code.mil --build-arg AUTH_DOMAIN=auth.stage.solo.code.mil --build-arg API_PROTOCOL=https .;
    docker tag solo-stage-frontend:latest 187588058266.dkr.ecr.us-gov-west-1.amazonaws.com/solo-stage-frontend:latest;
    docker push 187588058266.dkr.ecr.us-gov-west-1.amazonaws.com/solo-stage-frontend:latest;
    cd ../deploy/staging;
}
pushBackendToECR(){
    cd ../../backend;
    docker build -t solo-stage-backend .;
    docker tag solo-stage-backend:latest 187588058266.dkr.ecr.us-gov-west-1.amazonaws.com/solo-stage-backend:latest;
    docker push 187588058266.dkr.ecr.us-gov-west-1.amazonaws.com/solo-stage-backend:latest;
    cd ../deploy/staging;
}
pushCompressionServiceToECR(){
    cd ../../compression-service;
    docker build -t solo-stage-compression-service .;
    docker tag solo-stage-compression-service:latest 187588058266.dkr.ecr.us-gov-west-1.amazonaws.com/solo-stage-compression-service:latest;
    docker push 187588058266.dkr.ecr.us-gov-west-1.amazonaws.com/solo-stage-compression-service:latest;
    cd ../deploy/staging;
}
runTerraform(){
    local dir_name=$1;
    cd $dir_name;
    terraform init -backend-config=$dir_name-stage.config;
    terraform validate;
    terraform plan -var-file=$dir_name-stage.tfvars -out=plan;
    terraform apply "plan";
    cd ..;
}
createInfrastructure(){
    runTerraform "infrastructure"; #directory to traverse into from staging dir
}
createPlatform(){
    runTerraform "platform"; #directory to traverse into from staging dir
}
createApplication(){
    runTerraform "application"; # directory to traverse into from staging dir
}
createDatabase(){
    runTerraform "database"; # directory to traverse into from staging dir
}

installTerraform;
aws --version;
terraform --version;
configureAWS;
pushFrontendToECR;
pushBackendToECR;
pushCompressionServiceToECR;
createInfrastructure;
createPlatform;
createDatabase;
createApplication;

