from rest_framework import routers
from django.urls import path
from . import views

router = routers.SimpleRouter()
router.register("logs", views.ApiLogViewSet)


urlpatterns = router.urls + [
    path("login/", views.ObtainTokenView.as_view(), name="login"),
    path("workerlog/", views.CeleryDebugTaskView.as_view(), name="workerlog"),
]
