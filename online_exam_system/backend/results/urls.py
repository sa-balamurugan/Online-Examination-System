from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExamAttemptViewSet, StudentAnswerViewSet, ResultViewSet

router = DefaultRouter()
router.register(r'attempts', ExamAttemptViewSet)
router.register(r'answers', StudentAnswerViewSet)
router.register(r'results', ResultViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
