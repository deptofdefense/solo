
# Create .env environment file for containers
cp .env.example .env
# Generate local self signed certs,db username/password, append them to the .env file
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -subj "/C=US/ST=DC/L=Pentagon/O=DDS/CN=stage.solo.code.mil" -keyout ./nginx-selfsigned.key  -out ./nginx-selfsigned.crt >/dev/null 2>&1;

NGINX_SSL_CERT="NGINX_SSL_CERT="$(cat nginx-selfsigned.crt);
NGINX_SSL_KEY="NGINX_SSL_KEY="$(cat nginx-selfsigned.key);
POSTGRES_USER="POSTGRES_USER="$(openssl rand -base64 12);
POSTGRES_PASSWORD="POSTGRES_PASSWORD="$(openssl rand -base64 12);

echo $POSTGRES_USER >> .env;
echo $POSTGRES_PASSWORD >> .env;
echo "\n" >> .env;
printf %s "$NGINX_SSL_CERT" | awk -v ORS='\\n' 1 >> .env;
echo "\n" >> .env;
printf %s "$NGINX_SSL_KEY" | awk -v ORS='\\n' 1 >> .env;

# Remove generated keys
rm ./nginx-selfsigned.key;
rm ./nginx-selfsigned.crt;

echo "local development environment setup has completed!\\n";
echo "run the following command for HTTPS instantiation: docker-compose -f docker-compose.yml up --build";
echo "run the following command for HTTP instantiation: docker-compose up --build\n";
echo "solo https access point: https://stage.solo.localhost"
echo "solo http access point: http://stage.solo.localhost:3000/"

