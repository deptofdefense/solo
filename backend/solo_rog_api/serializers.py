from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Log


class TokenObtainSerializer(serializers.Serializer):
    def validate(self, attrs):
        user = authenticate(request=self.context.get("request"))
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
