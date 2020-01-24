from rest_framework import routers
from . import views

ROUTER = routers.SimpleRouter()
ROUTER.register(r"logs", views.ApiLogViewSet)
urlpatterns = ROUTER.urls
