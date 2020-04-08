# pylint: disable=unused-argument
from typing import List
from unittest.mock import patch, Mock
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.exceptions import AuthenticationFailed
from django.urls import reverse
from django.utils import timezone
from django.test import override_settings
from solo_rog_api.models import (
    Status,
    SuppAdd,
    Locator,
    Document,
    SubInventory,
    Warehouse,
    User,
    UserInWarehouse,
)


@patch("solo_rog_api.serializers.authenticate", autospec=True)
class ObtainTokenViewTestCase(APITestCase):
    user = None

    @classmethod
    def setUpTestData(cls) -> None:
        cls.user = User.objects.create(username="0123456789")

    def test_user_can_retrieve_tokens(self, auth_mock: Mock) -> None:
        auth_mock.return_value = self.user
        response = self.client.post(reverse("login"))
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.json())

    def test_unauthenticated_user_cannot_retrieve_tokens(self, auth_mock: Mock) -> None:
        auth_mock.side_effect = AuthenticationFailed()
        response = self.client.post(reverse("login"))
        self.assertEqual(response.status_code, 401)


class DocumentTests(APITestCase):
    base_url = reverse("document_list")

    def test_get_documents_nofilter(self) -> None:
        base_response = self.client.get(self.base_url, format="json")
        self.assertEqual(base_response.status_code, status.HTTP_200_OK)

    def test_get_documents_commodfilter(self) -> None:
        commod_url = self.base_url + "?commod="
        commod_response = self.client.get(commod_url, format="json")
        self.assertEqual(commod_response.status_code, status.HTTP_200_OK)

    def test_get_documents_sdnfilter(self) -> None:
        sdn_url = self.base_url + "?sdn="
        sdn_response = self.client.get(sdn_url, format="json")
        self.assertEqual(sdn_response.status_code, status.HTTP_200_OK)

    def test_get_documents_nomenfilter(self) -> None:
        nomen_url = self.base_url + "?nomen="
        nomen_response = self.client.get(nomen_url, format="json")
        self.assertEqual(nomen_response.status_code, status.HTTP_200_OK)

    def test_get_documents_doc_statusfilter(self) -> None:
        doc_status_url = self.base_url + "?status="
        doc_status_response = self.client.get(doc_status_url, format="json")
        self.assertEqual(doc_status_response.status_code, status.HTTP_200_OK)

    def test_get_documents_pagination(self) -> None:
        pagination_url = self.base_url + "?page=1"
        pagination_response = self.client.get(pagination_url, format="json")
        self.assertTrue(pagination_response.status_code, status.HTTP_200_OK)

    def test_get_documents_out_of_bounds(self) -> None:
        out_of_bounds_url = self.base_url + "?page=1000000000"
        out_of_bounds_response = self.client.get(out_of_bounds_url, format="json")
        self.assertEqual(out_of_bounds_response.status_code, status.HTTP_404_NOT_FOUND)


@override_settings(CELERY_TASK_ALWAYS_EAGER=True)
@patch("solo_rog_api.serializers.gcss_submit_status")
class SubmitD6TTestCase(APITestCase):
    base_url = reverse("bulk_d6t")
    now = timezone.now()

    def setUp(self) -> None:
        self.suppadd = SuppAdd.objects.create(code="suppa")
        self.subinv = SubInventory.objects.create(
            code="testsubinv", suppadd=self.suppadd
        )
        self.locator = Locator.objects.create(
            code="testlocator", subinventorys=self.subinv
        )
        dics = ["AE1", "AS1", "AS2", "D6T", "COR"]
        self.document = Document.objects.create(sdn="testsdn", suppadd=self.suppadd)
        Status.objects.bulk_create(
            [
                Status(dic=dic, document_id=self.document.id, status_date=self.now)
                for dic in dics[:3]
            ]
        )
        self.data = [
            {
                "sdn": self.document.sdn,
                "received_quantity": 1,
                "subinventory": self.subinv.code,
                "locator": self.locator.code,
            }
        ]

    def tearDown(self) -> None:
        Document.objects.all().delete()
        Status.objects.all().delete()
        SubInventory.objects.all().delete()
        SuppAdd.objects.all().delete()

    def test_empty_bulk_post_d6t_submission(self, *args: Mock) -> None:
        test_data: List[str] = []
        base_response = self.client.post(self.base_url, test_data, format="json")
        self.assertEqual(base_response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_can_bulk_submit_d6t_one(self, submit_mock: Mock) -> None:
        bulk_d6t_response = self.client.post(self.base_url, self.data, format="json")
        self.assertEqual(bulk_d6t_response.status_code, status.HTTP_201_CREATED)
        submit_mock.delay.assert_called_once_with(self.document.id, "D6T")
        self.assertTrue(
            Status.objects.filter(
                document_id=self.document.id,
                dic="D6T",
                subinventory__code=self.subinv.code,
                locator__code=self.locator.code,
            ).exists()
        )

    def test_can_bulk_submit_d6t_two(self, submit_mock: Mock) -> None:
        response = self.client.post(self.base_url, self.data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        submit_mock.delay.assert_called_once_with(self.document.id, "D6T")
        data = dict(response.data[0])
        self.assertDictContainsSubset(
            {
                "document": self.document.id,
                "subinventory": self.subinv.id,
                "received_qty": 1,
                "dic": "D6T",
            },
            data,
        )

    def test_cannot_submit_d6t_when_document_was_already_d6t(self, *args: Mock) -> None:
        Status.objects.create(
            document_id=self.document.id, dic="D6T", status_date=self.now
        )
        response = self.client.post(self.base_url, self.data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("non_field_errors", response.data[0])
        self.assertIn(
            "Document does not exist or is not eligible",
            str(response.data[0]["non_field_errors"][0]),
        )

    def test_status_cannot_submit_d6t_for_document_that_does_not_have_as2(
        self, *args: Mock
    ) -> None:
        Status.objects.filter(dic="AS2", document_id=self.document.id).delete()
        response = self.client.post(self.base_url, self.data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("non_field_errors", response.data[0])
        self.assertIn(
            "Document does not exist or is not eligible",
            str(response.data[0]["non_field_errors"][0]),
        )

    def test_cannot_submit_d6t_using_invalid_subinventory(self, *args: Mock) -> None:
        response = self.client.post(
            self.base_url,
            [{**self.data[0], "subinventory": "invalidsubbinv"}],
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("non_field_errors", response.data[0])
        self.assertIn(
            "SubInventory invalidsubbinv is not valid for testsdn",
            str(response.data[0]["non_field_errors"][0]),
        )

    def test_invalid_locator_for_d6t_submission(self, *args: Mock) -> None:
        response = self.client.post(
            self.base_url,
            [{**self.data[0], "locator": "invalidlocator"}],
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "Locator invalidlocator is not valid for testsubinv in document testsdn",
            str(response.data[0]["non_field_errors"][0]),
        )


@override_settings(CELERY_TASK_ALWAYS_EAGER=True)
@patch("solo_rog_api.serializers.gcss_submit_status")
class BulkCORTests(APITestCase):
    base_url = reverse("bulk_cor")
    now = timezone.now()

    def setUp(self) -> None:
        self.suppadd = SuppAdd.objects.create(code="suppa")
        self.subinv = SubInventory.objects.create(
            code="testsubinv", suppadd=self.suppadd
        )
        self.locator = Locator.objects.create(
            code="testlocator", subinventorys=self.subinv
        )
        dics = ["AE1", "AS1", "AS2", "D6T", "COR"]
        self.document = Document.objects.create(sdn="testsdn", suppadd=self.suppadd)
        Status.objects.bulk_create(
            [
                Status(dic=dic, document_id=self.document.id, status_date=self.now)
                for dic in dics[:4]
            ]
        )
        self.data = [
            {
                "sdn": self.document.sdn,
                "received_quantity": 1,
                "subinventory": self.subinv.code,
                "locator": self.locator.code,
            }
        ]
        self.client.post(reverse("bulk_d6t"), self.data, format="json")
        self.data = [
            {
                "sdn": self.document.sdn,
                "received_quantity": 1,
                "subinventory": self.subinv.code,
                "locator": self.locator.code,
                "received_by": "General Phansiri",
            }
        ]

    def test_empty_bulk_post_cor_submission(self, *args: Mock) -> None:
        test_data: List[str] = []
        base_response = self.client.post(self.base_url, test_data, format="json")
        self.assertEqual(base_response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_can_bulk_submit_cor(self, submit_mock: Mock) -> None:
        response = self.client.post(self.base_url, self.data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        submit_mock.delay.assert_called_once_with(self.document.id, "COR")
        data = dict(response.data[0])
        self.assertDictContainsSubset(
            {
                "document": self.document.id,
                "received_by": "General Phansiri",
                "dic": "COR",
            },
            data,
        )

    def test_cannot_submit_cor_when_document_was_already_cor(self, *args: Mock) -> None:
        Status.objects.create(
            document_id=self.document.id, dic="COR", status_date=self.now
        )
        response = self.client.post(self.base_url, self.data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("non_field_errors", response.data[0])
        self.assertIn(
            "Document does not exist or is not eligible",
            str(response.data[0]["non_field_errors"][0]),
        )

    def test_status_cannot_submit_cor_for_document_that_does_not_have_d6t(
        self, *args: Mock
    ) -> None:
        Status.objects.filter(dic="D6T", document_id=self.document.id).delete()
        response = self.client.post(self.base_url, self.data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("non_field_errors", response.data[0])
        self.assertIn(
            "Document does not exist or is not eligible",
            str(response.data[0]["non_field_errors"][0]),
        )


class RetrieveWarehouseUsersTestCase(APITestCase):
    url = reverse("warehouse-users-list")

    def setUp(self) -> None:
        self.jim = User.objects.create(
            username="jim", first_name="jimothy", last_name="halpert"
        )
        self.micheal = User.objects.create(
            username="mike", first_name="micheal", last_name="scott"
        )
        self.manager = User.objects.create(username="manager")
        self.warehouse = Warehouse.objects.create(aac="dunder")
        UserInWarehouse.objects.create(
            user=self.manager, warehouse=self.warehouse, manager=True
        )

    def test_can_list_users_by_warehouse(self) -> None:
        self.client.force_authenticate(user=self.manager)
        UserInWarehouse.objects.create(user=self.jim, warehouse=self.warehouse)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)
        self.assertIn("next", response.data)
        self.assertIn("previous", response.data)
        self.assertIn("count", response.data)
        results = response.data["results"]
        self.assertEqual(len(results), 1)
        self.assertDictEqual(
            results[0]["user"],
            {
                "id": self.jim.id,
                "username": self.jim.username,
                "first_name": self.jim.first_name,
                "last_name": self.jim.last_name,
            },
        )

    def test_users_from_all_managed_warehouses_returned(self) -> None:
        self.client.force_authenticate(user=self.manager)
        other_warehouse = Warehouse.objects.create(aac="differentaac")
        UserInWarehouse.objects.create(
            user=self.manager, warehouse=other_warehouse, manager=True
        )
        UserInWarehouse.objects.create(user=self.jim, warehouse=self.warehouse)
        UserInWarehouse.objects.create(user=self.micheal, warehouse=other_warehouse)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)
        results = response.data["results"]
        self.assertEqual(len(results), 2)
        self.assertCountEqual(
            [r["user"]["username"] for r in results],
            [self.jim.username, self.micheal.username],
        )
        self.assertCountEqual(
            [r["warehouse"] for r in results], [self.warehouse.aac, other_warehouse.aac]
        )

    def test_only_users_from_managed_warehouses_returned(self) -> None:
        self.client.force_authenticate(user=self.manager)
        other_warehouse = Warehouse.objects.create(aac="differentaac")
        UserInWarehouse.objects.create(user=self.jim, warehouse=self.warehouse)
        UserInWarehouse.objects.create(user=self.micheal, warehouse=other_warehouse)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)
        results = response.data["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["user"]["username"], self.jim.username)
        self.assertEqual(results[0]["warehouse"], self.warehouse.aac)

    def test_get_permissions_for_single_user_in_warehouse(self) -> None:
        instance = UserInWarehouse.objects.create(
            user=self.jim, warehouse=self.warehouse
        )
        self.client.force_authenticate(user=self.manager)
        response = self.client.get(
            reverse("warehouse-users-detail", args=[instance.id])
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictContainsSubset(
            {
                "id": instance.id,
                "user": {
                    "username": self.jim.username,
                    "id": self.jim.id,
                    "first_name": self.jim.first_name,
                    "last_name": self.jim.last_name,
                },
                "warehouse": self.warehouse.aac,
                "manager": False,
                "d6t_permission": False,
                "cor_permission": False,
            },
            response.data,
        )


class WriteWarehouseUsersTestCase(APITestCase):
    def setUp(self) -> None:
        self.jim = User.objects.create(
            username="jim", first_name="jimothy", last_name="halpert"
        )
        self.manager = User.objects.create(username="manager")
        self.warehouse = Warehouse.objects.create(aac="dunder")
        UserInWarehouse.objects.create(
            user=self.manager, warehouse=self.warehouse, manager=True
        )

    def test_can_create_user_in_warehouse(self) -> None:
        self.client.force_authenticate(user=self.manager)
        data = {
            "warehouse_id": self.warehouse.id,
            "user_id": self.jim.id,
            "d6t_permission": True,
            "cor_permission": False,
        }
        response = self.client.post(reverse("warehouse-users-list"), data=data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertDictContainsSubset(
            {
                "user": {
                    "id": self.jim.id,
                    "username": self.jim.username,
                    "first_name": self.jim.first_name,
                    "last_name": self.jim.last_name,
                },
                "warehouse": self.warehouse.aac,
                "d6t_permission": True,
                "cor_permission": False,
                "manager": False,
            },
            response.data,
        )
        self.assertTrue(
            UserInWarehouse.objects.filter(
                user_id=self.jim.id,
                warehouse_id=self.warehouse.id,
                d6t_permission=True,
                cor_permission=False,
                manager=False,
            ).exists()
        )

    def test_can_patch_user_in_warehouse(self) -> None:
        self.client.force_authenticate(user=self.manager)
        instance = UserInWarehouse.objects.create(
            user=self.jim,
            warehouse=self.warehouse,
            d6t_permission=True,
            cor_permission=False,
        )
        data = {"d6t_permission": False, "cor_permission": True}
        response = self.client.patch(
            reverse("warehouse-users-detail", args=[instance.id]), data=data
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            UserInWarehouse.objects.filter(
                user_id=self.jim.id,
                warehouse_id=self.warehouse.id,
                d6t_permission=False,
                cor_permission=True,
                manager=False,
            ).exists()
        )

    def test_can_delete_user_from_warehouse(self) -> None:
        self.client.force_authenticate(user=self.manager)
        instance = UserInWarehouse.objects.create(
            user=self.jim, warehouse=self.warehouse
        )
        response = self.client.delete(
            reverse("warehouse-users-detail", args=[instance.id])
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            UserInWarehouse.objects.filter(
                user_id=self.jim.id, warehouse_id=self.warehouse.id
            ).exists()
        )
