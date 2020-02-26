#!/bin/bash

# substitute these variables only
ALLOWED_VARS='$BACKEND_PROXY'
ALLOWED_VARS+='$MAIN_DOMAIN'
ALLOWED_VARS+='$API_DOMAIN'
ALLOWED_VARS+='$AUTH_DOMAIN'

echo -e "$NGINX_SSL_CERT" > /etc/nginx/Certificate.pem;
echo -e "$NGINX_SSL_KEY" > /etc/nginx/Key.pem;

# rewrite nginx config based on environment
# variables before starting
envsubst "$ALLOWED_VARS" \
            < /app/nginx.template \
            > /etc/nginx/conf.d/default.conf \
    && nginx -g 'daemon off;'
