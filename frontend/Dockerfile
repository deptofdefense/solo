# build stage - build production react app
FROM node:latest AS build_stage

WORKDIR /app

COPY package*.json /app/

RUN npm ci

COPY . .

RUN npm run build


# nginx container - copy build static files into nginx container
FROM nginx:latest

COPY --from=build_stage /app/build/ /usr/share/nginx/html/

COPY ./nginx/snippets/* /etc/nginx/snippets/
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
