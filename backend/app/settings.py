import os
import sys
import string
from urllib.parse import quote
from django.utils.crypto import get_random_string

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# keep the secret key used in production secret!
SECRET_KEY = os.environ.get("SECRET_KEY") or get_random_string(50, string.printable)

# don't run with debug turned on in production!
DEBUG = bool(os.environ.get("DEBUG")) or False

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "corsheaders",
    "rest_framework",
    "django_filters",
    "solo_rog_api",  # solo receipt of goods api
]

ROOT_URLCONF = "app.urls"
WSGI_APPLICATION = "app.wsgi.application"

AUTH_USER_MODEL = "solo_rog_api.User"

# use client SSL certificate (CAC) authentication by default,
# but replace with a development backend if DEBUG
AUTHENTICATION_BACKENDS = ["solo_rog_api.authentication.CACAuthenticationBackend"]
if DEBUG:
    AUTHENTICATION_BACKENDS = ["solo_rog_api.authentication.DevAuthenticationBackend"]
REST_FRAMEWORK = {
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 25,
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication"
    ],
    "DEFAULT_FILTER_BACKENDS": ("django_filters.rest_framework.DjangoFilterBackend",),
    "ORDERING_PARAM": "sort",
}

SIMPLE_JWT = {
    "ROTATE_REFRESH_TOKENS": True,
}

# setup the domain to serve from based on environment
API_DOMAIN = os.environ.get("API_DOMAIN")
AUTH_DOMAIN = os.environ.get("AUTH_DOMAIN")
ALLOWED_HOSTS = []
if API_DOMAIN:
    ALLOWED_HOSTS.append(API_DOMAIN)
if AUTH_DOMAIN:
    ALLOWED_HOSTS.append(AUTH_DOMAIN)
if DEBUG:
    ALLOWED_HOSTS.extend(["localhost", "127.0.0.1", "0.0.0.0"])


# setup allowed cors origins based on environment
MAIN_DOMAIN = os.environ.get("MAIN_DOMAIN")
CORS_ORIGIN_WHITELIST = []
if MAIN_DOMAIN:
    CORS_ORIGIN_WHITELIST.append(f"https://{MAIN_DOMAIN}")
if DEBUG:
    CORS_ORIGIN_ALLOW_ALL = True


MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
]


# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases
POSTGRES_HOST = os.environ.get("POSTGRES_HOST", default="localhost")
POSTGRES_PORT = os.environ.get("POSTGRES_PORT", default=5432)
POSTGRES_DB_NAME = os.environ.get("POSTGRES_DB", default="solo")
POSTGRES_USER = os.environ.get("POSTGRES_USER", default="solo")
POSTGRES_PASSWORD = os.environ.get("POSTGRES_PASSWORD")
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "HOST": POSTGRES_HOST,
        "PORT": POSTGRES_PORT,
        "NAME": POSTGRES_DB_NAME,
        "USER": POSTGRES_USER,
        "PASSWORD": POSTGRES_PASSWORD,
    }
}

# Use sqlite3 for unit tests until usage diverges enough
# that postgres is neccessary for unit testing
if "test" in sys.argv or DEBUG:
    DATABASES["default"]["ENGINE"] = "django.db.backends.sqlite3"
    DATABASES["default"]["NAME"] = "solo.sqlite3"

# Celery worker
ESCAPED_POSTGRES_HOST = quote(POSTGRES_HOST.encode())
ESCAPED_POSTGRES_USER = quote(POSTGRES_USER.encode())
ESCAPED_POSTGRES_PASSWORD = POSTGRES_PASSWORD and quote(POSTGRES_PASSWORD.encode())
CELERY_BROKER_URL = (
    f"sqla+postgresql://{ESCAPED_POSTGRES_USER}:{ESCAPED_POSTGRES_PASSWORD}@"
    f"{ESCAPED_POSTGRES_HOST}/{POSTGRES_DB_NAME}"
)
CELERY_ACCEPT_CONTENT = ["application/json"]
CELERY_TASK_SERIALIZER = "json"

# Scheduled tasks
CELERY_BEAT_SCHEDULE = {
    "gcss-update-documents": {
        "task": "solo_rog_api.tasks.update_documents",
        "schedule": 60 * 5,  # 1 hour
    },
}

# GCSS connection
GCSS_HOST = os.environ.get("GCSS_HOST", "gcssmc-dv-int.dev.gcssmc.sde")
GCSS_IP = os.environ.get("GCSS_IP", "216.14.17.186")
GCSS_CERT = os.environ.get("GCSS_PUBLIC_CERT")
GCSS_KEY = os.environ.get("GCSS_PRIVATE_KEY")
GCSS_CERT_PATH = os.environ.get("GCSS_CERT_PATH", "/home/backendUser/selfsigned.crt")
GCSS_KEY_PATH = os.environ.get("GCSS_KEY_PATH", "/home/backendUser/selfsigned.key")
if GCSS_CERT is not None:
    with open(GCSS_CERT_PATH, "w") as f:
        f.write(GCSS_CERT)
if GCSS_KEY is not None:
    with open(GCSS_KEY_PATH, "w") as f:
        f.write(GCSS_KEY)

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# Internationalization
# https://docs.djangoproject.com/en/3.0/topics/i18n/
LANGUAGE_CODE = "en-us"
TIME_ZONE = "America/New_York"
USE_I18N = True
USE_L10N = True
USE_TZ = True
