from typing import Dict, Any, Optional, cast
from django.contrib.auth import authenticate
from django.contrib.auth.models import AbstractUser
from rest_framework import serializers, exceptions
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Log, AddressType, Dic, Part, ServiceRequest, SuppAdd, SubInventory


class TokenObtainSerializer(serializers.Serializer):
    def validate(self, attrs: Dict[str, Any]) -> Dict[str, str]:
        user = cast(
            Optional[AbstractUser], authenticate(request=self.context.get("request"))
        )
        if user is None or not user.is_active:
            raise exceptions.AuthenticationFailed()
        refresh = RefreshToken.for_user(user)
        refresh["username"] = user.username
        return {"refresh": str(refresh), "access": str(refresh.access_token)}


class LogSerializer(serializers.ModelSerializer):
    """ Log Serializer """

    class Meta:
        model = Log
        fields = [
            "aac",
            "request_number",
        ]


class AddressTypeSerializer(serializers.ModelSerializer):
    """ Address Type Serializer """

    class Meta:
        model = AddressType
        fields = "__all__"


class DicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dic
        fields = "__all__"


class PartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Part
        fields = "__all__"


class SuppAddSerializer(serializers.ModelSerializer):

    class Meta:
        model = SuppAdd
        fields = "__all__"


class SubInventorySerializer(serializers.ModelSerializer):

    class Meta:
        model = SubInventory
        fields = "__all__"


class ServiceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceRequest
        fields = "__all__"
        
