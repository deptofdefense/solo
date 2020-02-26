# Add DNS records to hosts file
echo "127.0.0.1	stage.solo.localhost" >> /etc/hosts
echo "127.0.0.1	api.stage.solo.localhost" >> /etc/hosts
echo "127.0.0.1	auth.stage.solo.localhost" >> /etc/hosts

# Generate local self signed certs, append them to the .env file
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./nginx-selfsigned.key -out ./nginx-selfsigned.crt;
CERT_TITLE="NGINX_SSL_CERT=";
KEY_TITLE="NGINX_SSL_KEY=";
CERT=$(cat nginx-selfsigned.crt);
KEY=$(cat nginx-selfsigned.key);
NGINX_SSL_CERT=$CERT_TITLE$CERT;
NGINX_SSL_KEY=$KEY_TITLE$KEY;
printf %s "$NGINX_SSL_CERT" | awk -v ORS='\\n' 1 >> .env;
echo "\n" >> .env;
printf %s "$NGINX_SSL_KEY" | awk -v ORS='\\n' 1 >> .env;

