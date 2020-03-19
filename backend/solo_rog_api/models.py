from typing import Optional
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.dateparse import parse_datetime


class User(AbstractUser):
    pass


class AddressType(models.Model):
    type = models.CharField(max_length=25)
    desc = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self) -> str:
        return self.type


class Dic(models.Model):
    code = models.CharField(max_length=4, blank=True, unique=True)
    desc = models.CharField(max_length=40, blank=True)

    def __str__(self) -> str:
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

    def get_niin(self) -> str:
        return self.nsn[4:]

    def get_fsc(self) -> Optional[str]:
        return self.nsn[:4]

    def __str__(self) -> str:
        return "{} : {} : {}".format(self.nomen, self.get_fsc(), self.get_niin())


class SuppAdd(models.Model):
    code = models.CharField(max_length=5)
    desc = models.CharField(max_length=40, blank=True)

    def __str__(self) -> str:
        return self.code


class SubInventory(models.Model):
    suppadd = models.ForeignKey(
        "SuppAdd",
        related_name="subinventorys",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    code = models.CharField(max_length=15)
    desc = models.CharField(max_length=40, blank=True)

    def __str__(self) -> str:
        return self.code


class Locator(models.Model):
    subinventorys = models.ForeignKey(
        "SubInventory",
        related_name="locators",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    code = models.CharField(max_length=15)
    desc = models.CharField(max_length=40, blank=True)

    def __str__(self) -> str:
        return self.code


class Document(models.Model):
    service_request = models.ForeignKey(
        "ServiceRequest",
        related_name="documents",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    suppadd = models.ForeignKey(
        "SuppAdd",
        related_name="documents",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    part = models.ForeignKey(
        "Part",
        related_name="documents",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    sdn = models.CharField(max_length=50, null=True, blank=True)

    def get_aac(self) -> Optional[str]:
        return self.sdn[:6]

    def get_doc_num(self) -> Optional[str]:
        return self.sdn[6:]

    def __str__(self) -> str:
        return str(self.sdn)


class Status(models.Model):
    document = models.ForeignKey(
        "Document", related_name="statuses", null=True, on_delete=models.CASCADE
    )
    dic = models.ForeignKey("Dic", on_delete=models.CASCADE, null=True, blank=True)
    status_date = models.DateTimeField()
    key_and_transmit_date = models.DateTimeField(null=True, blank=True)
    esd = models.DateField(null=True, blank=True)
    projected_qty = models.PositiveSmallIntegerField(null=True, blank=True)
    received_qty = models.PositiveSmallIntegerField(null=True, blank=True)

    def status_converted_date(self) -> str:
        return parse_datetime(str(self.status_date)).strftime("%Y-%m-%dT%H:%M:%S.000Z")

    def __str__(self) -> str:
        return "{}: {}".format(self.document.sdn, self.dic.code)


class Address(models.Model):
    document = models.ManyToManyField("Document", related_name="addresses", blank=True)
    address_type = models.ForeignKey(
        "AddressType",
        related_name="addresses",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    name = models.CharField(max_length=50)
    ric = models.CharField(max_length=20)
    addy1 = models.CharField(max_length=50, null=True, blank=True)
    addy2 = models.CharField(max_length=50, null=True, blank=True)
    addy3 = models.CharField(max_length=50, null=True, blank=True)
    city = models.CharField(max_length=20)
    state = models.CharField(max_length=20)
    zip = models.CharField(max_length=11, null=True, blank=True)
    country = models.CharField(max_length=15, null=True, blank=True)

    def __str__(self) -> str:
        return self.address_type.type


class ServiceRequest(models.Model):
    service_request = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self) -> str:
        return str(self.service_request)
