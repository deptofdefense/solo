from django_filters import rest_framework as filters
from .models import Document


class DocumentListFilter(filters.FilterSet):
    sdn = filters.CharFilter(field_name="sdn", lookup_expr="icontains")
    sdn_exact = filters.CharFilter(field_name="sdn", lookup_expr="exact")
    nomen = filters.CharFilter(field_name="part__nomen", lookup_expr="icontains")
    commod = filters.CharFilter(field_name="suppadd__desc", lookup_expr="icontains")
    status = filters.CharFilter(field_name="statuses__dic__code", lookup_expr="iexact")
    exclude_status = filters.CharFilter(
        field_name="statuses__dic__code", lookup_expr="iexact", exclude=True
    )

    class Meta:
        model = Document
        fields = "__all__"
