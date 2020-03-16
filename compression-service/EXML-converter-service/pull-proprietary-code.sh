#login
$(aws ecr get-login --no-include-email --region us-gov-west-1);
#Pull agiledelta code from s3 bucket
echo "attempting to pull agiledelta code to local repo...";
aws s3 cp s3://proprietary-solo-data/agiledelta agiledelta --recursive;
echo "attempt finished";
