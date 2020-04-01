import os
from celery import shared_task


def get_public_cert() -> str:
    return os.environ.get("GCSS_PUBLIC_CERT") or "not found"


@shared_task
def log_something() -> None:
    print("RECEIVED TASK", flush=True)
    print("PUBLIC CERT", get_public_cert(), flush=True)
