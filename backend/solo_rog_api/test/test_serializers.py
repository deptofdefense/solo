from unittest.mock import patch, Mock
import jwt
from jwt.exceptions import InvalidSignatureError
from rest_framework.exceptions import AuthenticationFailed
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.conf import settings
from solo_rog_api.models import AddressType, Dic, Part, ServiceRequest
from solo_rog_api.serializers import (
    TokenObtainSerializer,
    AddressTypeSerializer,
    DicSerializer,
    PartSerializer,
    ServiceRequestSerializer,
)

User = get_user_model()


@patch("solo_rog_api.serializers.authenticate", autospec=True)
class TokenObtainSerializerTestCase(TestCase):
    user = User()

    @classmethod
    def setUpTestData(cls) -> None:
        cls.user = User.objects.create(username="0123456789")
        assert isinstance(cls.user, User)

    @classmethod
    def tearDownClass(cls) -> None:
        User.objects.all().delete()

    def test_returns_tokens_on_successful_auth(self, auth_mock: Mock) -> None:
        auth_mock.return_value = self.user
        serializer = TokenObtainSerializer(data={})
        self.assertTrue(serializer.is_valid())
        self.assertTrue(auth_mock.called)
        self.assertIn("refresh", serializer.validated_data)
        self.assertIn("access", serializer.validated_data)

    def test_token_contains_username_and_id(self, auth_mock: Mock) -> None:
        auth_mock.return_value = self.user
        serializer = TokenObtainSerializer(data={})
        self.assertTrue(serializer.is_valid())
        self.assertIn("access", serializer.validated_data)
        access_token = serializer.validated_data.get("access")
        data = jwt.decode(access_token, verify=False)
        self.assertDictContainsSubset(
            {"username": self.user.username, "user_id": self.user.id}, data
        )

    def test_token_signed_with_secret_key(self, auth_mock: Mock) -> None:
        auth_mock.return_value = self.user
        serializer = TokenObtainSerializer(data={})
        self.assertTrue(serializer.is_valid())
        access_token = serializer.validated_data.get("access")
        jwt.decode(access_token, settings.SECRET_KEY, verify=True)
        with self.assertRaises(InvalidSignatureError):
            jwt.decode(access_token, "not secret key", verify=True)

    def test_data_is_ignored(self, auth_mock: Mock) -> None:
        auth_mock.return_value = self.user
        serializer = TokenObtainSerializer(data={"username": "someuser"})
        self.assertTrue(serializer.is_valid())
        self.assertNotIn("username", serializer.validated_data)

    def test_raises_authentication_error_on_no_user(self, auth_mock: Mock) -> None:
        auth_mock.return_value = None
        serializer = TokenObtainSerializer(data={})
        with self.assertRaises(AuthenticationFailed):
            serializer.is_valid()


class AddressTypeSerializerTest(TestCase):
    """ Test Address Type creation of a serializer from model """

    def setUp(self) -> None:
        self.test = AddressType.objects.create(type="Ship-to", desc="Ship it")

    def test_address_type_serializer(self):
        serial_object = AddressTypeSerializer(self.test)
        self.assertEqual(
            serial_object.data, {"id": 1, "type": "Ship-to", "desc": "Ship it"}
        )


class ServiceRequestSerializerTest(TestCase):
    """ Test Dic creation of a serializer from model """

    def setUp(self) -> None:
        self.test = ServiceRequest.objects.create(service_request="12345678")

    def test_dic_serializer(self):
        serial_object = ServiceRequestSerializer(self.test)
        self.assertEqual(serial_object.data, {"id": 1, "service_request": "12345678"})


class DicSerializerTest(TestCase):
    """ Test ServiceRequest creation of a serializer from model """

    def setUp(self) -> None:
        self.test = Dic.objects.create(code="AB1", desc="")

    def test_dic_serializer(self):
        serial_object = DicSerializer(self.test)
        self.assertEqual(serial_object.data, {"id": 1, "code": "AB1", "desc": ""})


class PartSerializerTest(TestCase):
    """ Test Part creation of a serializer from model """

    def setUp(self) -> None:
        self.part = Part.objects.create(
            nsn="Ship-to",
            nomen="Ship it",
            uom="ea",
            price=1234,
            sac=1,
            serial_control_flag="N",
            lot_control_flag="N",
            recoverability_code="Z",
            shelf_life_code=0,
            controlled_inv_item_code="U",
        )

    def test_address_type_serializer(self):
        serial_object = PartSerializer(self.part)
        self.assertEqual(
            serial_object.data,
            {
                "id": 1,
                "nsn": "Ship-to",
                "nomen": "Ship it",
                "uom": "ea",
                "price": 1234,
                "sac": 1,
                "serial_control_flag": "N",
                "lot_control_flag": "N",
                "recoverability_code": "Z",
                "shelf_life_code": 0,
                "controlled_inv_item_code": "U",
            },
        )
        
