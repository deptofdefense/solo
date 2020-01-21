FROM python:3.8-alpine

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONBUFFERED 1

COPY ./requirements/requirements.txt /requirements.txt
RUN pip install --upgrade pip && pip install -r /requirements.txt

RUN mkdir /app
WORKDIR /app
COPY . /app

RUN adduser -D user
USER user

EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "app.wsgi:application"]
