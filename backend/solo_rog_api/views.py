from typing import Any, Union
from rest_framework.serializers import BaseSerializer
from rest_framework.filters import OrderingFilter
from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework_simplejwt.views import TokenObtainPairView

# from rest_framework.permissions import IsAdminUser


from django_filters import rest_framework as filters
from .models import Document, User
from .serializers import (
    TokenObtainSerializer,
    DocumentSerializer,
    UpdateStatusD6TSerializer,
    UpdateStatusCORSerializer,
    UserSerializer,
)
from .filters import DocumentListFilter


class ObtainTokenView(TokenObtainPairView):
    serializer_class = TokenObtainSerializer


class DocumentList(ListAPIView):
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


class WarehouseUsersList(ListAPIView):
    """
    Find AAC's associated with a user, find all users associated with those AAC's
    """

    serializer_class = UserSerializer
    queryset = User.objects.all()
    # permission_classes = [IsAdminUser]
