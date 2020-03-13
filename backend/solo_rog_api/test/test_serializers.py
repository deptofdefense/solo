from unittest.mock import patch, Mock
import jwt
from jwt.exceptions import InvalidSignatureError
from rest_framework.exceptions import AuthenticationFailed
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.conf import settings
from solo_rog_api.models import (
    AddressType,
    Dic,
    Part,
    ServiceRequest,
    SuppAdd,
    SubInventory,
    Locator,
    Document,
    Status,
)
from solo_rog_api.serializers import (
    TokenObtainSerializer,
    AddressTypeSerializer,
    DicSerializer,
    PartSerializer,
    ServiceRequestSerializer,
    SuppAddSerializer,
    SubInventorySerializer,
    LocatorSerializer,
    DocumentSerializer,
    StatusSerializer,
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

    def test_address_type_serializer(self) -> None:
        serial_object = AddressTypeSerializer(self.test)
        self.assertEqual(
            serial_object.data, {"id": 1, "type": "Ship-to", "desc": "Ship it"}
        )


class ServiceRequestSerializerTest(TestCase):
    """ Test ServiceRequest creation of a serializer from model """

    def setUp(self) -> None:
        self.test = ServiceRequest.objects.create(service_request="12345678")

    def test_servicerequest_serializer(self) -> None:
        serial_object = ServiceRequestSerializer(self.test)
        self.assertEqual(serial_object.data, {"id": 1, "service_request": "12345678"})


class DicSerializerTest(TestCase):
    """ Test Dic creation of a serializer from model """

    def setUp(self) -> None:
        self.test = Dic.objects.create(code="AB1", desc="")

    def test_dic_serializer(self) -> None:
        serial_object = DicSerializer(self.test)
        self.assertEqual(serial_object.data, {"id": 1, "code": "AB1", "desc": ""})


class SuppAddSerializerTest(TestCase):
    """ Test SuppAdd creation of a serializer from model """

    def setUp(self) -> None:
        self.test = SuppAdd.objects.create(code="YMTM", desc="")

    def test_suppadd_serializer(self) -> None:
        serial_object = SuppAddSerializer(self.test)
        self.assertEqual(
            serial_object.data,
            {"id": 1, "subinventorys": [], "code": "YMTM", "desc": ""},
        )


class SubInventorySerializerTest(TestCase):
    """ Test SubInventory creation of a serializer from model """

    def setUp(self) -> None:
        self.test = SubInventory.objects.create(code="MTM_STGE", desc="")

    def test_subinventory_serializer(self) -> None:
        serial_object = SubInventorySerializer(self.test)
        self.assertEqual(
            serial_object.data,
            {"id": 1, "locators": [], "code": "MTM_STGE", "desc": "", "suppadd": None},
        )


class LocatorSerializerTest(TestCase):
    """ Test Locator creation of a serializer from model """

    def setUp(self) -> None:
        self.test = Locator.objects.create(code="M1234AA", desc="")

    def test_locator_serializer(self) -> None:
        serial_object = LocatorSerializer(self.test)
        self.assertEqual(
            serial_object.data,
            {"id": 1, "code": "M1234AA", "desc": "", "subinventorys": None},
        )


class StatusSerializerTest(TestCase):
    """ Test Status creation of a serializer from model """

    def setUp(self) -> None:
        self.test = Status.objects.create(
            status_date="2020-03-01T21:47:13-05:00",
            esd="2020-03-20",
            projected_qty=2,
            document=None,
            dic=None,
        )

    def test_status_serializer(self) -> None:
        serial_object = StatusSerializer(self.test)
        self.assertEqual(
            serial_object.data,
            {
                "id": 1,
                "document": None,
                "dic": None,
                "status_date": "2020-03-01T21:47:13-05:00",
                "key_and_transmit_date": None,
                "esd": "2020-03-20",
                "projected_qty": 2,
                "received_qty": None,
            },
        )

    def test_status_serializer_serialization(self) -> None:
        data = {
            "status_date": "2020-03-01T21:47:13-05:00",
        }
        serializer = StatusSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        status = serializer.save()
        from_db = Status.objects.get(id=status.id)
        self.assertEqual(from_db.status_converted_date(), "2020-03-02T02:47:13.000Z")


class PartSerializerTest(TestCase):
    """ Test Part creation of a serializer from model """

    def setUp(self) -> None:
        self.part = Part.objects.create(
            nsn="5430015061999",
            nomen="TANK,LIQUID STORAGE",
            uom="ea",
            price=1234,
            sac=1,
            serial_control_flag="N",
            lot_control_flag="N",
            recoverability_code="Z",
            shelf_life_code=0,
            controlled_inv_item_code="U",
        )

    def test_part_serializer(self) -> None:
        serial_object = PartSerializer(self.part)
        self.assertEqual(
            serial_object.data,
            {
                "id": 1,
                "nsn": "5430015061999",
                "nomen": "TANK,LIQUID STORAGE",
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


class DocumentSerializerTest(TestCase):
    """ Test Document creation of a serializer from model """

    def setUp(self) -> None:
        self.test = Document.objects.create(
            sdn="M1234AA", suppadd=None, part=None, service_request=None
        )

    def test_document_serializer(self) -> None:
        serial_object = DocumentSerializer(self.test)
        self.assertEqual(
            serial_object.data,
            {
                "id": 1,
                "sdn": "M1234AA",
                "suppadd": None,
                "service_request": None,
                "part": None,
            },
        )
