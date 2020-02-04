#!/bin/bash

# substitute these variables only
ALLOWED_VARS='$BACKEND_PROXY'
ALLOWED_VARS+='$MAIN_DOMAIN'
ALLOWED_VARS+='$API_DOMAIN'
ALLOWED_VARS+='$CERT_FILE_NAME'
ALLOWED_VARS+='$KEY_FILE_NAME'
ALLOWED_VARS+='$DHPARAM_FILE_NAME'

TEMPLATE_TYPE="${NGINX_TEMPLATE:-https}"
TEMPLATE_FILE="/app/nginx.$TEMPLATE_TYPE.template"

# rewrite nginx config based on environment
# variables before starting
envsubst "$ALLOWED_VARS" \
            < $TEMPLATE_FILE \
            > /etc/nginx/conf.d/default.conf \
    && nginx -g 'daemon off;'
