from rest_framework import serializers
from .models import ExamAttempt, StudentAnswer, Result
from exams.serializers import ExamSerializer, QuestionSerializer

class StudentAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentAnswer
        fields = '__all__'

class ResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Result
        fields = '__all__'

class ExamAttemptSerializer(serializers.ModelSerializer):
    answers = StudentAnswerSerializer(many=True, read_only=True)
    result = ResultSerializer(read_only=True)
    exam_details = ExamSerializer(source='exam', read_only=True)
    
    class Meta:
        model = ExamAttempt
        fields = '__all__'
