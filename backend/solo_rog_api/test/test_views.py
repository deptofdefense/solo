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


# class DocumentListTestCase(APITestCase):
#
#     def setUp(self) -> None:
#         self.test = Document.objects.create(
#             sdn="M3030012345678", suppadd=None, part=None, service_request=None
#         )
#
#


# class SubInventoryStringTest(APITestCase):
#     """ This is the test subinventory model string representation """
#
#     def test_representation(self) -> None:
#         created_object = create_subinventory(
#             **{"id": 1, "code": "M1234AA", "desc": "", "suppadd": None}
#         )
#         self.assertEqual(str(created_object), "M1234AA")
