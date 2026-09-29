from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubjectViewSet, ExamViewSet, QuestionViewSet

router = DefaultRouter()
router.register(r'subjects', SubjectViewSet)
router.register(r'exams', ExamViewSet)
router.register(r'questions', QuestionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
