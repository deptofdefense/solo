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


def create_fake_subinventorys(max_per_suppadd: int = 3) -> None:
    models.SubInventory.objects.all().delete()
    suppadds = list(models.SuppAdd.objects.all())
    models.SubInventory.objects.bulk_create(
        [
            models.SubInventory(
                suppadd=suppadd,
                code=fake.lexify(text="???_???", letters=ascii_uppercase),
                desc="",
            )
            for suppadd in suppadds
            for _ in range(random.randint(1, max_per_suppadd))  # nosec
        ]
    )


def create_fake_locators(max_per_subinventory: int = 3) -> None:
    models.Locator.objects.all().delete()
    subinventorys = list(models.SubInventory.objects.all())
    models.Locator.objects.bulk_create(
        [
            models.Locator(
                subinventorys=subinv,
                code=fake.bothify(text="M####?", letters=ascii_uppercase),
                desc="",
            )
            for subinv in subinventorys
            for _ in range(random.randint(1, max_per_subinventory))  # nosec
        ]
    )


def create_fake_addresses(address_count: int = 100) -> None:
    models.Address.objects.bulk_create(
        [
            models.Address(
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


def create_fake_documents(count: int = 100) -> None:
    models.Document.objects.all().delete()
    suppadds = list(models.SuppAdd.objects.all())
    parts = list(models.Part.objects.all())
    addresses = list(models.Address.objects.all())
    models.Document.objects.bulk_create(
        [
            models.Document(
                service_request=fake.numerify(text="########"),  # nosec
                suppadd=random.choice(suppadds),  # nosec
                part=random.choice(parts),  # nosec
                sdn=fake.numerify("M30300########"),
                ship_to=random.choice(addresses),  # nosec
                holder=random.choice(addresses),  # nosec
            )
            for _ in range(count)
        ]
    )


def create_fake_statuses_for_documents() -> None:
    models.Status.objects.all().delete()
    dics = ["AE1", "AS1", "AS2", "D6T", "COR"]
    documents = list(models.Document.objects.all())
    models.Status.objects.bulk_create(
        [
            models.Status(
                document=doc,
                dic=dics[idx],
                status_date=fake.date_time_this_month(tzinfo=pytz.UTC),
                key_and_transmit_date=fake.date_time_this_month(tzinfo=pytz.UTC),
                esd=fake.date_this_month(),
                projected_qty=random.randint(1, 40),  # nosec
                received_qty=0,
            )
            for doc in documents
            for idx in range(random.randint(1, 5))  # nosec
        ]
    )


class Command(BaseCommand):
    help = "populate db with well-formed fake data"

    def handle(self, *args: Any, **options: Any) -> None:
        if not settings.DEBUG:
            self.stdout.write(
                self.style.ERROR("Only meant for development with DEBUG enabled")
            )
            return

        self.stdout.write("Creating fake users...")
        create_fake_users()
        self.stdout.write(self.style.SUCCESS("Ok"))

        self.stdout.write("Creating fake parts...")
        create_fake_parts()
        self.stdout.write(self.style.SUCCESS("Ok"))

        self.stdout.write("Creating fake suppadds...")
        create_fake_suppadds()
        self.stdout.write(self.style.SUCCESS("Ok"))

        self.stdout.write("Creating fake subinventorys...")
        create_fake_subinventorys()
        self.stdout.write(self.style.SUCCESS("Ok"))

        self.stdout.write("Creating fake locators...")
        create_fake_locators()
        self.stdout.write(self.style.SUCCESS("Ok"))

        self.stdout.write("Creating fake addresses...")
        create_fake_addresses()
        self.stdout.write(self.style.SUCCESS("Ok"))

        self.stdout.write("Creating fake documents...")
        create_fake_documents()
        self.stdout.write(self.style.SUCCESS("Ok"))

        self.stdout.write("Creating fake statuses for documents...")
        create_fake_statuses_for_documents()
        self.stdout.write(self.style.SUCCESS("Ok"))
