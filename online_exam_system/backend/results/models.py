from django.db import models
from accounts.models import User
from exams.models import Exam, Question

class ExamAttempt(models.Model):
    STATUS_CHOICES = (
        ('IN_PROGRESS', 'In Progress'),
        ('SUBMITTED', 'Submitted'),
        ('AUTO_SUBMITTED', 'Auto Submitted'),
    )

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exam_attempts')
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='attempts')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='IN_PROGRESS')
    
    def __str__(self):
        return f"{self.student.username} - {self.exam.title}"

class StudentAnswer(models.Model):
    attempt = models.ForeignKey(ExamAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.CharField(max_length=1, null=True, blank=True)
    is_marked_for_review = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.attempt.student.username} - Q: {self.question.id}"

class Result(models.Model):
    attempt = models.OneToOneField(ExamAttempt, on_delete=models.CASCADE, related_name='result')
    total_marks = models.DecimalField(max_digits=6, decimal_places=2, default=0.0)
    obtained_marks = models.DecimalField(max_digits=6, decimal_places=2, default=0.0)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    correct_answers = models.PositiveIntegerField(default=0)
    incorrect_answers = models.PositiveIntegerField(default=0)
    unanswered_questions = models.PositiveIntegerField(default=0)
    is_passed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Result: {self.attempt.student.username} - {self.percentage}%"
