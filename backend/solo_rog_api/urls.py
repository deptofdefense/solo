from django.urls import path
from . import views

urlpatterns = [
    path("login/", views.ObtainTokenView.as_view(), name="login"),
    path("workerlog/", views.CeleryDebugTaskView.as_view(), name="workerlog"),
    path("document/", views.DocumentList.as_view(), name="document_list"),
    path("document/d6t", views.D6TSubmission.as_view(), name="d6t_submission"),
    path("document/cor", views.CORSubmission.as_view(), name="cor_submission"),
]
