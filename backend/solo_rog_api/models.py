from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    pass


class Log(models.Model):
    aac = models.CharField(max_length=20)
    request_number = models.CharField(max_length=255)

    def __str__(self) -> str:
        return str(self.request_number)

class AddressType(models.Model):
    type = models.CharField(max_length=25)
    desc = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return self.type