from unittest.mock import patch, Mock
from django.test import TestCase, override_settings
from django.core.management import call_command
from solo_rog_api.management.commands import populate_fake
from solo_rog_api.models import (
    User,
    Address,
    AddressType,
    Dic,
    Part,
    SuppAdd,
    SubInventory,
    Locator,
    Document,
    Status,
    ServiceRequest,
)


class CreateFakeDataTestCase(TestCase):
    import_root = "solo_rog_api.management.commands.populate_fake"

    def test_creates_fake_users(self) -> None:
        User.objects.create(username="deleteme")
        self.assertEqual(User.objects.count(), 1)
        populate_fake.create_fake_users(2)
        self.assertEqual(User.objects.count(), 2)

    def test_creates_address_types(self) -> None:
        populate_fake.populate_address_types()
        self.assertEqual(AddressType.objects.count(), 4)
        for i in range(1, 5):
            self.assertIsNotNone(AddressType.objects.filter(type=str(i)).first())

    def test_creates_dics(self) -> None:
        populate_fake.populate_dics()
        self.assertEqual(Dic.objects.count(), 5)
        for code in ["AE1", "AS1", "AS2", "D6T", "COR"]:
            self.assertTrue(Dic.objects.filter(code=code).exists())

    def test_creates_fake_parts(self) -> None:
        populate_fake.create_fake_parts(2)
        self.assertEqual(Part.objects.count(), 2)

    def test_creates_fake_suppadds(self) -> None:
        populate_fake.create_fake_suppadds(1)
        self.assertEqual(SuppAdd.objects.count(), 1)

    def test_creates_fake_subinventories(self) -> None:
        SuppAdd.objects.create(code="testcode", desc="testdesc")
        populate_fake.create_fake_subinventorys(3)
        self.assertEqual(SubInventory.objects.count(), 3)
        self.assertEqual(
            SubInventory.objects.filter(
                suppadd__code="testcode", suppadd__desc="testdesc"
            ).count(),
            3,
        )

    def test_creates_fake_locators(self) -> None:
        SubInventory.objects.create(code="testcode", desc="testdesc")
        populate_fake.create_fake_locators(3)
        self.assertEqual(Locator.objects.count(), 3)
        self.assertEqual(
            Locator.objects.filter(subinventorys__code="testcode").count(), 3
        )

    def test_creates_fake_service_requests(self) -> None:
        populate_fake.create_fake_service_requests(1)
        self.assertEqual(ServiceRequest.objects.count(), 1)
        self.assertTrue(
            ServiceRequest.objects.filter(service_request__isnull=False).exists()
        )

    def test_creates_fake_documents(self) -> None:
        ServiceRequest.objects.create(service_request="testservicerequest")
        SuppAdd.objects.create(code="testcode", desc="testdesc")
        Part.objects.create(nsn="testnsn")
        populate_fake.create_fake_documents(1)
        self.assertEqual(Document.objects.count(), 1)
        self.assertTrue(
            Document.objects.filter(
                part__nsn="testnsn",
                suppadd__code="testcode",
                service_request__service_request="testservicerequest",
                sdn__isnull=False,
            ).exists()
        )

    @patch("solo_rog_api.management.commands.populate_fake.random.randint")
    def test_creates_fake_statuses_ae1(self, randint_mock: Mock) -> None:
        randint_mock.return_value = 1
        Document.objects.create(sdn="testsdn")
        populate_fake.populate_dics()
        populate_fake.create_fake_statuses_for_documents()
        self.assertEqual(Status.objects.count(), 1)
        self.assertTrue(Status.objects.filter(dic__code="AE1").exists())

    @patch("solo_rog_api.management.commands.populate_fake.random.randint")
    def test_creates_fake_statuses_as2(self, randint_mock: Mock) -> None:
        randint_mock.return_value = 3
        doc = Document.objects.create(sdn="testsdn")
        populate_fake.populate_dics()
        populate_fake.create_fake_statuses_for_documents()
        self.assertEqual(Status.objects.count(), 3)
        for code in ["AE1", "AS1", "AS2"]:
            self.assertTrue(
                Status.objects.filter(dic__code=code, document__id=doc.id).exists()
            )

    @patch("solo_rog_api.management.commands.populate_fake.random.randint")
    def test_creates_fake_statuses_cor(self, randint_mock: Mock) -> None:
        randint_mock.return_value = 5
        doc = Document.objects.create(sdn="testsdn")
        populate_fake.populate_dics()
        populate_fake.create_fake_statuses_for_documents()
        self.assertEqual(Status.objects.count(), 5)
        for code in ["AE1", "AS1", "AS2", "D6T", "COR"]:
            self.assertTrue(
                Status.objects.filter(dic__code=code, document__id=doc.id).exists()
            )

    @patch("solo_rog_api.management.commands.populate_fake.random.randint")
    def test_creates_fake_addresses(self, randint_mock: Mock) -> None:
        randint_mock.side_effect = [1, 2, 3, 4]
        populate_fake.populate_address_types()
        Document.objects.create(sdn="testsdn")
        populate_fake.create_fake_addresses_for_documents(4)
        self.assertEqual(Address.objects.count(), 4)
        for addr_type in ["1", "2", "3", "4"]:
            self.assertTrue(
                Address.objects.filter(address_type__type=addr_type).exists()
            )
            self.assertTrue(
                Document.objects.filter(
                    addresses__address_type__type=addr_type
                ).exists()
            )

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
    @patch(f"{import_root}.populate_address_types")
    @patch(f"{import_root}.populate_dics")
    @patch(f"{import_root}.create_fake_parts")
    @patch(f"{import_root}.create_fake_suppadds")
    @patch(f"{import_root}.create_fake_subinventorys")
    @patch(f"{import_root}.create_fake_locators")
    @patch(f"{import_root}.create_fake_service_requests")
    @patch(f"{import_root}.create_fake_documents")
    @patch(f"{import_root}.create_fake_statuses_for_documents")
    @patch(f"{import_root}.create_fake_addresses_for_documents")
    @override_settings(DEBUG=True)
    def test_management_command_calls_all_fake_data_functions(
        self, *args: Mock
    ) -> None:
        stdout_mock = Mock()
        call_command("populate_fake", stdout=stdout_mock)
        for mock in args:
            self.assertTrue(mock.called)
