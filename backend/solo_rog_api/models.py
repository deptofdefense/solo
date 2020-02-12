from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    pass


class Log(models.Model):
    aac = models.CharField(max_length=20)
    request_number = models.CharField(max_length=255)

    def __str__(self):
        return str(self.request_number)
