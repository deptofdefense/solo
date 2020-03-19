from typing import Any
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Document
from .serializers import TokenObtainSerializer, DocumentSerializer
from .tasks import debug_task


class CeleryDebugTaskView(generics.CreateAPIView):
    permission_classes = [
        IsAuthenticated,
    ]

    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        username = request.user.username
        user_msg = request.data.get("msg", "debug msg")
        task = debug_task.delay(f"[{username}]: {user_msg}")
        return Response({"task_id": task.id}, status=status.HTTP_200_OK)


class ObtainTokenView(TokenObtainPairView):
    serializer_class = TokenObtainSerializer


class DocumentList(generics.ListAPIView):
    """
    Displays a list of documents in descending order by SDN by default.
    """

    serializer_class = DocumentSerializer

    def get_queryset(self) -> Any:
        """
        Can use url param's to be able to further filter
        """
        # grab all documents
        queryset = Document.objects.all().order_by("-sdn")

        # filter by nomen, sdn, commod, status. Below are examples

        # example /documents?nomen=screw
        nomen = self.request.query_params.get("nomen", None)

        # example /documents?sdn=12345678
        sdn = self.request.query_params.get("sdn", None)

        # example /documents?commod=motor
        commod = self.request.query_params.get("commod", None)

        # example /documents?status=d6t
        doc_status = self.request.query_params.get("status", None)
        if sdn is not None:
            queryset = queryset.filter(sdn__icontains=sdn)
        if commod is not None:
            queryset = queryset.filter(suppadd__desc__icontains=commod).order_by(
                "-statuses__status_date"
            )
        if nomen is not None:
            queryset = queryset.filter(part__nomen__icontains=nomen).order_by(
                "-statuses__status_date"
            )
        if doc_status is not None:
            queryset = queryset.filter(
                statuses__dic__code__icontains=doc_status
            ).order_by("-statuses__status_date")
        return queryset
