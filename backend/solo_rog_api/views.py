from typing import Any, Union, Dict
from rest_framework import generics, viewsets
from rest_framework.serializers import BaseSerializer
from rest_framework.filters import OrderingFilter
from rest_framework.generics import CreateAPIView
from rest_framework_simplejwt.views import TokenObtainPairView

from django_filters import rest_framework as filters
from django.db.models import QuerySet  # pylint: disable=unused-import
from .models import Document, UserInWarehouse
from .serializers import (
    TokenObtainSerializer,
    DocumentSerializer,
    UpdateStatusD6TSerializer,
    UpdateStatusCORSerializer,
    UserInWarehouseSerializer,
)
from .filters import DocumentListFilter


class ObtainTokenView(TokenObtainPairView):
    serializer_class = TokenObtainSerializer


class WarehouseUsersView(viewsets.ModelViewSet):
    serializer_class = UserInWarehouseSerializer
    queryset = UserInWarehouse.objects.all()
    lookup_field = "pk"

    def get_queryset(self) -> "QuerySet[UserInWarehouse]":
        # only dealing with warehouses current user is a
        # manager of
        warehouse_ids = UserInWarehouse.objects.filter(
            user_id=self.request.user.id, manager=True
        ).values_list("warehouse_id", flat=True)
        return UserInWarehouse.objects.filter(warehouse_id__in=warehouse_ids,).exclude(
            user_id=self.request.user.id
        )

    def get_serializer_context(self) -> Dict[str, Any]:
        ctx = super().get_serializer_context()
        ctx["user"] = self.request.user
        return ctx


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
        ("service_request", "service request"),
        ("part__nomen", "nomenclature"),
        ("suppadd__code", "commodity"),
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
