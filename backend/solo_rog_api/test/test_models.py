from typing import Any
from rest_framework.test import APITestCase
from django.test import TestCase
from solo_rog_api.models import (
    Part,
    SuppAdd,
    SubInventory,
    Locator,
    Document,
    Status,
    Address,
    User,
    Warehouse,
    UserInWarehouse,
)


def create_address(**param: Any) -> Address:
    model = Address
    test = model.objects.create(**param)
    assert isinstance(test, model)
    return test


def create_document(**param: Any) -> Document:
    model = Document
    test = model.objects.create(**param)
    assert isinstance(test, model)
    return test


def create_locator(**param: Any) -> Locator:
    model = Locator
    test = model.objects.create(**param)
    assert isinstance(test, model)
    return test


def create_part(**param: Any) -> Part:
    model = Part
    test = model.objects.create(**param)
    assert isinstance(test, model)
    return test


def create_suppadd(**param: Any) -> SuppAdd:
    model = SuppAdd
    test = model.objects.create(**param)
    assert isinstance(test, model)
    return test


def create_subinventory(**param: Any) -> SubInventory:
    model = SubInventory
    test = model.objects.create(**param)
    assert isinstance(test, model)
    return test


def create_status(**param: Any) -> Status:
    model = Status
    test = model.objects.create(**param)
    assert isinstance(test, model)
    return test


class AddressStringTest(APITestCase):
    """ This is the test address model string representation """

    def test_representation(self) -> None:
        created_object = create_address(
            **{
                "name": "AAC-M30300",
                "ric": "SMS",
                "addy1": "addy1",
                "addy2": "addy2",
                "addy3": "addy3",
                "city": "Arlington",
                "state": "VA",
                "zip": "22202",
                "country": "United States",
            }
        )
        self.assertEqual(str(created_object), "AAC-M30300")


class LocatorStringTest(APITestCase):
    """ This is the test Locator model string representation """

    def test_representation(self) -> None:
        created_object = create_locator(**{"id": 1, "code": "M1234AA", "desc": ""})
        self.assertEqual(str(created_object), "M1234AA")


class PartStringTest(APITestCase):
    """ This is the test part model string representation """

    def test_representation(self) -> None:
        created_object = create_part(
            **{
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
            }
        )
        self.assertEqual(created_object.niin, "015061999")
        self.assertEqual(created_object.get_fsc(), "5430")
        self.assertEqual(str(created_object), "TANK,LIQUID STORAGE : 5430 : 015061999")


class SuppaddStringTest(APITestCase):
    """ This is the test suppadd model string representation """

    def test_representation(self) -> None:
        created_object = create_suppadd(**{"id": 1, "code": "MTM_STGE", "desc": ""})
        self.assertEqual(str(created_object), "MTM_STGE")


class SubInventoryStringTest(APITestCase):
    """ This is the test subinventory model string representation """

    def test_representation(self) -> None:
        created_object = create_subinventory(
            **{"id": 1, "code": "M1234AA", "desc": "", "suppadd": None}
        )
        self.assertEqual(str(created_object), "M1234AA")


class StatusStringTest(APITestCase):
    """ This is the test Status model string representation """

    def test_representation(self) -> None:
        doc = create_document(
            **{
                "id": 1,
                "sdn": "M3030012345678",
                "suppadd": None,
                "service_request": None,
                "part": None,
            }
        )
        created_object = create_status(
            **{
                "document": doc,
                "dic": "D6T",
                "status_date": "2020-03-01T21:47:13-05:00",
                "key_and_transmit_date": None,
                "esd": "2020-03-20",
                "projected_qty": 2,
                "received_qty": None,
            }
        )
        self.assertEqual(created_object.gcss_txn_date, "2020-03-01T21:47:13.000Z")
        self.assertEqual(str(created_object), "M3030012345678: D6T")


class DocumentStringTest(APITestCase):
    """ This is the test Document model string representation """

    def test_representation(self) -> None:
        created_object = create_document(
            **{
                "id": 1,
                "sdn": "M3030012345678",
                "suppadd": None,
                "service_request": None,
                "part": None,
            }
        )
        self.assertEqual(created_object.aac, "M30300")
        self.assertEqual(created_object.get_doc_num(), "12345678")
        self.assertEqual(str(created_object), "M3030012345678")


class WarehouseTestCase(TestCase):
    def test_repr(self) -> None:
        warehouse = Warehouse.objects.create(aac="testaac")
        self.assertEqual(repr(warehouse), "<Warehouse aac='testaac'>")

    def test_str(self) -> None:
        warehouse = Warehouse.objects.create(aac="testaac")
        self.assertEqual(str(warehouse), "testaac")


class UserInWarehouseTestCase(TestCase):
    def test_repr(self) -> None:
        warehouse = Warehouse.objects.create(aac="testaac")
        user = User.objects.create(username="testuser")
        membership = UserInWarehouse.objects.create(warehouse=warehouse, user=user)
        self.assertEqual(
            repr(membership), "<UserInWarehouse aac='testaac' username='testuser'>"
        )
