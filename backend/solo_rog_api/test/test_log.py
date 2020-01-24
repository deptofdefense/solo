from django.urls import reverse
from rest_framework import status

# from django.test import TestCase
from rest_framework.test import APITestCase
from solo_rog_api.models import Log


def create_log(**param):
    return Log.objects.create(**param)


class LogTest(APITestCase):
    """ This is the test log model """

    def test_log_create_successful(self):
        """ This is the test for creating a log model """
        payload = {"aac": "M303000", "request_number": "92440017"}
        log_create = create_log(**payload)
        self.assertEqual(log_create.aac, payload["aac"])
        self.assertEqual(log_create.request_number, payload["request_number"])

    def test_log_post(self):
        """ This is to test the post of log model """
        url = reverse("log-list")
        payload = {"aac": "M303000", "request_number": "92440017"}
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
