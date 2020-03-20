from unittest.mock import patch, Mock
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.test import override_settings

User = get_user_model()


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
        self.assertIn("refresh", response.json())

    def test_unauthenticated_user_cannot_retrieve_tokens(self, auth_mock: Mock) -> None:
        auth_mock.side_effect = AuthenticationFailed()
        response = self.client.post(reverse("login"))
        self.assertEqual(response.status_code, 401)


@override_settings(CELERY_TASK_ALWAYS_EAGER=True)
class CeleryDebugMessageTestCase(APITestCase):
    user = User()

    @classmethod
    def setUpTestData(cls) -> None:
        cls.user = User.objects.create(username="scott")

    @classmethod
    def tearDownClass(cls) -> None:
        User.objects.all().delete()

    def test_authentication_required(self) -> None:
        response = self.client.post(reverse("workerlog"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch("solo_rog_api.tasks.print")
    def test_queues_message(self, print_mock: Mock) -> None:
        self.client.force_authenticate(self.user)
        with self.assertNumQueries(0):
            response = self.client.post(
                reverse("workerlog"), data={"msg": "testmessage"}
            )
        self.assertTrue(print_mock.called)
        self.assertEqual(
            print_mock.call_args[0][0], f"[{self.user.username}]: testmessage"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn("task_id", data)
        self.assertIsInstance(data["task_id"], str)


base_url = reverse("document_list")


class DocumentTests(APITestCase):
    def test_get_documents_nofilter(self) -> None:
        base_response = self.client.get(base_url, format="json")
        self.assertEqual(base_response.status_code, status.HTTP_200_OK)

    def test_get_documents_commodfilter(self) -> None:
        commod_url = base_url + "?commod="
        commod_response = self.client.get(commod_url, format="json")
        self.assertEqual(commod_response.status_code, status.HTTP_200_OK)

    def test_get_documents_sdnfilter(self) -> None:
        sdn_url = base_url + "?sdn="
        sdn_response = self.client.get(sdn_url, format="json")
        self.assertEqual(sdn_response.status_code, status.HTTP_200_OK)

    def test_get_documents_nomenfilter(self) -> None:
        nomen_url = base_url + "?nomen="
        nomen_response = self.client.get(nomen_url, format="json")
        self.assertEqual(nomen_response.status_code, status.HTTP_200_OK)

    def test_get_documents_doc_statusfilter(self) -> None:
        doc_status_url = base_url + "?status="
        doc_status_response = self.client.get(doc_status_url, format="json")
        self.assertEqual(doc_status_response.status_code, status.HTTP_200_OK)

    def test_get_documents_pagination(self) -> None:
        pagination_url = base_url + "?page=1"
        pagination_response = self.client.get(pagination_url, format="json")
        self.assertTrue(pagination_response.status_code, status.HTTP_200_OK)

    def test_get_documents_out_of_bounds(self) -> None:
        out_of_bounds_url = base_url + "?page=1000000000"
        out_of_bounds_response = self.client.get(out_of_bounds_url, format="json")
        self.assertEqual(out_of_bounds_response.status_code, status.HTTP_404_NOT_FOUND)
