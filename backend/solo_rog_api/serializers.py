from typing import Dict, Any, Optional, cast, Union, List
from django.utils import timezone
from django.db.models import QuerySet, Model  # pylint: disable=unused-import
from django.contrib.auth import authenticate
from django.contrib.auth.models import AbstractUser
from rest_framework import serializers, exceptions
from rest_framework.utils.serializer_helpers import ReturnDict
from rest_framework_simplejwt.tokens import RefreshToken
from .tasks import gcss_submit_status
from .models import (
    Part,
    SuppAdd,
    SubInventory,
    Locator,
    Document,
    Status,
    Address,
    UserInWarehouse,
    Warehouse,
    User,
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


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
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
    class Meta:
        model = Status
        fields = "__all__"


class DocumentSerializer(serializers.ModelSerializer):
    statuses = StatusSerializer(many=True, read_only=True)
    suppadd = SuppAddSerializer(many=False, read_only=True)
    part = PartSerializer(many=False, read_only=True)
    ship_to = AddressSerializer(read_only=True)
    holder = AddressSerializer(read_only=True)

    class Meta:
        model = Document
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "id"]


class ManagedWarehouseField(serializers.PrimaryKeyRelatedField):
    def get_queryset(self) -> "QuerySet[Warehouse]":
        return Warehouse.objects.filter(
            warehouse_membership__user_id=self.context["user"].id,
            warehouse_membership__manager=True,
        ).all()


class UserInWarehouseSerializer(serializers.ModelSerializer):
    warehouse = serializers.StringRelatedField()
    user = UserSerializer(read_only=True)

    warehouse_id = ManagedWarehouseField(source="warehouse", write_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        source="user", write_only=True, queryset=User.objects.all()
    )

    def validate(self, attrs: Any) -> Any:
        if "user" not in self.context:
            raise serializers.ValidationError()
        return super().validate(attrs)  # type: ignore

    def update(self, instance: Model, validated_data: Dict[str, Any]) -> Any:
        validated_data.pop("warehouse", None)
        validated_data.pop("user", None)
        return super().update(instance, validated_data)

    class Meta:
        model = UserInWarehouse
        fields = "__all__"


class UpdateStatusListSerializer(serializers.ListSerializer):
    def create(self, validated_data: Any) -> List[Status]:
        statuses = [Status(**data) for data in validated_data]
        created = Status.objects.bulk_create(statuses)
        for data in validated_data:
            gcss_submit_status.delay(data["document_id"], data["dic"])
        return created


class UpdateStatusD6TSerializer(serializers.Serializer):
    sdn = serializers.CharField(max_length=50, required=True)
    status_date = serializers.DateTimeField(default=timezone.now, required=False)
    key_and_transmit_date = serializers.DateTimeField(
        default=timezone.now, required=False
    )
    received_quantity = serializers.IntegerField(min_value=1)
    subinventory = serializers.CharField(required=False, default=None, max_length=100)
    locator = serializers.CharField(required=False, default=None, max_length=100)

    class Meta:
        list_serializer_class = UpdateStatusListSerializer

    def validate(self, attrs: Any) -> Dict[str, Any]:
        validated = super().validate(attrs)  # type: ignore

        try:
            subinventory = None
            locator = None
            document = (
                Document.objects.exclude(statuses__dic="D6T")
                .filter(statuses__dic="AS2")
                .select_related("suppadd")
                .get(sdn=validated["sdn"])
            )

            # add subinventory/locator information if available
            if (
                document.suppadd is not None
                and validated["subinventory"] is not None
                and validated["locator"] is not None
            ):
                subinventory = document.suppadd.subinventorys.get(
                    code=validated["subinventory"]
                )
                locator = subinventory.locators.get(code=validated["locator"])

            previous_status = document.statuses.get(dic="AS2")
            return {
                "status_date": validated["status_date"],
                "key_and_transmit_date": validated["key_and_transmit_date"],
                "received_qty": validated["received_quantity"],
                "projected_qty": previous_status.projected_qty,
                "document_id": document.id,
                "dic": "D6T",
                "subinventory": subinventory,
                "locator": locator,
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
        validated = super().validate(attrs)  # type: ignore

        try:
            document = (
                Document.objects.exclude(statuses__dic="COR")
                .filter(statuses__dic="D6T")
                .get(sdn=validated["sdn"])
            )
            received_quantity = document.statuses.get(dic="D6T")
            return {
                "status_date": validated["status_date"],
                "key_and_transmit_date": validated["key_and_transmit_date"],
                "received_qty": received_quantity.received_qty,
                "projected_qty": received_quantity.projected_qty,
                "received_by": validated["received_by"],
                "document_id": document.id,
                "dic": "COR",
            }
        except Document.DoesNotExist:
            raise serializers.ValidationError(
                f"Document does not exist or is not eligible for COR"
            )

    def to_representation(
        self, instance: Dict[str, Any]
    ) -> Union[ReturnDict, ReturnDict]:
        return StatusSerializer(instance=instance).data
