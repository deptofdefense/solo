#!/bin/bash

# substitute these variables only
ALLOWED_VARS='$BACKEND_PROXY'
ALLOWED_VARS+='$MAIN_DOMAIN'
ALLOWED_VARS+='$API_DOMAIN'
ALLOWED_VARS+='$CERT_FILE_NAME'
ALLOWED_VARS+='$KEY_FILE_NAME'

# rewrite nginx config based on environment
# variables before starting
envsubst "$ALLOWED_VARS" \
            < /app/nginx.template \
            > /etc/nginx/conf.d/default.conf \
    && nginx -g 'daemon off;'
