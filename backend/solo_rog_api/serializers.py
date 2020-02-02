from rest_framework import serializers
from .models import Log


class LogSerializer(serializers.ModelSerializer):
    """ Log Serializer """

    class Meta:
        model = Log
        fields = [
            "aac",
            "request_number",
        ]
