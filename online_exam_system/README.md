# Online Examination Management System

A full-stack college project — Online Examination Management System with role-based access for Admin, Teacher, and Student.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Charts | Recharts |
| HTTP Client | Axios |
| Routing | React Router v6 |
| Backend | Django 6 + Django REST Framework |
| Auth | JWT via SimpleJWT |
| Database | SQLite (default) / MySQL |

---

## 📁 Project Structure

```
online_exam_system/
├── backend/                  # Django backend
│   ├── config/               # Django project settings + URLs
│   ├── accounts/             # User management (Admin/Teacher/Student)
│   ├── exams/                # Subjects, Exams, Questions
│   │   └── management/commands/seed_data.py
│   ├── results/              # ExamAttempts, Answers, Results
│   ├── requirements.txt
│   └── manage.py
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── context/AuthContext.jsx
│   │   ├── services/api.js
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── TeacherDashboard.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── ExamInterface.jsx
│   │   │   └── ResultPage.jsx
│   │   └── App.jsx
│   └── .env
├── venv/                     # Python virtual environment
└── .env                      # Backend environment variables
```

---

## ⚙️ Setup & Installation

### 1. Backend Setup

```bash
# Activate virtual environment
# Windows:
.\venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Configure .env (in root of online_exam_system/)
# Edit DATABASE_URL for MySQL if needed

# Run migrations
cd backend
python manage.py migrate

# Seed demo data
python manage.py seed_data

# Start the server
python manage.py runserver
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🗄️ Database Configuration

### SQLite (Default — no setup needed)
```
DATABASE_URL=sqlite:///db.sqlite3
```

### MySQL
1. Create database: `CREATE DATABASE online_exam_db;`
2. Update `.env`:
```
DATABASE_URL=mysql://username:password@localhost:3306/online_exam_db
```

---

## 🔑 Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Teacher | teacher1 | teacher123 |
| Teacher | teacher2 | teacher123 |
| Student | student1 | student123 |
| Student | student2 | student123 |
| Student | student3 | student123 |
| Student | student4 | student123 |
| Student | student5 | student123 |

---

## 🌐 API Overview

| Endpoint | Description |
|----------|-------------|
| POST `/api/accounts/auth/login/` | Login (returns JWT) |
| GET `/api/accounts/auth/me/` | Current logged-in user |
| GET/POST `/api/accounts/users/` | List / Create users |
| GET/POST `/api/exams/subjects/` | Subjects CRUD |
| GET/POST `/api/exams/exams/` | Exams CRUD |
| GET/POST `/api/exams/questions/` | Questions CRUD |
| GET/POST `/api/results/attempts/` | Exam attempts |
| POST `/api/results/attempts/{id}/submit/` | Submit exam + calculate result |
| GET/POST `/api/results/answers/` | Student answers |
| GET `/api/results/results/` | Results |

---

## ✨ Features

### Admin
- Dashboard with stats and charts
- Manage students, teachers, subjects, exams
- View all results
- Activate/deactivate users

### Teacher
- Create exams with full configuration (duration, marks, passing %, start/end date)
- Add/delete MCQ questions with correct answers
- Publish/unpublish exams
- View results

### Student
- Browse available published exams
- View exam instructions before starting
- Take MCQ exam with countdown timer
- Navigate questions, mark for review, clear answers
- Auto-submit when timer expires
- View results (score, percentage, pass/fail, correct/incorrect/skipped)
- Exam history

---

## 🔮 Future Enhancements
- Email notifications
- Question bank with categories
- PDF report export
- Negative marking
- Webcam proctoring
- Question randomization
- Bulk upload questions from CSV
