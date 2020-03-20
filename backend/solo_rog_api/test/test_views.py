from unittest.mock import patch, Mock
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.test import override_settings
from solo_rog_api.models import Document

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


class TestDocumentList(APITestCase):
    def setUp(self) -> None:
        self.document = Document.objects.create(sdn="M3030012345678")

    def test_document_list(self) -> None:
        response = self.client.get(reverse("document_list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
