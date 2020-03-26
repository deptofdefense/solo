from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path("login/", views.ObtainTokenView.as_view(), name="login"),
    path("login/refresh/", TokenRefreshView.as_view(), name="login_refresh"),
    path("workerlog/", views.CeleryDebugTaskView.as_view(), name="workerlog"),
    path("document/", views.DocumentList.as_view(), name="document_list"),
    path("document/d6t/", views.D6TSubmissionView.as_view(), name="bulk_d6t"),
    path("document/cor/", views.CORSubmissionView.as_view(), name="bulk_cor"),
    path("document/cor/bulk/", views.CORSubmissionView.as_view(), name="bulk_cor"),
]
