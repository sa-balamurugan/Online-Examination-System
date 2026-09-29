from rest_framework import viewsets, permissions
from .models import Subject, Exam, Question
from .serializers import SubjectSerializer, ExamSerializer, QuestionSerializer

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [permissions.IsAuthenticated]

class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if user.is_student:
            return Exam.objects.filter(status='PUBLISHED')
        elif user.is_teacher:
            return Exam.objects.filter(teacher=user)
        return super().get_queryset()

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        exam_id = self.request.query_params.get('exam')
        if exam_id:
            return self.queryset.filter(exam_id=exam_id)
        return super().get_queryset()
