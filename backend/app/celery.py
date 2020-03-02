import os
from celery import Celery

# configure celery to read options from django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")
app = Celery("proj")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
