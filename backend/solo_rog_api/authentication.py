import re
from rest_framework.authentication import BaseAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model


User = get_user_model()


class CACAuthenticationBackend(BaseAuthentication):
    DODID_RE = re.compile(r"CN=(?:\w+\.){2,3}(?P<dodid>\d{10})")

    def get_dodid_from_dn(self, dn):
        match = self.DODID_RE.search(dn)
        if match is None:
            raise AuthenticationFailed()
        dodid = match.groupdict().get("dodid")
        return dodid

    def authenticate(self, request):
        if not request.META.get("HTTP_X_SSL_CLIENT_VERIFY") == "SUCCESS":
            raise AuthenticationFailed()

        client_dn = request.META.get("HTTP_X_SSL_CLIENT_S_DN")

        # client_cert = request.META.get('HTTP_X_SSL_CLIENT_CERT')
        # TODO: implement CRL check using client_cert

        dodid = self.get_dodid_from_dn(client_dn)

        # TODO: implement authorization check
        user, _ = User.objects.get_or_create(username=dodid)
        return user
