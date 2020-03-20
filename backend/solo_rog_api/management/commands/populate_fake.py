from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from faker import Faker
from typing import Any
import random
import pytz
from string import ascii_uppercase
from solo_rog_api import models


fake = Faker()


def create_fake_users(count: int = 10) -> None:
    models.User.objects.all().delete()
    models.User.objects.bulk_create(
        [
            # simulate edipi
            models.User(username=fake.msisdn())
            for _ in range(count)
        ]
    )


def populate_address_types() -> None:
    models.AddressType.objects.all().delete()
    # 1 = Holder, 2 = Ship-To, 3 = Requestor, and 4 = Bill-To
    types = (("1", "Holder"), ("2", "Ship-To"), ("3", "Requestor"), ("4", "Bill-To"))
    models.AddressType.objects.bulk_create(
        [models.AddressType(type=type, desc=desc) for type, desc in types]
    )


def populate_dics() -> None:
    models.Dic.objects.all().delete()
    types = (
        ("AE1", "Requested"),
        ("AS1", "Shipped"),
        ("AS2", "In-Transit"),
        ("D6T", "Received"),
        ("COR", "Confirmed"),
    )
    models.Dic.objects.bulk_create(
        [models.Dic(code=code, desc=desc) for code, desc in types]
    )


def create_fake_parts(count: int = 20) -> None:
    models.Part.objects.all().delete()
    models.Part.objects.bulk_create(
        [
            models.Part(
                nsn=fake.ean(length=13),
                nomen=fake.bs(),
                uom=random.choice(["EA"]),  # nosec
                price=random.randint(1, 300),  # nosec
            )
            for _ in range(count)
        ]
    )


def create_fake_suppadds(count: int = 20) -> None:
    models.SuppAdd.objects.all().delete()
    models.SuppAdd.objects.bulk_create(
        [
            models.SuppAdd(
                code=fake.lexify(text="????", letters=ascii_uppercase),
                desc=fake.company(),
            )
            for _ in range(count)
        ]
    )


def create_fake_subinventorys(count: int = 20) -> None:
    models.SubInventory.objects.all().delete()
    suppadds = list(models.SuppAdd.objects.all())
    models.SubInventory.objects.bulk_create(
        [
            models.SubInventory(
                suppadd=random.choice(suppadds),  # nosec
                code=fake.lexify(text="???_???", letters=ascii_uppercase),
                desc="",
            )
            for _ in range(count)
        ]
    )


def create_fake_locators(count: int = 20) -> None:
    models.Locator.objects.all().delete()
    subinventorys = list(models.SubInventory.objects.all())
    models.Locator.objects.bulk_create(
        [
            models.Locator(
                subinventorys=random.choice(subinventorys),  # nosec
                code=fake.bothify(text="M####?", letters=ascii_uppercase),
                desc="",
            )
            for _ in range(count)
        ]
    )


def create_fake_service_requests(count: int = 20) -> None:
    models.ServiceRequest.objects.all().delete()
    models.ServiceRequest.objects.bulk_create(
        [
            models.ServiceRequest(service_request=fake.numerify(text="########"))
            for _ in range(count)
        ]
    )


def create_fake_documents(count: int = 100) -> None:
    models.Document.objects.all().delete()
    service_requests = list(models.ServiceRequest.objects.all())
    suppadds = list(models.SuppAdd.objects.all())
    parts = list(models.Part.objects.all())
    models.Document.objects.bulk_create(
        [
            models.Document(
                service_request=random.choice(service_requests),  # nosec
                suppadd=random.choice(suppadds),  # nosec
                part=random.choice(parts),  # nosec
                sdn=fake.numerify("M30300########"),
            )
            for _ in range(count)
        ]
    )


def create_fake_statuses_for_documents() -> None:
    models.Status.objects.all().delete()
    dics = {dic.code: dic for dic in list(models.Dic.objects.all())}
    dic_map = {0: "AE1", 1: "AS1", 2: "AS2", 3: "D6T", 4: "COR"}
    documents = list(models.Document.objects.all())
    models.Status.objects.bulk_create(
        [
            models.Status(
                document=doc,
                dic=dics[dic_map[idx]],
                status_date=fake.date_time_this_month(tzinfo=pytz.UTC),
                key_and_transmit_date=fake.date_time_this_month(tzinfo=pytz.UTC),
                esd=fake.date_this_month(),
                projected_qty=random.randint(1, 40),  # nosec
                received_qty=0,
            )
            for doc in documents
            for idx in range(random.randint(0, 5))  # nosec
        ]
    )


def create_fake_addresses_for_documents(address_count: int = 100) -> None:
    models.Address.objects.all().delete()
    address_types = {
        address_type.type: address_type
        for address_type in list(models.AddressType.objects.all())
    }
    documents = list(models.Document.objects.all())
    models.Address.objects.bulk_create(
        [
            models.Address(
                address_type=address_types[str(random.randint(1, 4))],  # nosec
                name=fake.company(),
                ric=fake.numerify(text="###"),
                addy1=fake.street_address(),
                city=fake.city(),
                state=fake.state_abbr(),
                zip=fake.postalcode(),
                country="US",
            )
            for _ in range(address_count)
        ]
    )
    addresses = {
        1: list(models.Address.objects.filter(address_type=address_types["1"].id)),
        2: list(models.Address.objects.filter(address_type=address_types["2"].id)),
        3: list(models.Address.objects.filter(address_type=address_types["3"].id)),
        4: list(models.Address.objects.filter(address_type=address_types["4"].id)),
    }
    for doc in documents:
        doc.addresses.set([random.choice(addresses[i]) for i in range(1, 5)])  # nosec
        doc.save()


class Command(BaseCommand):
    help = "populate db with well-formed fake data"

    def handle(self, *args: Any, **options: Any) -> None:
        if not settings.DEBUG:
            self.stdout.write(
                self.style.ERROR("Only meant for development with DEBUG enabled")
            )
            return

        self.stdout.write("Creating fake users")
        create_fake_users()
        self.stdout.write(self.style.SUCCESS("Ok\n"))

        self.stdout.write("Populating address types")
        populate_address_types()
        self.stdout.write(self.style.SUCCESS("Ok\n"))

        self.stdout.write("Populating Dic codes")
        populate_dics()
        self.stdout.write(self.style.SUCCESS("Ok\n"))

        self.stdout.write("Creating fake parts")
        create_fake_parts()
        self.stdout.write(self.style.SUCCESS("Ok\n"))

        self.stdout.write("Creating fake suppadds")
        create_fake_suppadds()
        self.stdout.write(self.style.SUCCESS("Ok\n"))

        self.stdout.write("Creating fake subinventorys")
        create_fake_subinventorys()
        self.stdout.write(self.style.SUCCESS("Ok\n"))

        self.stdout.write("Creating fake locators")
        create_fake_locators()
        self.stdout.write(self.style.SUCCESS("Ok\n"))

        self.stdout.write("Creating fake service requests")
        create_fake_service_requests()
        self.stdout.write(self.style.SUCCESS("Ok\n"))

        self.stdout.write("Creating fake documents")
        create_fake_documents()
        self.stdout.write(self.style.SUCCESS("Ok\n"))

        self.stdout.write("Creating fake statuses for documents")
        create_fake_statuses_for_documents()
        self.stdout.write(self.style.SUCCESS("Ok\n"))

        self.stdout.write("Creating fake addresses for documents")
        create_fake_addresses_for_documents()
        self.stdout.write(self.style.SUCCESS("Ok\n"))
