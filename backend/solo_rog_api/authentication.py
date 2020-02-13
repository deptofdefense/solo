import re
from typing import Optional
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.models import AbstractUser


User = get_user_model()


class CACAuthenticationBackend(BaseBackend):
    DODID_RE = re.compile(r"CN=(?:\w+\.){2,3}(?P<dodid>\d{10})")

    def get_dodid_from_dn(self, dn: Optional[str]) -> str:
        if dn is None or (match := self.DODID_RE.search(dn)) is None:
            raise AuthenticationFailed()

        dodid = match.groupdict()["dodid"]  # type: ignore
        return dodid

    def authenticate(self, request) -> AbstractUser:  # type: ignore # pylint: disable=arguments-differ
        if request.META.get("HTTP_X_SSL_CLIENT_VERIFY") != "SUCCESS":
            raise AuthenticationFailed()

        client_dn = request.META.get("HTTP_X_SSL_CLIENT_S_DN")

        # client_cert = request.META.get('HTTP_X_SSL_CLIENT_CERT')
        # TODO: implement CRL check using client_cert

        dodid = self.get_dodid_from_dn(client_dn)

        # TODO: implement authorization check
        user, _ = User.objects.get_or_create(username=dodid)
        return user
