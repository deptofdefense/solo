import os
from django.core.management.base import BaseCommand
from typing import Any


class Command(BaseCommand):
    help = "populate db with well-formed fake data"

    def handle(self, *args: Any, **options: Any) -> None:
        self.stdout.write("COMMAND RECEIVED")
        self.stdout.write(os.environ.get("GCSS_PUBLIC_CERT", "no certificate found"))
