# from django.urls import reverse
# from rest_framework import status
#
# from rest_framework.test import APITestCase
# from solo_rog_api.models import Log
#
#
# def create_log(**param: str) -> Log:
#     log = Log.objects.create(**param)
#     assert isinstance(log, Log)
#     return log
#
#
# class LogTest(APITestCase):
#     """ This is the test log model """
#
#     def test_log_create_successful(self) -> None:
#         """ This is the test for creating a log model """
#         payload = {"aac": "M303000", "request_number": "92440017"}
#         log_create = create_log(**payload)
#         self.assertEqual(log_create.aac, payload["aac"])
#         self.assertEqual(log_create.request_number, payload["request_number"])
#
#     def test_log_post(self) -> None:
#         """ This is to test the post of log model """
#         url = reverse("log-list")
#         payload = {"aac": "M303000", "request_number": "92440017"}
#         response = self.client.post(url, payload, format="json")
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)
#
#     def test_representation(self) -> None:
#         log = create_log(**{"aac": "M303000", "request_number": "92440017"})
#         self.assertEqual(str(log), "92440017")
