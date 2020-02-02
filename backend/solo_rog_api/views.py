# from django.shortcuts import render
# from rest_framework.response import Response
# from rest_framework.decorators import api_view
from rest_framework import viewsets
from .models import Log
from .serializers import LogSerializer


class ApiLogViewSet(viewsets.ModelViewSet):
    """ Initial API view """

    queryset = Log.objects.all()
    serializer_class = LogSerializer
