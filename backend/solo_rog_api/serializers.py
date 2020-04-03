from typing import Dict, Any, Optional, cast, Union, List
from django.utils import timezone
from django.contrib.auth import authenticate
from django.contrib.auth.models import AbstractUser
from rest_framework import serializers, exceptions
from rest_framework.utils.serializer_helpers import ReturnDict
from rest_framework_simplejwt.tokens import RefreshToken
from .models import (
    AddressType,
    Dic,
    Part,
    ServiceRequest,
    SuppAdd,
    SubInventory,
    Locator,
    Document,
    Status,
    Address,
    AAC,
    User,
)


class AACSerializer(serializers.ModelSerializer):
    class Meta:
        model = AAC
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    aacs = AACSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = (
            "aacs",
            "username",
            "is_superuser",
            "is_active",
            "is_staff",
            "last_login",
        )


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


class LocatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Locator
        fields = "__all__"


class SubInventorySerializer(serializers.ModelSerializer):
    locators = LocatorSerializer(many=True, read_only=True)

    class Meta:
        model = SubInventory
        fields = "__all__"


class AddressTypeSerializer(serializers.ModelSerializer):
    """ Address Type Serializer """

    class Meta:
        model = AddressType
        fields = "__all__"


class AddressSerializer(serializers.ModelSerializer):
    address_type = AddressTypeSerializer(many=False, read_only=True)

    class Meta:
        model = Address
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
    subinventorys = SubInventorySerializer(many=True, read_only=True)

    class Meta:
        model = SuppAdd
        fields = "__all__"


class StatusSerializer(serializers.ModelSerializer):
    dic = DicSerializer(many=False, read_only=True)

    class Meta:
        model = Status
        fields = "__all__"


class ServiceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceRequest
        fields = "__all__"


class DocumentSerializer(serializers.ModelSerializer):
    statuses = StatusSerializer(many=True, read_only=True)
    suppadd = SuppAddSerializer(many=False, read_only=True)
    part = PartSerializer(many=False, read_only=True)
    service_request = ServiceRequestSerializer(many=False, read_only=True)
    addresses = AddressSerializer(many=True, read_only=True)

    class Meta:
        model = Document
        fields = "__all__"


class UpdateStatusListSerializer(serializers.ListSerializer):
    def create(self, validated_data: Any) -> List[Status]:
        statuses = [Status(**data) for data in validated_data]
        return Status.objects.bulk_create(statuses)


class UpdateStatusD6TSerializer(serializers.Serializer):
    sdn = serializers.CharField(max_length=50, required=True)
    status_date = serializers.DateTimeField(default=timezone.now, required=False)
    key_and_transmit_date = serializers.DateTimeField(
        default=timezone.now, required=False
    )
    received_quantity = serializers.IntegerField(min_value=1)
    subinventory = serializers.CharField(required=True, max_length=100)
    locator = serializers.CharField(required=True, max_length=100)

    class Meta:
        list_serializer_class = UpdateStatusListSerializer

    def validate(self, attrs: Any) -> Dict[str, Any]:
        new_dic = Dic.objects.get(code="D6T")
        validated = super().validate(attrs)  # type: ignore

        try:
            document = (
                Document.objects.exclude(statuses__dic__code="D6T")
                .filter(statuses__dic__code="AS2")
                .select_related("suppadd")
                .get(sdn=validated["sdn"])
            )
            if document.suppadd is not None:
                subinventory = document.suppadd.subinventorys.filter(
                    suppadd_id=document.suppadd.id
                ).get(code=validated["subinventory"])
            locator = subinventory.locators.get(code=validated["locator"])
            received_quantity = document.statuses.get(dic__code="AS2")
            return {
                "status_date": validated["status_date"],
                "key_and_transmit_date": validated["key_and_transmit_date"],
                "received_qty": validated["received_quantity"],
                "projected_qty": received_quantity.projected_qty,
                "document_id": document.id,
                "dic": new_dic,
                "subinventory_id": subinventory.id,
                "locator_id": locator.id,
            }
        except Document.DoesNotExist:
            raise serializers.ValidationError(
                f"Document does not exist or is not eligible for D6T"
            )
        except SubInventory.DoesNotExist:
            raise serializers.ValidationError(
                f"SubInventory {validated['subinventory']} is not valid for {validated['sdn']}"
            )
        except Locator.DoesNotExist:
            raise serializers.ValidationError(
                f"Locator {validated['locator']} is not valid for {validated['subinventory']} "
                f"in document {validated['sdn']}"
            )

    def to_representation(
        self, instance: Dict[str, Any]
    ) -> Union[ReturnDict, ReturnDict]:
        return StatusSerializer(instance=instance).data


class UpdateStatusCORSerializer(serializers.Serializer):
    sdn = serializers.CharField(max_length=50, required=True)
    status_date = serializers.DateTimeField(default=timezone.now, required=False)
    key_and_transmit_date = serializers.DateTimeField(
        default=timezone.now, required=False
    )
    received_by = serializers.CharField(required=True, max_length=50)

    class Meta:
        list_serializer_class = UpdateStatusListSerializer

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        new_dic = Dic.objects.get(code="COR")
        validated = super().validate(attrs)  # type: ignore

        try:
            document = (
                Document.objects.exclude(statuses__dic__code="COR")
                .filter(statuses__dic__code="D6T")
                .get(sdn=validated["sdn"])
            )
            received_quantity = document.statuses.get(dic__code="D6T")
            return {
                "status_date": validated["status_date"],
                "key_and_transmit_date": validated["key_and_transmit_date"],
                "received_qty": received_quantity.received_qty,
                "projected_qty": received_quantity.projected_qty,
                "received_by": validated["received_by"],
                "document_id": document.id,
                "dic": new_dic,
            }
        except Document.DoesNotExist:
            raise serializers.ValidationError(
                f"Document does not exist or is not eligible for COR"
            )

    def to_representation(
        self, instance: Dict[str, Any]
    ) -> Union[ReturnDict, ReturnDict]:
        return StatusSerializer(instance=instance).data
