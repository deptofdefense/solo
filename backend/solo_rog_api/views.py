from datetime import datetime
from typing import Any
from rest_framework import generics, status
from rest_framework.filters import OrderingFilter
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django_filters import rest_framework as filters
from .models import Document, Dic, Status
from .serializers import (
    TokenObtainSerializer,
    DocumentSerializer,
    StatusSerializer,
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


class D6TSubmission(APIView):
    def post(self, request) -> Response:

        # initial queryset
        documents = Document.objects.all()

        # This will grab the dic code you wanted without creating more of the same one
        d6t_code = Dic.objects.get(code="D6T")

        response_data = []
        serializers = []

        if len(request.data) > 0:
            for new_status in request.data:
                try:
                    """The documents.get will query from the queryset we set up to called documents and return what 
                    we set as the param. This way, we only have to query the database once for all the documents (it 
                    will get slower when there are more rows in the future. """
                    document = documents.get(sdn=new_status["sdn"])
                except Document.DoesNotExist:
                    return Response(
                        "bad request: " + new_status["sdn"],
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                """               
                This was something to grab the latest status based on the date vice the code because the latest one
                ought to be a shipped status
                """
                latest_status = document.statuses.latest("status_date")

                """
                This is an attempt to only create a new status if and only if there was no d6t code. However, I have not
                account for mutliple shipments.
                """
                if latest_status.dic.code != d6t_code.code:

                    """
                    This is to create a single status object
                    """
                    created_status = Status.objects.create(
                        document_id=document.id,
                        dic_id=d6t_code.id,
                        status_date=datetime.now(),
                        key_and_transmit_date=datetime.now(),
                        projected_qty=latest_status.projected_qty,
                        # something that is passed into from the frontend. As for now, its the same as projected_qty
                        received_qty=new_status.projected_qty,
                        # TODO: These two will depend on the Suppadd.
                        # subinventory=,
                        # locator=,
                    )
                    serializer = StatusSerializer(data=created_status)
                    if not serializer.is_valid():
                        return Response(
                            serializer.errors, status=status.HTTP_400_BAD_REQUEST
                        )
                    serializers.append(serializer)
                else:
                    print("D6T for that document already exists")
            for serializer in serializers:
                serializer.save()
                response_data.append(serializer.data)
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response("Empty Request", status=status.HTTP_400_BAD_REQUEST)


class CORSubmission(APIView):
    def post(self, request):
        response_data = []
        serializers = []
        if len(request.data) > 0:
            for new_status in request.data:
                try:
                    document = Document.objects.get(sdn=new_status["sdn"])
                except Document.DoesNotExist:
                    return Response(
                        "bad request: " + new_status["sdn"],
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                new_status["status_date"] = datetime.now()
                new_status["dic"] = Dic.objects.get(code="COR")
                new_status["document"] = document.id
                serializer = StatusSerializer(data=new_status)
                if not serializer.is_valid():
                    return Response(
                        serializer.errors, status=status.HTTP_400_BAD_REQUEST
                    )
                serializers.append(serializer)
            for serializer in serializers:
                serializer.save()
                response_data.append(serializer.data)
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response("Empty Request", status=status.HTTP_400_BAD_REQUEST)
