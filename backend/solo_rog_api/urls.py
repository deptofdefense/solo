from rest_framework import routers
from django.urls import path
from . import views

# Updated url in order to have more control over how
urlpatterns = [
    path("login/", views.ObtainTokenView.as_view(), name="login"),
    path("workerlog/", views.CeleryDebugTaskView.as_view(), name="workerlog"),
    path("documents/", views.DocumentList.as_view(), name="document_list"),
    path("documents/<pk>/", views.DocumentDetail.as_view(), name="document_detail"),
    path("documents/<pk>/statuses", views.StatusList.as_view(), name="statuses_list"),
    path("documents/create", views.CreateDocument.as_view(), name="document_create"),
    path(
        "documents/<pk>/statuses/create",
        views.CreateStatus.as_view(),
        name="statuses_create",
    ),
]
