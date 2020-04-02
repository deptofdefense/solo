import socket
from datetime import datetime, timedelta
from contextlib import contextmanager
from typing import Any, Iterator, Union

import urllib3
from django.conf import settings
from celery import shared_task
from celery.task import BaseTask

from zeep import Client
from zeep.transports import Transport
from zeep.wsse.signature import BinarySignature as Signature
from zeep.wsse import utils
from requests import Session

from solo_rog_api.models import (
    Document,
    Dic,
    Status,
    ServiceRequest,
    Part,
    SuppAdd,
    Address,
    AddressType,
)


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


class RetrieveDataTaskBase(BaseTask):
    service_name: Union[str, None] = None

    @contextmanager
    def get_client(self) -> Iterator[Client]:
        session = Session()
        session.cert = (settings.GCSS_CERT_PATH, settings.GCSS_KEY_PATH)
        session.verify = False
        # client constructor fetches wsdl
        client = Client(
            f"https://{settings.GCSS_HOST}/gateway/services/{self.service_name}?wsdl",
            transport=Transport(session=session),
            wsse=GCSSWsseSignature(settings.GCSS_KEY_PATH, settings.GCSS_CERT_PATH),
        )
        yield client
        session.close()

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


class DocHistoryTask(RetrieveDataTaskBase):
    service_name = "br2MerDocHistory"


@shared_task(bind=True, base=DocHistoryTask)
def update_documents(self: DocHistoryTask) -> None:
    for item in self.items():
        doc, _ = Document.objects.get_or_create(sdn=item.T)
        if item.S:
            dic, _ = Dic.objects.get_or_create(code=item.S)
            status, _ = Status.objects.get_or_create(document_id=doc.id, dic_id=dic.id)
            status.esd = item.X
            status.status_date = item.AA
            status.projected_qty = item.BA
            status.save()
        if item.Z:
            sr, _ = ServiceRequest.objects.get_or_create(service_request=item.Z)
            doc.service_request = sr
        if item.BD:
            suppadd, _ = SuppAdd.objects.get_or_create(code=item.BD)
            doc.suppadd = suppadd
        if item.AI and item.BC:
            part, _ = Part.objects.get_or_create(nsn=item.AI, uom=item.BC)
            doc.part = part
        if item.W:
            #     types = (("1", "Holder"), ("2", "Ship-To"), ("3", "Requestor"), ("4", "Bill-To"))
            ship_addr_type, _ = AddressType.objects.get_or_create(
                type="2", desc="Ship-To"
            )
            addr, _ = Address.objects.get_or_create(
                document_id=doc.id, address_type_id=ship_addr_type.id
            )
            addr.name = item.W
            addr.save()
        if item.V:
            #     types = (("1", "Holder"), ("2", "Ship-To"), ("3", "Requestor"), ("4", "Bill-To"))
            holder_addr_type, _ = AddressType.objects.get_or_create(
                type="1", desc="Holder"
            )
            addr, _ = Address.objects.get_or_create(
                document_id=doc.id, address_type_id=holder_addr_type.id
            )
            addr.name = item.V
            addr.save()
        doc.save()
