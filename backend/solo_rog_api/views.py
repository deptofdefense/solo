from typing import Any, Union
from rest_framework import generics, status
from rest_framework.serializers import BaseSerializer
from rest_framework.filters import OrderingFilter
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView

from django_filters import rest_framework as filters
from .models import Document
from .serializers import (
    TokenObtainSerializer,
    DocumentSerializer,
    UpdateStatusD6TSerializer,
    UpdateStatusCORSerializer,
)
from .tasks import debug_task
from .filters import DocumentListFilter


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
    queryset = Document.objects.all()
    filter_backends = (filters.DjangoFilterBackend, OrderingFilter)
    filterset_class = DocumentListFilter
    ordering_fields = [
        ("sdn", "sdn"),
        ("service_request__service_request", "service request"),
        ("part__nomen", "nomenclature"),
        ("suppadd__desc", "commodity"),
        ("statuses__status_date", "last updated"),
    ]
    ordering = ["statuses__status_date"]


class D6TSubmissionView(CreateAPIView):
    serializer_class = UpdateStatusD6TSerializer

    def get_serializer(
        self, *args: Any, **kwargs: Any
    ) -> Union[BaseSerializer, BaseSerializer]:
        return super().get_serializer(many=True, allow_empty=False, **kwargs)


class CORSubmissionView(CreateAPIView):
    serializer_class = UpdateStatusCORSerializer

    def get_serializer(
        self, *args: Any, **kwargs: Any
    ) -> Union[BaseSerializer, BaseSerializer]:
        return super().get_serializer(many=True, allow_empty=False, **kwargs)
