## SOLO frontend

This react app is the frontend to the System for Operational Logistics Orders (SOLO)

### Setup Development Environment

1. (recommended) [install node version manager](https://github.com/nvm-sh/nvm)
2. Install the latest LTS version of node
    - `nvm ls-remote`
    - `nvm install X.X.X`
3. Install dependencies
    - `npm install`


### Available Scripts
  - `npm install` Install dependencies: 
  - `npm run start` Run local development server
  - `npm run test` Run tests
  - `npm run lint` Lint
  - `npm run lint:fix` Autofix linting
  - `npm run typecheck` Type-check
  - `npm run build` Create production build
  - `docker build .` Build production app into nginx container (requires docker installed)


### Running in docker locally

The following example commands create keys in the nginx/keys directory. They should never be committed to version control, even though they are only used for development. They are ignored by the .gitignore, but if you are generating them somewhere else, ensure they do not accidentally get committed.

#### Generate self-signed keys for nginx
 1. `openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./nginx/keys/nginx-selfsigned.key -out ./nginx/keys/nginx-selfsigned.crt`
 2. Fill out fields as desired

#### Generate dhparam.pem file
 1. `openssl dhparam -out ./nginx/keys/dhparam.pem 2048`

#### Build and run docker container with volume binding
 1. `docker build -t solo-frontend .`
 2. ```docker run -p 443:443 -v `pwd`/nginx/keys:/etc/ssl solo-frontend```
 3. Visit https://localhost in a browser
 4. Authenticate with CAC
