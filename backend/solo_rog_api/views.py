from typing import Any
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Document, Status
from .serializers import TokenObtainSerializer, DocumentSerializer, StatusSerializer
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


# Changed to a strict GET request for the list of documents
class DocumentList(generics.ListAPIView):
    """ Initial Document API view """

    # permission_classes = [IsAuthenticated]

    queryset = Document.objects.all()
    serializer_class = DocumentSerializer


# Changed to a strict GET request on a single document
class DocumentDetail(generics.RetrieveAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer


# Created to do a GET and POST request. See URLS on how it will be used
class StatusList(generics.ListCreateAPIView):
    def get_queryset(self) -> Any:
        queryset = Status.objects.filter(document_id=self.kwargs["pk"])
        return queryset

    serializer_class = StatusSerializer


# TODO: Create a post request with necessary information
class CreateDocument(APIView):
    serializer_class = DocumentSerializer

    def post(self, request):
        sdn = request.data.get("sdn")
        service_request = request.data.get("service_request")
        suppadd = request.data.get("suppadd")
        part = request.data.get("part")
        data = {
            "sdn": sdn,
            "service_request": service_request,
            "suppadd": suppadd,
            "part": part,
        }
        serializer = DocumentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CreateStatus(APIView):
    serializer_class = StatusSerializer

    def post(self, request, pk):
        dic = request.data.get("dic")
        status_date = request.data.get("status_date")
        key_and_transmit_date = request.data.get("key_and_transmit_date")
        esd = request.data.get("esd")
        projected_qty = request.data.get("projected_qty")
        received_qty = request.data.get("received_qty")
        data = {
            "document": pk,
            "dic": dic,
            "status_date": status_date,
            "key_and_transmit_date": key_and_transmit_date,
            "esd": esd,
            "projected_qty": projected_qty,
            "received_qty": received_qty,
        }
        serializer = StatusSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
