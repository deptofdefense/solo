# build stage - build production react app
FROM node:latest AS build_stage

WORKDIR /app

COPY package*.json /app/

RUN npm ci

COPY . .


ARG API_DOMAIN
ARG API_PROTOCOL
ARG AUTH_DOMAIN
ENV REACT_APP_API_DOMAIN=${API_DOMAIN}
ENV REACT_APP_API_PROTOCOL=${API_PROTOCOL}
ENV REACT_APP_AUTH_DOMAIN=${AUTH_DOMAIN}

RUN npm run build


# nginx container - copy build static files into nginx container
FROM nginx:latest

COPY --from=build_stage /app/build/ /usr/share/nginx/html/

COPY nginx/snippets/ /etc/nginx/snippets/

COPY nginx/entrypoint.sh /app/entrypoint.sh

COPY nginx/*.template /app/

ENTRYPOINT [ "/app/entrypoint.sh" ]
