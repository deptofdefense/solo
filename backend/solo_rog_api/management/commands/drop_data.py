from typing import Any
from django.core.management.base import BaseCommand
from solo_rog_api import models


class Command(BaseCommand):
    help = "populate db with well-formed fake data"

    def handle(self, *args: Any, **options: Any) -> None:
        models.Part.objects.all().delete()
        models.Address.objects.all().delete()
        models.Status.objects.all().delete()
        models.SuppAdd.objects.all().delete()
        models.Document.objects.all().delete()
        print("SUCCESS", flush=True)
