FROM python:3.8-alpine


RUN apk update && apk add postgresql-dev gcc python3-dev musl-dev libxml2 libxslt-dev xmlsec-dev

COPY ./requirements/requirements.txt /requirements.txt
RUN pip install --upgrade pip && pip install -r /requirements.txt

RUN mkdir /backend
WORKDIR /backend
COPY . /backend


RUN addgroup -S backendUser && adduser -S -G backendUser backendUser
USER backendUser

EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "app.wsgi:application"]
