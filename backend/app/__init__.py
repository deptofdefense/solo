from .celery import app as celery_app

# this ensures that the celery app is loaded
# every time Django starts
__all__ = [
    "celery_app",
]
