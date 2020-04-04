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


    def list(self, request):
        # Note the use of `get_queryset()` instead of `self.queryset`
        queryset = self.get_queryset()
        serializer = UserSerializer(queryset, many=True)
        return Response(serializer.data)
    user = get_current_user_object_here
    aacs = AAC.filter(user=user.id)
    queryset = User.builk_filter(aacs=aacs)    # permission_classes = [IsAdminUser]

class WarehouseUSersList(ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        aacs = AAC.objects.filter(user=user.id)
        aac_ids = [aac.id for aac in aacs]
        return qs.objects.filter(aac__in=aac_ids)