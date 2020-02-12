FROM python:3.8-alpine


# build dependencies for psycopg2 postgres driver
RUN apk update && apk add postgresql-dev gcc python3-dev musl-dev

COPY ./requirements/requirements.txt /requirements.txt
RUN pip install --upgrade pip && pip install -r /requirements.txt

RUN mkdir /app
WORKDIR /app
COPY . /app


EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "app.wsgi:application"]
