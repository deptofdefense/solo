from celery import shared_task
from solo_rog_api.tasks.retrieve_task_base import RetrieveDataTaskBase
from solo_rog_api.models import Document


class DocHistoryTask(RetrieveDataTaskBase):
    service_name = "br2MerDocHistory"


@shared_task(bind=True, base=DocHistoryTask)
def update_documents(self: DocHistoryTask) -> None:
    for item in self.items():
        doc, _ = Document.objects.get_or_create(sdn=item.T)
        # add other stuff to document
        doc.save()
