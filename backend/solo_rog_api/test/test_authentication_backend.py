from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model, authenticate
from rest_framework.test import APIRequestFactory
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from solo_rog_api.authentication import (
    CACAuthenticationBackend,
    DevAuthenticationBackend,
)


User = get_user_model()


class CACAuthenticationBackendDNParserTestCase(TestCase):
    auth_backend = CACAuthenticationBackend()
    request_factory = APIRequestFactory()

    def test_parses_dod_id_for_standard_dn(self) -> None:
        result = self.auth_backend.parse_dn(
            "CN=lname.fname.mname.0123456789,OU=USMC,OU=GOV"
        )
        self.assertDictContainsSubset(
            {"username": "0123456789", "first_name": "fname", "last_name": "lname"},
            result,
        )

    def test_parses_dod_id_for_hyphenated_name(self) -> None:
        result = self.auth_backend.parse_dn(
            "CN=lname-other.fname-hyphen.mname.0123456789,OU=USMC,OU=GOV"
        )
        self.assertDictContainsSubset(
            {
                "username": "0123456789",
                "first_name": "fname-hyphen",
                "last_name": "lname-other",
            },
            result,
        )

    def test_parses_dod_id_for_no_middle_name(self) -> None:
        result = self.auth_backend.parse_dn("OU=USMC,CN=lname.fname.0123456789,OU=GOV")
        self.assertDictContainsSubset(
            {"username": "0123456789", "first_name": "fname", "last_name": "lname"},
            result,
        )

    def test_auth_fails_for_no_dod_id_found(self) -> None:
        self.assertRaises(
            AuthenticationFailed,
            self.auth_backend.parse_dn,
            "OU=USMC,CN=lname.fname.mname,OU=GOV",
        )

    def test_auth_fails_for_too_short_dod_id(self) -> None:
        self.assertRaises(
            AuthenticationFailed,
            self.auth_backend.parse_dn,
            "CN=lname.fname.012345678",
        )

    def test_auth_fails_for_empty_dn(self) -> None:
        self.assertRaises(AuthenticationFailed, self.auth_backend.parse_dn, "")

    def test_auth_fails_for_empty_cn(self) -> None:
        self.assertRaises(
            AuthenticationFailed, self.auth_backend.parse_dn, "OU=USMC,CN="
        )


class CACAuthenticationBackendTestCase(TestCase):
    auth_backend = CACAuthenticationBackend()
    request_factory = APIRequestFactory()

    def setUp(self) -> None:
        self.request = self.request_factory.post("/login/")
        self.request.META["HTTP_X_SSL_CLIENT_VERIFY"] = "SUCCESS"
        self.request.META[
            "HTTP_X_SSL_CLIENT_S_DN"
        ] = "CN=lname.fname.mname.0123456789,OU=USMC,OU=GOV"

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
        ] = "CN=lname.fname.mname.0123456789,OU=USMC,OU=GOV"
        self.assertEqual(User.objects.count(), 0)
        self.auth_backend.authenticate(self.request)
        self.assertEqual(User.objects.count(), 1)
        self.assertTrue(
            User.objects.filter(
                username="0123456789", first_name="fname", last_name="lname"
            ).exists()
        )

    def test_updates_existing_user_with_first_and_lname(self) -> None:
        User.objects.create(username="0123456789")
        self.auth_backend.authenticate(self.request)
        self.assertEqual(User.objects.count(), 1)
        user = User.objects.get(username="0123456789")
        self.assertEqual(user.first_name, "fname")
        self.assertEqual(user.last_name, "lname")

    def test_returns_exisiting_user_with_dodid(self) -> None:
        user = User.objects.create(
            username="0123456789", last_name="lname", first_name="fname"
        )
        result = self.auth_backend.authenticate(self.request)
        self.assertEqual(user, result)


class DevAuthenticationBackendTestCase(TestCase):
    auth_backend = DevAuthenticationBackend()
    request_factory = APIRequestFactory()

    def setUp(self) -> None:
        self.request = self.request_factory.post("/login/")
        self.request.META["HTTP_AUTHORIZATION"] = "testuser"

    def tearDown(self) -> None:
        User.objects.all().delete()

    def test_development_backend_authenticates_any_user(self) -> None:
        user = self.auth_backend.authenticate(self.request)
        self.assertEqual(user.username, "testuser")
        self.assertEqual(User.objects.count(), 1)

    def test_development_backend_username_required(self) -> None:
        with self.assertRaises(AuthenticationFailed):
            self.request.META["HTTP_AUTHORIZATION"] = ""
            self.auth_backend.authenticate(self.request)
        self.assertEqual(User.objects.count(), 0)


class CorrectAuthenticationBackendForEnvironmentTestCase(TestCase):
    request_factory = APIRequestFactory()

    def setUp(self) -> None:
        self.request = self.request_factory.post("/login/")

    def test_uses_cac_authentication_by_default(self) -> None:
        self.request.META["HTTP_X_SSL_CLIENT_VERIFY"] = "SUCCESS"
        self.request.META[
            "HTTP_X_SSL_CLIENT_S_DN"
        ] = "CN=lname.fname.mname.0123456789,OU=USMC,OU=GOV"
        user = authenticate(self.request)
        assert isinstance(user, User)
        self.assertEqual(user.username, "0123456789")

    def test_dev_authentication_does_not_work_by_default(self) -> None:
        self.request.META["HTTP_AUTHORIZATION"] = "testuser"
        with self.assertRaises(AuthenticationFailed):
            authenticate(self.request)

    @override_settings(
        AUTHENTICATION_BACKENDS=["solo_rog_api.authentication.DevAuthenticationBackend"]
    )
    def test_dev_authentication_works_when_configured_with_debug_on(self) -> None:
        self.request.META["HTTP_AUTHORIZATION"] = "testuser"
        user = authenticate(self.request)
        assert isinstance(user, User)
        self.assertEqual(user.username, "testuser")
