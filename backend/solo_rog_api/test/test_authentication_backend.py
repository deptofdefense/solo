from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from solo_rog_api.authentication import CACAuthenticationBackend


User = get_user_model()


class CACAuthenticationBackendDNParserTestCase(TestCase):
    auth_backend = CACAuthenticationBackend()
    request_factory = APIRequestFactory()

    # @classmethod
    # def setUpTestData(cls) -> None:
    #     cls.auth_backend = CACAuthenticationBackend()
    #     cls.request_factory = APIRequestFactory()

    def test_parses_dod_id_for_standard_dn(self) -> None:
        result = self.auth_backend.get_dodid_from_dn(
            "CN=fmame.mname.lname.0123456789,OU=USMC,OU=GOV"
        )
        self.assertEqual(result, "0123456789")

    def test_parses_dod_id_for_no_middle_name(self) -> None:
        result = self.auth_backend.get_dodid_from_dn(
            "OU=USMC,CN=fname.lname.0123456789,OU=GOV"
        )
        self.assertEqual(result, "0123456789")

    def test_auth_fails_for_no_dod_id_found(self) -> None:
        self.assertRaises(
            AuthenticationFailed,
            self.auth_backend.get_dodid_from_dn,
            "OU=USMC,CN=fname.mname.lname,OU=GOV",
        )

    def test_auth_fails_for_too_short_dod_id(self) -> None:
        self.assertRaises(
            AuthenticationFailed,
            self.auth_backend.get_dodid_from_dn,
            "CN=fname.lname.012345678",
        )

    def test_auth_fails_for_empty_dn(self) -> None:
        self.assertRaises(AuthenticationFailed, self.auth_backend.get_dodid_from_dn, "")

    def test_auth_fails_for_empty_cn(self) -> None:
        self.assertRaises(
            AuthenticationFailed, self.auth_backend.get_dodid_from_dn, "OU=USMC,CN="
        )


class CACAuthenticationBackendTestCase(TestCase):
    auth_backend = CACAuthenticationBackend()
    request_factory = APIRequestFactory()

    def setUp(self) -> None:
        self.request = self.request_factory.post("/login/")
        self.request.META["HTTP_X_SSL_CLIENT_VERIFY"] = "SUCCESS"
        self.request.META[
            "HTTP_X_SSL_CLIENT_S_DN"
        ] = "CN=fmame.mname.lname.0123456789,OU=USMC,OU=GOV"

    def tearDown(self) -> None:
        User.objects.all().delete()

    def test_authenticate_fails_if_client_not_verified(self) -> None:
        self.request.META["HTTP_X_SSL_CLIENT_VERIFY"] = "FAIL"
        self.assertRaises(
            AuthenticationFailed, self.auth_backend.authenticate, self.request
        )

    def test_creates_user_for_dodid(self) -> None:
        self.request.META[
            "HTTP_X_SSL_CLIENT_S_DN"
        ] = "CN=fmame.mname.lname.0123456789,OU=USMC,OU=GOV"
        self.assertEqual(User.objects.count(), 0)
        self.auth_backend.authenticate(self.request)
        self.assertEqual(User.objects.count(), 1)
        self.assertIsNotNone(User.objects.filter(username="0123456789").first())

    def test_returns_exisiting_user_with_dodid(self) -> None:
        user = User.objects.create(username="0123456789")
        result = self.auth_backend.authenticate(self.request)
        self.assertEqual(user, result)
