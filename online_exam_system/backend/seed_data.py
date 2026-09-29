import os
import django
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User, StudentProfile, TeacherProfile
from exams.models import Subject, Exam, Question

def seed_data():
    print("Seeding database...")
    
    # 1. Create Admin
    if not User.objects.filter(username='admin').exists():
        admin = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
        admin.role = 'ADMIN'
        admin.save()
        print("Admin user created.")

    # 2. Create Teacher
    if not User.objects.filter(username='teacher1').exists():
        teacher = User.objects.create_user('teacher1', 'teacher@example.com', 'teacher123')
        teacher.role = 'TEACHER'
        teacher.save()
        TeacherProfile.objects.create(user=teacher, employee_id='T001', department='Computer Science')
        print("Teacher user created.")
    else:
        teacher = User.objects.get(username='teacher1')

    # 3. Create Student
    if not User.objects.filter(username='student1').exists():
        student = User.objects.create_user('student1', 'student@example.com', 'student123')
        student.role = 'STUDENT'
        student.save()
        StudentProfile.objects.create(user=student, enrollment_number='S001', department='Computer Science')
        print("Student user created.")

    # 4. Create Subject
    subject, created = Subject.objects.get_or_create(
        code='CS101',
        defaults={
            'name': 'Introduction to Python',
            'description': 'Basic Python programming concepts.'
        }
    )
    if created:
        print("Subject created.")

    # 5. Create Exam
    exam, created = Exam.objects.get_or_create(
        title='Python Midterm Exam',
        subject=subject,
        teacher=teacher,
        defaults={
            'description': 'Midterm examination covering fundamental concepts.',
            'duration': 60,
            'total_questions': 3,
            'marks_per_question': 10,
            'passing_percentage': 40,
            'start_date': timezone.now(),
            'end_date': timezone.now() + timedelta(days=7),
            'status': 'PUBLISHED'
        }
    )
    if created:
        print("Exam created.")
        
        # Add Questions
        Question.objects.create(
            exam=exam,
            question_text='What is a correct syntax to output "Hello World" in Python?',
            option_a='print("Hello World")',
            option_b='p("Hello World")',
            option_c='echo "Hello World"',
            option_d='echo("Hello World");',
            correct_answer='A',
            explanation='The print() function prints the specified message to the screen.'
        )
        
        Question.objects.create(
            exam=exam,
            question_text='How do you insert COMMENTS in Python code?',
            option_a='// This is a comment',
            option_b='/* This is a comment */',
            option_c='# This is a comment',
            option_d='-- This is a comment',
            correct_answer='C',
            explanation='Comments in Python start with the hash character, #.'
        )
        
        Question.objects.create(
            exam=exam,
            question_text='Which one is NOT a legal variable name?',
            option_a='my_var',
            option_b='my-var',
            option_c='_myvar',
            option_d='myvar',
            correct_answer='B',
            explanation='Variable names cannot contain a hyphen.'
        )
        print("Questions created.")

    print("Seeding complete!")

if __name__ == '__main__':
    seed_data()
