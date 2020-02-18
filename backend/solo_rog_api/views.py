from rest_framework import viewsets
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Log
from .serializers import LogSerializer, TokenObtainSerializer


class ObtainTokenView(TokenObtainPairView):
    serializer_class = TokenObtainSerializer


class ApiLogViewSet(viewsets.ModelViewSet):
    """ Initial API view """

    queryset = Log.objects.all()
    serializer_class = LogSerializer
