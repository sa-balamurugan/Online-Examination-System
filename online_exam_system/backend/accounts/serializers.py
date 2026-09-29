from rest_framework import serializers
from .models import User, StudentProfile, TeacherProfile
from django.contrib.auth.hashers import make_password

class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ['enrollment_number', 'department']

class TeacherProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherProfile
        fields = ['employee_id', 'department']

class UserSerializer(serializers.ModelSerializer):
    student_profile = StudentProfileSerializer(required=False)
    teacher_profile = TeacherProfileSerializer(required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'password', 'student_profile', 'teacher_profile']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        student_data = validated_data.pop('student_profile', None)
        teacher_data = validated_data.pop('teacher_profile', None)
        
        validated_data['password'] = make_password(validated_data['password'])
        user = User.objects.create(**validated_data)

        if user.role == 'STUDENT':
            StudentProfile.objects.create(user=user, **(student_data or {}))
        elif user.role == 'TEACHER':
            TeacherProfile.objects.create(user=user, **(teacher_data or {}))

        return user
