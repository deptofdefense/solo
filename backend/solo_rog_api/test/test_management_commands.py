from unittest.mock import patch, Mock
from django.test import TestCase, override_settings
from django.core.management import call_command
from solo_rog_api.management.commands import populate_fake
from solo_rog_api.models import (
    User,
    Address,
    Part,
    SuppAdd,
    SubInventory,
    Locator,
    Document,
    Status,
)


class CreateFakeDataTestCase(TestCase):
    import_root = "solo_rog_api.management.commands.populate_fake"

    def test_creates_fake_users(self) -> None:
        User.objects.create(username="deleteme")
        self.assertEqual(User.objects.count(), 1)
        populate_fake.create_fake_users(2)
        self.assertEqual(User.objects.count(), 2)

    def test_creates_fake_parts(self) -> None:
        populate_fake.create_fake_parts(2)
        self.assertEqual(Part.objects.count(), 2)

    def test_creates_fake_suppadds(self) -> None:
        populate_fake.create_fake_suppadds(1)
        self.assertEqual(SuppAdd.objects.count(), 1)

    @patch("solo_rog_api.management.commands.populate_fake.random.randint")
    def test_creates_fake_subinventories(self, randint_mock: Mock) -> None:
        randint_mock.return_value = 3
        SuppAdd.objects.create(code="testcode", desc="testdesc")
        populate_fake.create_fake_subinventorys(3)
        self.assertEqual(SubInventory.objects.count(), 3)
        self.assertEqual(
            SubInventory.objects.filter(
                suppadd__code="testcode", suppadd__desc="testdesc"
            ).count(),
            3,
        )

    @patch("solo_rog_api.management.commands.populate_fake.random.randint")
    def test_creates_fake_locators(self, randint_mock: Mock) -> None:
        randint_mock.return_value = 3
        SubInventory.objects.create(code="testcode", desc="testdesc")
        populate_fake.create_fake_locators()
        self.assertEqual(Locator.objects.count(), 3)
        self.assertEqual(
            Locator.objects.filter(subinventorys__code="testcode").count(), 3
        )

    def test_creates_fake_documents(self) -> None:
        SuppAdd.objects.create(code="testcode", desc="testdesc")
        populate_fake.create_fake_addresses(2)
        Part.objects.create(nsn="testnsn")
        populate_fake.create_fake_documents(1)
        self.assertEqual(Document.objects.count(), 1)
        self.assertTrue(
            Document.objects.filter(
                part__nsn="testnsn",
                suppadd__code="testcode",
                sdn__isnull=False,
                service_request__isnull=False,
            ).exists()
        )

    @patch("solo_rog_api.management.commands.populate_fake.random.randint")
    def test_creates_fake_statuses_ae1(self, randint_mock: Mock) -> None:
        randint_mock.return_value = 1
        Document.objects.create(sdn="testsdn")
        populate_fake.create_fake_statuses_for_documents()
        self.assertEqual(Status.objects.count(), 1)
        self.assertTrue(Status.objects.filter(dic="AE1").exists())

    @patch("solo_rog_api.management.commands.populate_fake.random.randint")
    def test_creates_fake_statuses_as2(self, randint_mock: Mock) -> None:
        randint_mock.return_value = 3
        doc = Document.objects.create(sdn="testsdn")
        populate_fake.create_fake_statuses_for_documents()
        self.assertEqual(Status.objects.count(), 3)
        for code in ["AE1", "AS1", "AS2"]:
            self.assertTrue(
                Status.objects.filter(dic=code, document__id=doc.id).exists()
            )

    @patch("solo_rog_api.management.commands.populate_fake.random.randint")
    def test_creates_fake_statuses_cor(self, randint_mock: Mock) -> None:
        randint_mock.return_value = 5
        doc = Document.objects.create(sdn="testsdn")
        populate_fake.create_fake_statuses_for_documents()
        self.assertEqual(Status.objects.count(), 5)
        for code in ["AE1", "AS1", "AS2", "D6T", "COR"]:
            self.assertTrue(
                Status.objects.filter(dic=code, document__id=doc.id).exists()
            )

    def test_creates_fake_addresses(self) -> None:
        populate_fake.create_fake_addresses(4)
        self.assertEqual(Address.objects.count(), 4)

    @override_settings(DEBUG=False)
    def test_management_command_does_not_work_outside_development(
        self, *args: Mock
    ) -> None:
        stdout_mock = Mock()
        call_command("populate_fake", stdout=stdout_mock)
        self.assertTrue(stdout_mock.write.called)
        self.assertIn("Only meant for development", stdout_mock.write.call_args[0][0])
        for mock in args:
            self.assertFalse(mock.called)

    @patch(f"{import_root}.create_fake_users")
    @patch(f"{import_root}.create_fake_parts")
    @patch(f"{import_root}.create_fake_suppadds")
    @patch(f"{import_root}.create_fake_subinventorys")
    @patch(f"{import_root}.create_fake_locators")
    @patch(f"{import_root}.create_fake_documents")
    @patch(f"{import_root}.create_fake_statuses_for_documents")
    @patch(f"{import_root}.create_fake_addresses")
    @override_settings(DEBUG=True)
    def test_management_command_calls_all_fake_data_functions(
        self, *args: Mock
    ) -> None:
        stdout_mock = Mock()
        call_command("populate_fake", stdout=stdout_mock)
        for mock in args:
            self.assertTrue(mock.called)
