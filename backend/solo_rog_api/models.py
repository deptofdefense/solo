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


class Dic(models.Model):
    code = models.CharField(max_length=4, blank=True, unique=True)
    desc = models.CharField(max_length=40, blank=True)

    def __str__(self):
        return self.code.upper()


class Part(models.Model):
    nsn = models.CharField(max_length=13, null=True, unique=True)
    nomen = models.CharField(max_length=50, null=True)
    uom = models.CharField(max_length=5, null=True)
    price = models.IntegerField(null=True)
    sac = models.IntegerField(null=True)
    serial_control_flag = models.CharField(max_length=2, null=True)
    lot_control_flag = models.CharField(max_length=2, null=True)
    recoverability_code = models.CharField(max_length=2, null=True)
    shelf_life_code = models.IntegerField(null=True)
    controlled_inv_item_code = models.CharField(max_length=2, null=True)

    def get_niin(self):
        return self.nsn[4:]

    def get_fsc(self):
        return self.nsn[:4]

    def __str__(self):
        return "{} : {} : {}".format(self.nomen, self.get_fsc(), self.get_niin())


class SuppAdd(models.Model):
    code = models.CharField(max_length=5)
    desc = models.CharField(max_length=40, blank=True)

    def __str__(self):
        return self.code


class SubInventory(models.Model):
    suppadd = models.ForeignKey("SuppAdd", related_name='subinventorys', on_delete=models.CASCADE,
                                null=True, blank=True)

    code = models.CharField(max_length=15)
    desc = models.CharField(max_length=40, blank=True)

    def __str__(self):
        return self.code


class ServiceRequest(models.Model):
    service_request = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return str(self.service_request)
        