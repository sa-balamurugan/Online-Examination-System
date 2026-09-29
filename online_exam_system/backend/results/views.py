from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from .models import ExamAttempt, StudentAnswer, Result
from .serializers import ExamAttemptSerializer, StudentAnswerSerializer, ResultSerializer
from exams.models import Exam, Question

class ExamAttemptViewSet(viewsets.ModelViewSet):
    queryset = ExamAttempt.objects.all()
    serializer_class = ExamAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_student:
            return self.queryset.filter(student=user)
        elif user.is_teacher:
            return self.queryset.filter(exam__teacher=user)
        return self.queryset

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        attempt = self.get_object()
        
        if attempt.status != 'IN_PROGRESS':
            return Response({'detail': 'Exam already submitted.'}, status=status.HTTP_400_BAD_REQUEST)
        
        attempt.status = 'SUBMITTED'
        attempt.end_time = timezone.now()
        attempt.save()
        
        # Calculate result
        exam = attempt.exam
        answers = attempt.answers.all()
        
        total_questions = exam.total_questions
        correct_answers = 0
        incorrect_answers = 0
        unanswered_questions = total_questions - answers.count()
        
        for answer in answers:
            if answer.selected_option:
                if answer.selected_option == answer.question.correct_answer:
                    correct_answers += 1
                else:
                    incorrect_answers += 1
            else:
                unanswered_questions += 1
                
        obtained_marks = correct_answers * float(exam.marks_per_question)
        total_marks = total_questions * float(exam.marks_per_question)
        percentage = (obtained_marks / total_marks) * 100 if total_marks > 0 else 0
        is_passed = percentage >= float(exam.passing_percentage)
        
        result = Result.objects.create(
            attempt=attempt,
            total_marks=total_marks,
            obtained_marks=obtained_marks,
            percentage=percentage,
            correct_answers=correct_answers,
            incorrect_answers=incorrect_answers,
            unanswered_questions=unanswered_questions,
            is_passed=is_passed
        )
        
        return Response(ResultSerializer(result).data)

class StudentAnswerViewSet(viewsets.ModelViewSet):
    queryset = StudentAnswer.objects.all()
    serializer_class = StudentAnswerSerializer
    permission_classes = [permissions.IsAuthenticated]

class ResultViewSet(viewsets.ModelViewSet):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_student:
            return self.queryset.filter(attempt__student=user)
        elif user.is_teacher:
            return self.queryset.filter(attempt__exam__teacher=user)
        return self.queryset
