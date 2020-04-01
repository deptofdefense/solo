import os
import sys
from datetime import datetime, timedelta
from contextlib import contextmanager
from typing import Any, Iterator, Union

import urllib3
from django.conf import settings
from celery.task import BaseTask

from zeep import Client
from zeep.transports import Transport
from zeep.wsse.signature import BinarySignature as Signature
from zeep.wsse import utils
from requests import Session

# GCSS dev environment certificate is not trusted
# TODO: explicitly trust their public cert
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


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
    public_cert_filename = "/home/backendUser/selfsigned.crt"
    private_key_filename = "/home/backendUser/selfsigned.key"
    service_name: Union[str, None] = None
    gcss_host = os.environ.get("GCSS_HOST") or "216.14.17.186"

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self.write_keys()

    def write_keys(self) -> None:
        gcss_cert = os.environ.get("GCSS_PUBLIC_CERT")
        gcss_key = os.environ.get("GCSS_PRIVATE_KEY")
        if gcss_cert is None or gcss_key is None:
            print("NO GCSS KEYS FOUND", flush=True)
            sys.exit(1)
        with open(self.public_cert_filename, "w") as f:
            f.write(gcss_cert)
        with open(self.private_key_filename, "w") as f:
            f.write(gcss_key)

    @contextmanager
    def get_client(self) -> Iterator[Client]:
        session = Session()
        session.cert = (self.public_cert_filename, self.private_key_filename)
        session.verify = False
        # client constructor fetches wsdl
        client = Client(
            f"https://{self.gcss_host}/gateway/services/{self.service_name}?wsdl",
            transport=Transport(session=session),
            wsse=GCSSWsseSignature(
                self.private_key_filename, self.public_cert_filename
            ),
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
