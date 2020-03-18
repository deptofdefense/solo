## SOLO backend

This django app is the backend to the System for Operational Logistics Orders (SOLO)

### Setup Development Environment
1. Ensure to install docker and python:3.8 or greater
1. create local file called: local-var.env with anything secret
1.  *Recommended* (Install pyenv)[https://github.com/pyenv/pyenv]
 - `pyenv install 3.8.1` Install python version 3.8.1
 - `pyenv global 3.8.1` set 3.8.1 as default python version 
 - `python -m venv venv` Create a virtual environment
 - `source venv/bin/activate` Use virtual environment
1. `pip install -r requirements.txt` install python dependencies
  
### Troubleshooting comments
1. If you have trouble with postgresql:
 - OSX:
   - `brew instal postgresql`
   - `LDFLAGS='-L/usr/local/lib -L/usr/local/opt/openssl/lib -L/usr/local/opt/readline/lib' pip install psycopg2`
 - Windows:
   - pending

### Usage
  1. `python manage.py test` run tests
      - `coverage run` run tests and collect code coverage
      - `coverage report` show code coverage
      - `coverage report --fail-under=80` fail with less than 80% coverage
  2. `python manage.py collectstatic` generate static files if required
  3. `python manage.py makemigrations` create files for migrations
  4. `python manage.py migrate` build database based on makemigrations
  5. `python manage.py runserver` run development server
  6. `pylint backend` run linter
  7. `black --check .` check code style
  8. `black .` auto fix code style
  1. `coverage run` runs the test and check for full coverage of code
  1. `coverage report -m` report where coverage is missing
  1. `coverage report --fail-under=80` report if coverage fails under 80%
  1. `mypy` static type checker
  9. `docker build .` build docker image
  
## Useful Docker Commands
Ensure to be in the `/solo/deploy/compose/` to execute the commands below
1. `docker-compose up --build` spins up the defined containers
1. `docker-compose down` spins down the defined containers
1. `docker-compose run -e DEBUG backend python manage.py test` how to test inside the container
1. `docker-compose run -e DEBUG backend python manage.py createsuperuser` how to create a super user inside the container
1. `docker-compose run -e DEBUG backend python manage.py makemigrations` how to generate models inside the container
1. `docker-compose run -e DEBUG backend python manage.py migrate` how to create database tables inside the container
