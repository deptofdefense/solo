from django.test import TestCase

class SimpleInitialTest(TestCase):

    def test_add_numbers(self):
        """Initial test to add two numbers"""
        self.assertEqual((1+2), 3)