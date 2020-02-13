from typing import Dict, Any, Optional, cast
from django.contrib.auth import authenticate
from django.contrib.auth.models import AbstractUser
from rest_framework import serializers, exceptions
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Log


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
