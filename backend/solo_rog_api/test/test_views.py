from unittest.mock import patch
from rest_framework.test import APITestCase
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model


User = get_user_model()


@patch("solo_rog_api.serializers.authenticate", autospec=True)
class ObtainTokenViewTestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create(username="0123456789")

    def test_user_can_retrieve_tokens(self, auth_mock):
        auth_mock.return_value = self.user
        response = self.client.post("/login/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.json())
        self.assertIn("refresh", response.json())

    def test_unauthenticated_user_cannot_retrieve_tokens(self, auth_mock):
        auth_mock.side_effect = AuthenticationFailed()
        response = self.client.post("/login/")
        self.assertEqual(response.status_code, 401)
