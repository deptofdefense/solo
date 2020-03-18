from rest_framework import routers
from django.urls import path
from . import views

# router = routers.SimpleRouter()
# router.register("documents", views.DocumentViewSet)


# Updated url in order to have more control over how
urlpatterns = [
    path("login/", views.ObtainTokenView.as_view(), name="login"),
    path("workerlog/", views.CeleryDebugTaskView.as_view(), name="workerlog"),
    path("documents/", views.DocumentList.as_view(), name="document_list"),
    path("documents/<pk>/", views.DocumentDetail.as_view(), name="document_detail"),
    path("documents/<pk>/statuses", views.StatusList.as_view(), name="statuses_list"),
]
