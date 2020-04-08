from typing import Optional
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.dateparse import parse_datetime


class User(AbstractUser):
    pass


class UserInWarehouse(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    warehouse = models.ForeignKey("Warehouse", on_delete=models.CASCADE)
    cor_permission = models.BooleanField(default=False)
    d6t_permission = models.BooleanField(default=False)
    manager = models.BooleanField(default=False)

    class Meta:
        default_related_name = "warehouse_membership"
        unique_together = ("user", "warehouse")
        ordering = ["user__username"]

    def __repr__(self) -> str:
        return "<UserInWarehouse aac=%r username=%r>" % (
            self.warehouse.aac,
            self.user.username,
        )


class Warehouse(models.Model):
    aac = models.CharField(max_length=30, unique=True, db_index=True)
    users = models.ManyToManyField(to=User)

    def __repr__(self) -> str:
        return "<Warehouse aac=%r>" % (self.aac,)

    def __str__(self) -> str:
        return self.aac


class Part(models.Model):
    nsn = models.CharField(max_length=13, null=True)
    nomen = models.CharField(max_length=50, null=True)
    uom = models.CharField(max_length=5, null=True)
    price = models.IntegerField(null=True)
    sac = models.IntegerField(null=True)
    serial_control_flag = models.CharField(max_length=2, null=True)
    lot_control_flag = models.CharField(max_length=2, null=True)
    recoverability_code = models.CharField(max_length=2, null=True)
    shelf_life_code = models.IntegerField(null=True)
    controlled_inv_item_code = models.CharField(max_length=2, null=True)

    class Meta:
        unique_together = ("nsn", "uom")

    @property
    def niin(self) -> str:
        return self.nsn[4:]

    def get_fsc(self) -> Optional[str]:
        return self.nsn[:4]

    def __str__(self) -> str:
        return "{} : {} : {}".format(self.nomen, self.get_fsc(), self.niin)


class SuppAdd(models.Model):
    code = models.CharField(max_length=50)
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
    suppadd = models.ForeignKey(
        "SuppAdd", related_name="documents", on_delete=models.CASCADE, null=True
    )
    part = models.ForeignKey(
        "Part", related_name="documents", on_delete=models.CASCADE, null=True
    )
    ship_to = models.ForeignKey("Address", on_delete=models.CASCADE, null=True)
    holder = models.ForeignKey(
        "Address", related_name="holding_documents", on_delete=models.CASCADE, null=True
    )
    service_request = models.CharField(max_length=50, null=True)
    sdn = models.CharField(max_length=50, unique=True)

    class Meta:
        ordering = ["-sdn"]
        unique_together = ("service_request", "sdn")

    @property
    def aac(self) -> Optional[str]:
        return self.sdn[:6]

    def get_doc_num(self) -> Optional[str]:
        return self.sdn[6:]

    def __str__(self) -> str:
        return str(self.sdn)


class Status(models.Model):
    document = models.ForeignKey(
        "Document", related_name="statuses", null=True, on_delete=models.CASCADE
    )
    dic = models.CharField(max_length=20, null=False, blank=False)
    status_date = models.DateTimeField()
    key_and_transmit_date = models.DateTimeField(null=True)
    esd = models.DateField(null=True)
    projected_qty = models.IntegerField(null=True)
    received_qty = models.IntegerField(null=True)
    received_by = models.CharField(max_length=50, null=True)
    subinventory = models.ForeignKey(
        "SubInventory", related_name="statuses", on_delete=models.SET_NULL, null=True
    )
    locator = models.ForeignKey(
        "Locator", related_name="statuses", on_delete=models.SET_NULL, null=True
    )

    @property
    def gcss_txn_date(self) -> str:
        return parse_datetime(str(self.status_date)).strftime("%Y-%m-%dT%H:%M:%S.000Z")

    def __str__(self) -> str:
        return "{}: {}".format(self.document.sdn, self.dic)


class Address(models.Model):
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
        return self.name
