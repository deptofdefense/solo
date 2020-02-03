# build stage - build production react app
FROM node:latest AS build_stage

ARG API_URL
ENV REACT_APP_API_DOMAIN=${API_URL}

WORKDIR /app

COPY package*.json /app/

RUN npm ci

COPY . .

RUN npm run build


# nginx container - copy build static files into nginx container
FROM nginx:latest

COPY --from=build_stage /app/build/ /usr/share/nginx/html/

COPY nginx/snippets/ /etc/nginx/snippets/

COPY nginx/entrypoint.sh /app/entrypoint.sh

COPY nginx/nginx.template /app/nginx.template

ENTRYPOINT [ "/app/entrypoint.sh" ]
