## SOLO backend

This django app is the backend to the System for Operational Logistics Orders (SOLO)

### Setup Development Environment

1. Ensure to install docker and python:3.8 or greater
2. create local file called: local-var.env with anything secret
3. `docker build .` builds initial image
4. `docker-compose build` builds an image with services
5. `docker-compose up -d` run containers *locally* in detached (background). Browse to localhost:8000

### Available Scripts
- `docker-compose run -rm app sh -c "python manage.py [variable]""` run (optional flag `-rm` removes container after run)

#### Variable
| Variable | Description |
| -------- | ----------- |
|   test   | unit test   |
| migrate | create or update database schema |