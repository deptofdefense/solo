from typing import Any
from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Log
from .serializers import LogSerializer, TokenObtainSerializer
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


class ApiLogViewSet(viewsets.ModelViewSet):
    """ Initial API view """

    queryset = Log.objects.all()
    serializer_class = LogSerializer
