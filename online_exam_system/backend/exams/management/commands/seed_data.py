import random
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from accounts.models import User, StudentProfile, TeacherProfile
from exams.models import Subject, Exam, Question

class Command(BaseCommand):
    help = 'Seeds the database with demo data'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding data...")

        # 1 Admin
        admin, _ = User.objects.get_or_create(username='admin', defaults={
            'email': 'admin@example.com',
            'role': 'ADMIN',
            'is_superuser': True,
            'is_staff': True
        })
        admin.set_password('admin123')
        admin.save()

        # 2 Teachers
        teacher1, _ = User.objects.get_or_create(username='teacher1', defaults={'email': 'teacher1@example.com', 'role': 'TEACHER'})
        teacher1.set_password('teacher123')
        teacher1.save()
        TeacherProfile.objects.get_or_create(user=teacher1, defaults={'employee_id': 'T001', 'department': 'Computer Science'})

        teacher2, _ = User.objects.get_or_create(username='teacher2', defaults={'email': 'teacher2@example.com', 'role': 'TEACHER'})
        teacher2.set_password('teacher123')
        teacher2.save()
        TeacherProfile.objects.get_or_create(user=teacher2, defaults={'employee_id': 'T002', 'department': 'Mathematics'})

        # 5 Students
        students = []
        for i in range(1, 6):
            student, _ = User.objects.get_or_create(username=f'student{i}', defaults={'email': f'student{i}@example.com', 'role': 'STUDENT'})
            student.set_password('student123')
            student.save()
            StudentProfile.objects.get_or_create(user=student, defaults={'enrollment_number': f'S00{i}', 'department': 'Computer Science'})
            students.append(student)

        # Subjects
        sub_cs, _ = Subject.objects.get_or_create(name='Data Structures', code='CS101', description='Intro to DS')
        sub_math, _ = Subject.objects.get_or_create(name='Calculus', code='MA101', description='Calculus 1')

        # Exams
        now = timezone.now()
        exam1, _ = Exam.objects.get_or_create(title='Data Structures Midterm', defaults={
            'subject': sub_cs,
            'teacher': teacher1,
            'duration': 60,
            'total_questions': 5,
            'marks_per_question': 2,
            'passing_percentage': 50,
            'start_date': now - timedelta(days=1),
            'end_date': now + timedelta(days=5),
            'status': 'PUBLISHED'
        })
        
        exam2, _ = Exam.objects.get_or_create(title='Calculus Final', defaults={
            'subject': sub_math,
            'teacher': teacher2,
            'duration': 120,
            'total_questions': 2,
            'marks_per_question': 5,
            'passing_percentage': 40,
            'start_date': now + timedelta(days=1),
            'end_date': now + timedelta(days=5),
            'status': 'PUBLISHED'
        })

        # Questions for Exam 1
        if exam1.questions.count() == 0:
            Question.objects.create(exam=exam1, question_text="What is a stack?", option_a="FIFO", option_b="LIFO", option_c="LILO", option_d="None", correct_answer="B")
            Question.objects.create(exam=exam1, question_text="Which of the following is a non-linear data structure?", option_a="Array", option_b="Linked List", option_c="Tree", option_d="Stack", correct_answer="C")
            Question.objects.create(exam=exam1, question_text="Time complexity of binary search?", option_a="O(1)", option_b="O(n)", option_c="O(log n)", option_d="O(n^2)", correct_answer="C")
            Question.objects.create(exam=exam1, question_text="What is a queue?", option_a="FIFO", option_b="LIFO", option_c="LILO", option_d="None", correct_answer="A")
            Question.objects.create(exam=exam1, question_text="Which sort is fastest on average?", option_a="Bubble", option_b="Insertion", option_c="Merge", option_d="Quick", correct_answer="D")

        self.stdout.write(self.style.SUCCESS("Demo data seeded successfully!"))
        self.stdout.write("Credentials:")
        self.stdout.write("Admin: admin / admin123")
        self.stdout.write("Teacher: teacher1 / teacher123, teacher2 / teacher123")
        self.stdout.write("Student: student1 / student123 ... student5 / student123")
