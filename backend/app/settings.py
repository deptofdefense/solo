import os
import sys
import string
from django.utils.crypto import get_random_string

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# keep the secret key used in production secret!
SECRET_KEY = os.environ.get("SECRET_KEY") or get_random_string(50, string.printable)

# don't run with debug turned on in production!
DEBUG = os.environ.get("DEBUG") or False

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "corsheaders",
    "rest_framework",
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
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication"
    ]
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
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "HOST": os.environ.get("POSTGRES_HOST", default="localhost"),
        "PORT": os.environ.get("POSTGRES_PORT", default=5432),
        "NAME": os.environ.get("POSTGRES_DB", default="solo"),
        "USER": os.environ.get("POSTGRES_USER", default="solo"),
        "PASSWORD": os.environ.get("POSTGRES_PASSWORD", default="solo"),
    }
}

# Use sqlite3 for unit tests until usage diverges enough
# that postgres is neccessary for unit testing
if "test" in sys.argv:
    DATABASES["default"]["ENGINE"] = "django.db.backends.sqlite3"


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
