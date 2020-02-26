from rest_framework import routers
from django.urls import path
from . import views

ROUTER = routers.SimpleRouter()
ROUTER.register(r"logs", views.ApiLogViewSet)

urlpatterns = ROUTER.urls + [
    path(r"login/", views.ObtainTokenView.as_view(), name="login"),
    path(r"workerlog/", views.CeleryDebugTaskView.as_view(), name="workerlog"),
]
