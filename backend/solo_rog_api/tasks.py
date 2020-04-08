import socket
import html
from datetime import datetime, timedelta
from contextlib import contextmanager
from typing import Any, Iterator, Union, Dict

import urllib3
from django.conf import settings
from django.utils import timezone
from celery import shared_task
from celery.task import BaseTask

import requests
from zeep import Client
from zeep.transports import Transport
from zeep.wsse.signature import BinarySignature as Signature
from zeep.wsse import utils

from solo_rog_api.gcss_xml_templates import I009_TEMPLATE_MREC, I009_TEMPLATE_WRAPPER
from solo_rog_api.models import Document, Status, Part, SuppAdd, Address


# GCSS dev environment certificate is not trusted
# TODO: explicitly trust their public cert
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


# monkey patch dns resolution at this level
#
#  1. Fargate tasks don't support the extraHosts docker option
#  2. zeep needs to crawl wsdl references to xsd's, so
#     statically using an ip for the wsdl doesn't work
#
system_get_addr_info = socket.getaddrinfo


def patched_getaddrinfo(hostname: str, port: int, *args: Any) -> Any:
    if hostname == settings.GCSS_HOST:
        return [
            (
                socket.AddressFamily.AF_INET,
                socket.SocketKind.SOCK_STREAM,
                socket.getprotobyname("tcp"),  # TCP
                "",
                (settings.GCSS_IP, 443),
            )
        ]
    return system_get_addr_info(hostname, port, *args)


socket.getaddrinfo = patched_getaddrinfo  # type: ignore


class GCSSTransport(Transport):
    def __init__(self, *args: Any, **kwargs: Any):
        super().__init__(*args, **kwargs)
        self.status_code = None

    def post(self, address: str, message: str, headers: Dict[str, str]) -> Any:
        response = super().post(address, message, headers)
        self.status_code = response.status_code
        return response


class GCSSWsseSignature(Signature):
    def apply(self, envelope: str, headers: Any) -> Any:
        security = utils.get_security_header(envelope)
        created = datetime.now()
        expired = created + timedelta(days=5)
        timestamp = utils.WSU("Timestamp")
        timestamp.append(
            utils.WSU("Created", created.strftime("%Y-%m-%dT%H:%M:%S.000Z"))
        )
        timestamp.append(
            utils.WSU("Expires", expired.strftime("%Y-%m-%dT%H:%M:%S.000Z"))
        )
        security.append(timestamp)
        return super().apply(envelope, headers)

    def verify(self, envelope: str) -> str:
        return envelope


class GCSSTaskBase(BaseTask):
    service_name: Union[str, None] = None

    @contextmanager
    def get_client(self) -> Iterator[Client]:
        session = requests.Session()
        session.cert = (settings.GCSS_CERT_PATH, settings.GCSS_KEY_PATH)
        session.verify = False
        # client constructor fetches wsdl
        client = Client(
            f"https://{settings.GCSS_HOST}/gateway/services/{self.service_name}?wsdl",
            transport=GCSSTransport(session=session),
            wsse=GCSSWsseSignature(settings.GCSS_KEY_PATH, settings.GCSS_CERT_PATH),
        )
        yield client
        session.close()


class RetrieveDataTaskBase(GCSSTaskBase):
    @staticmethod
    def should_next_page(response: Any) -> Any:
        return getattr(response, "remaining-records", 0) > 0

    def get_data_from_response(self, response: Any) -> Any:
        collection = getattr(response, f"{self.service_name}Collection")
        if not collection:
            return []
        return getattr(collection, f"{self.service_name}Record", [])

    def pages(self) -> Any:
        page_size = getattr(settings, "GCSS_PAGING_MAX", 10000)
        current_page = 0
        client: Client = self.get_client()
        response = None
        with self.get_client() as client:
            while current_page == 0 or self.should_next_page(response):
                print(f"[*] {self.service_name}: page {current_page}", flush=True)
                response = client.service.process(
                    outputType="SOAP",
                    nullElements="yes",
                    pagingSkip=current_page * page_size,
                    pagingMax=page_size,
                )
                yield self.get_data_from_response(response)
                current_page += 1

    def items(self) -> Any:
        for page in self.pages():
            for item in page:
                yield item


class SendDataTaskBase(GCSSTaskBase):
    @staticmethod
    def xml_to_compressed_payload(xml: str) -> str:
        response = requests.post(
            f"{settings.EXML_CONVERTER_ENDPOINT}/xml/compress",
            data=xml,
            headers={"Content-Type": "application/json", "Accept": "*"},
        )
        if response.status_code != 200:
            raise Exception()
        return base64.b64decode(response.content)

    @staticmethod
    def xml_to_uncompressed_payload(xml: str) -> str:
        # GCSS uncompressed payload requires '<', and '>' to be
        # escaped with &lt; and &gt; respectively
        return html.escape(xml, quote=False)


class UpdateDocumentsTask(RetrieveDataTaskBase):
    service_name = "br2MerDocHistory"


@shared_task(bind=True, base=UpdateDocumentsTask)
def update_documents(self: UpdateDocumentsTask) -> None:
    for item in self.items():
        defaults = {}
        if item.BD:
            sup, _ = SuppAdd.objects.get_or_create(code=item.BD)
            defaults["suppadd"] = sup
        if item.AZ and item.BC:
            part, _ = Part.objects.get_or_create(nsn=item.AI, uom=item.BC)
            defaults["part"] = part  # type: ignore
        if item.W:
            ship_to, _ = Address.objects.get_or_create(name=item.W)
            defaults["ship_to"] = ship_to  # type: ignore
        if item.V:
            holder, _ = Address.objects.get_or_create(name=item.V)
            defaults["holder"] = holder  # type: ignore
        doc, _ = Document.objects.update_or_create(
            sdn=item.T.strip(), defaults=defaults
        )
        if item.S:
            status_date = timezone.make_aware(item.AA) if item.AA else timezone.now()
            esd = timezone.make_aware(item.X) if item.X else timezone.now()
            Status.objects.update_or_create(
                document_id=doc.id,
                dic=item.S.strip(),
                defaults={
                    "status_date": status_date,
                    "esd": esd,
                    "projected_qty": item.BA,
                },
            )
        doc.save()


class UpdatePartsTask(RetrieveDataTaskBase):
    service_name = "br2MerItemMaster"


@shared_task(bind=True, base=UpdatePartsTask)
def update_parts(self: UpdatePartsTask) -> None:
    for item in self.items():
        Part.objects.update_or_create(
            nsn=item.A, uom=item.E, defaults={"nomen": item.D}
        )


class SubmitStatusTask(SendDataTaskBase):
    service_name = "I009ShipmentReceiptsIn"


@shared_task(bind=True, base=SubmitStatusTask)
def gcss_submit_status(self: SubmitStatusTask, document_id: int, dic: str) -> None:
    doc = Document.objects.get(id=document_id)
    status = Status.objects.get(document_id=doc.id, dic=dic)
    record = I009_TEMPLATE_MREC.format(doc=doc, status=status)
    wrapped = I009_TEMPLATE_WRAPPER.format(record)
    compressed = self.xml_to_compressed_payload(wrapped)

    with self.get_client() as client:
        client.service.initiateCompressed(input=quoted)
        print(f"[*] Submit Status | {doc.sdn} | {dic} | {client.transport.status_code}")
