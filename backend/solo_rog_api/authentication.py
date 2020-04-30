import re
from typing import Optional, Dict, Any
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.models import AbstractUser


User = get_user_model()


class CACAuthenticationBackend(BaseBackend):
    CAC_DN_RE = re.compile(
        r"CN=(?P<last_name>[\w\-]+)\.(?P<first_name>[\w\-]+)\.([\w\-]+\.)?(?P<username>\d{10})"
    )

    def parse_dn(self, dn: Optional[str]) -> Dict[str, Any]:
        if dn is None or (match := self.CAC_DN_RE.search(dn)) is None:
            raise AuthenticationFailed()
        return match.groupdict()

    def authenticate(self, request) -> AbstractUser:  # type: ignore # pylint: disable=arguments-differ
        if request.META.get("HTTP_X_SSL_CLIENT_VERIFY") != "SUCCESS":
            raise AuthenticationFailed()

        client_dn = request.META.get("HTTP_X_SSL_CLIENT_S_DN")

        # TODO: implement CRL check using client_cert (see issues #93 and #79)
        fields = self.parse_dn(client_dn)

        user, _ = User.objects.update_or_create(
            username=fields["username"],
            defaults={
                "first_name": fields["first_name"],
                "last_name": fields["last_name"],
            },
        )
        return user


class DevAuthenticationBackend(BaseBackend):
    def authenticate(self, request) -> AbstractUser:  # type: ignore # pylint: disable=arguments-differ
        # in development, with DEBUG turned on, authenticate
        # as the user specified in the Authorization header
        username = request.META.get("HTTP_AUTHORIZATION")
        if not username:
            raise AuthenticationFailed()
        user, _ = User.objects.get_or_create(username=username.strip())
        return user
