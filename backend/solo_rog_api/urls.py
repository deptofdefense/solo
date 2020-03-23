from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path("login/", views.ObtainTokenView.as_view(), name="login"),
    path("login/refresh/", TokenRefreshView.as_view(), name="login_refresh"),
    path("workerlog/", views.CeleryDebugTaskView.as_view(), name="workerlog"),
    path("document/", views.DocumentList.as_view(), name="document_list"),
]
