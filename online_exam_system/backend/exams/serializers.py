from rest_framework import serializers
from .models import Subject, Exam, Question

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class ExamSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    subject_details = SubjectSerializer(source='subject', read_only=True)

    class Meta:
        model = Exam
        fields = '__all__'
        extra_kwargs = {
            'teacher': {'read_only': True}
        }
