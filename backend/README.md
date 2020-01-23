## SOLO backend

This django app is the backend to the System for Operational Logistics Orders (SOLO)

### Setup Development Environment
  1. Ensure to install docker and python:3.8 or greater
  2. create local file called: local-var.env with anything secret
  4.  *Recommended* (Install pyenv)[https://github.com/pyenv/pyenv]
      - `pyenv install 3.8.1` Install python version 3.8.1
      - `pyenv global 3.8.1` set 3.8.1 as default python version 
      - `python -m venv venv` Create a virtual environment
      - `source venv/bin/activate` Use virtual environment
  4. `pip install -r requirements.txt` install python dependencies

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
  9. `docker build .` build docker image
