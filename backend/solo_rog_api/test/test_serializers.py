from unittest.mock import patch, Mock
import jwt
from jwt.exceptions import InvalidSignatureError
from rest_framework.exceptions import AuthenticationFailed
from django.test import TestCase
from django.conf import settings
from solo_rog_api.models import (
    Part,
    SuppAdd,
    SubInventory,
    Locator,
    Document,
    Status,
    Address,
    User,
    UserInWarehouse,
    Warehouse,
)
from solo_rog_api.serializers import (
    TokenObtainSerializer,
    PartSerializer,
    SuppAddSerializer,
    SubInventorySerializer,
    LocatorSerializer,
    DocumentSerializer,
    StatusSerializer,
    AddressSerializer,
    UserInWarehouseSerializer,
)


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
        self.assertIn("access", serializer.validated_data)
        self.assertIn("refresh", serializer.validated_data)

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
            dic="D6T",
            received_by=None,
        )

    def test_status_serializer(self) -> None:
        serial_object = StatusSerializer(self.test)
        self.assertDictContainsSubset(
            {
                "id": 1,
                "document": None,
                "dic": "D6T",
                "status_date": "2020-03-01T21:47:13-05:00",
                "key_and_transmit_date": None,
                "esd": "2020-03-20",
                "projected_qty": 2,
                "received_qty": None,
                "received_by": None,
            },
            serial_object.data,
        )

    def test_status_serializer_serialization(self) -> None:
        data = {"status_date": "2020-03-01T21:47:13-05:00", "dic": "COR"}
        serializer = StatusSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        status = serializer.save()
        from_db = Status.objects.get(id=status.id)
        self.assertEqual(from_db.gcss_txn_date, "2020-03-02T02:47:13.000Z")


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
                "statuses": [],
                "suppadd": None,
                "part": None,
                "service_request": None,
                "sdn": "M1234AA",
                "ship_to": None,
                "holder": None,
            },
        )


class AddressSerializerTest(TestCase):
    """ Test Address creation of a serializer from model """

    def setUp(self) -> None:
        self.test = Address.objects.create(
            name="AAC-M30300",
            ric="SMS",
            addy1="addy1",
            addy2="addy2",
            addy3="addy3",
            city="Arlington",
            state="VA",
            zip="22202",
            country="United States",
        )

    def test_address_serializer(self) -> None:
        serial_object = AddressSerializer(self.test)
        self.assertEqual(
            serial_object.data,
            {
                "id": 1,
                "name": "AAC-M30300",
                "ric": "SMS",
                "addy1": "addy1",
                "addy2": "addy2",
                "addy3": "addy3",
                "city": "Arlington",
                "state": "VA",
                "zip": "22202",
                "country": "United States",
            },
        )


class UserInWarehouseSerializerTestCase(TestCase):
    def setUp(self) -> None:
        self.manager = User.objects.create(username="testmanager")
        self.user = User.objects.create(
            username="testuser", first_name="micheal", last_name="scott"
        )
        self.warehouse = Warehouse.objects.create(aac="TESTAAC")
        UserInWarehouse.objects.create(
            user=self.manager, warehouse=self.warehouse, manager=True
        )
        self.ctx = {"user": self.manager}

    def tearDown(self) -> None:
        User.objects.all().delete()
        Warehouse.objects.all().delete()
        UserInWarehouse.objects.all().delete()

    def test_can_serialize_user_in_warehouse(self) -> None:
        instance = UserInWarehouse.objects.create(
            user=self.user, warehouse=self.warehouse, d6t_permission=True
        )
        serializer = UserInWarehouseSerializer(instance)
        serialized = serializer.data
        self.assertDictContainsSubset(
            {
                "warehouse": "TESTAAC",
                "user": {
                    "id": self.user.id,
                    "username": self.user.username,
                    "first_name": self.user.first_name,
                    "last_name": self.user.last_name,
                },
                "d6t_permission": True,
                "cor_permission": False,
                "manager": False,
            },
            serialized,
        )

    def test_can_add_user_to_warehouse(self) -> None:
        data = {
            "user_id": self.user.id,
            "warehouse_id": self.warehouse.id,
            "cor_permission": True,
        }
        serializer = UserInWarehouseSerializer(data=data, context=self.ctx)

        self.assertTrue(serializer.is_valid())
        serializer.save()
        # 2: manager and new user membership
        self.assertEqual(UserInWarehouse.objects.count(), 2)
        membership = UserInWarehouse.objects.get(user_id=self.user.id)
        self.assertEqual(membership.user.username, self.user.username)
        self.assertEqual(membership.warehouse.aac, self.warehouse.aac)
        self.assertEqual(membership.cor_permission, True)
        self.assertEqual(membership.d6t_permission, False)
        self.assertEqual(membership.manager, False)

    def test_can_only_add_users_to_managed_warehouses(self) -> None:
        not_manager = User.objects.create(username="not_manager")
        data = {
            "user_id": self.user.id,
            "warehouse_id": self.warehouse.id,
            "cor_permission": True,
            "d6t_permission": True,
        }
        serializer = UserInWarehouseSerializer(data=data, context={"user": not_manager})
        self.assertFalse(serializer.is_valid())
        self.assertIn("warehouse_id", serializer.errors)
        self.assertEqual(serializer.errors["warehouse_id"][0].code, "does_not_exist")

    def test_cannot_duplicate_user_in_warehouse(self) -> None:
        UserInWarehouse.objects.create(
            user=self.user, warehouse=self.warehouse, cor_permission=True
        )
        data = {
            "user_id": self.user.id,
            "warehouse_id": self.warehouse.id,
            "cor_permission": False,
        }
        serializer = UserInWarehouseSerializer(data=data, context=self.ctx)
        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)
        self.assertEqual(serializer.errors["non_field_errors"][0].code, "unique")

    def test_can_update_permissions_for_user_in_warehouse(self) -> None:
        existing = UserInWarehouse.objects.create(
            user=self.user, warehouse=self.warehouse, d6t_permission=True
        )
        data = {
            "cor_permission": True,
            "d6t_permission": False,
        }
        serializer = UserInWarehouseSerializer(
            instance=existing, data=data, context=self.ctx, partial=True
        )
        self.assertTrue(serializer.is_valid())
        serializer.save()
        refreshed = UserInWarehouse.objects.get(id=existing.id)
        self.assertEqual(refreshed.user.username, self.user.username)
        self.assertEqual(refreshed.warehouse.aac, self.warehouse.aac)
        self.assertTrue(refreshed.cor_permission)
        self.assertFalse(refreshed.d6t_permission)

    def test_cannot_update_warehouse_or_user_on_existing_instance(self) -> None:
        other_user = User.objects.create(username="otheruser")
        other_warehouse = Warehouse.objects.create(aac="otherwarehouse")
        UserInWarehouse.objects.create(
            user=self.manager, warehouse=other_warehouse, manager=True
        )
        existing = UserInWarehouse.objects.create(
            user=self.user, warehouse=self.warehouse, cor_permission=False
        )
        data = {
            "warehouse_id": other_warehouse.id,
            "user_id": other_user.id,
            "cor_permission": True,
        }
        serializer = UserInWarehouseSerializer(
            instance=existing, data=data, context=self.ctx, partial=True
        )
        self.assertTrue(serializer.is_valid())
        serializer.save()
        refreshed = UserInWarehouse.objects.get(id=existing.id)
        self.assertEqual(refreshed.user.id, self.user.id)
        self.assertEqual(refreshed.warehouse.id, self.warehouse.id)
        self.assertTrue(refreshed.cor_permission)
