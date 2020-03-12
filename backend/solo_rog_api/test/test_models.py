from typing import Any
from rest_framework.test import APITestCase
from solo_rog_api.models import (
    AddressType,
    Dic,
    Part,
    SuppAdd,
    SubInventory,
    ServiceRequest,
    Locator,
    Document,
)


def create_address_type(**param: Any) -> AddressType:
    model = AddressType
    test = model.objects.create(**param)
    assert isinstance(test, model)
    return test


class AddressTypeStringTest(APITestCase):
    """ This is the test address type model string representation """

    def test_representation(self) -> None:
        created_object = create_address_type(
            **{"id": 1, "type": "Ship-to", "desc": "Ship it"}
        )
        self.assertEqual(str(created_object), "Ship-to")


def create_dic(**param: Any) -> Dic:
    model = Dic
    test = model.objects.create(**param)
    assert isinstance(test, model)
    return test


class DicStringTest(APITestCase):
    """ This is the test dic model string representation """

    def test_representation(self) -> None:
        created_object = create_dic(**{"id": 1, "code": "D6T", "desc": ""})
        self.assertEqual(str(created_object), "D6T")


def create_locator(**param: Any) -> Locator:
    model = Locator
    test = model.objects.create(**param)
    assert isinstance(test, model)
    return test


class LocatorStringTest(APITestCase):
    """ This is the test Locator model string representation """

    def test_representation(self) -> None:
        created_object = create_locator(**{"id": 1, "code": "M1234AA", "desc": ""})
        self.assertEqual(str(created_object), "M1234AA")


def create_part(**param: Any) -> Part:
    model = Part
    test = model.objects.create(**param)
    assert isinstance(test, model)
    return test


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
        self.assertEqual(created_object.get_niin(), "015061999")
        self.assertEqual(created_object.get_fsc(), "5430")
        self.assertEqual(str(created_object), "TANK,LIQUID STORAGE : 5430 : 015061999")


def create_suppadd(**param: Any) -> SuppAdd:
    model = SuppAdd
    test = model.objects.create(**param)
    assert isinstance(test, model)
    return test


class SuppaddStringTest(APITestCase):
    """ This is the test suppadd model string representation """

    def test_representation(self) -> None:
        created_object = create_suppadd(**{"id": 1, "code": "MTM_STGE", "desc": ""})
        self.assertEqual(str(created_object), "MTM_STGE")


def create_subinventory(**param: Any) -> SubInventory:
    model = SubInventory
    test = model.objects.create(**param)
    assert isinstance(test, model)
    return test


class SubInventoryStringTest(APITestCase):
    """ This is the test subinventory model string representation """

    def test_representation(self) -> None:
        created_object = create_subinventory(
            **{"id": 1, "code": "M1234AA", "desc": "", "suppadd": None}
        )
        self.assertEqual(str(created_object), "M1234AA")


def create_service_request(**param: Any) -> ServiceRequest:
    model = ServiceRequest
    test = model.objects.create(**param)
    assert isinstance(test, model)
    return test


class ServiceStringTest(APITestCase):
    """ This is the test Service Request model string representation """

    def test_representation(self) -> None:
        created_object = create_service_request(
            **{"id": 1, "service_request": "12345678"}
        )
        self.assertEqual(str(created_object), "12345678")


def create_document(**param: Any) -> Document:
    model = Document
    test = model.objects.create(**param)
    assert isinstance(test, model)
    return test


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
        self.assertEqual(str(created_object), "M3030012345678")
