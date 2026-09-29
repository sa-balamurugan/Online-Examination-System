import os
import subprocess
import shutil

base_dir = r"c:\Users\asbal\OneDrive\Desktop\Anti gravity projects\online_exam_system"
backend_dir = os.path.join(base_dir, "backend")
temp_dir = os.path.join(base_dir, "backend_temp")

if os.path.exists(temp_dir):
    shutil.rmtree(temp_dir)
os.makedirs(temp_dir)

os.chdir(temp_dir)
python_exe = os.path.join(base_dir, "venv", "Scripts", "python.exe")

# Start project in temp_dir
subprocess.run([python_exe, "-m", "django", "startproject", "config", "."])

# Move contents to backend_dir
for item in os.listdir(temp_dir):
    s = os.path.join(temp_dir, item)
    d = os.path.join(backend_dir, item)
    if os.path.exists(d):
        if os.path.isdir(d):
            shutil.rmtree(d)
        else:
            os.remove(d)
    shutil.move(s, d)

os.chdir(backend_dir)
shutil.rmtree(temp_dir)

# Start apps
subprocess.run([python_exe, "manage.py", "startapp", "accounts"])
subprocess.run([python_exe, "manage.py", "startapp", "exams"])
subprocess.run([python_exe, "manage.py", "startapp", "results"])
print("Backend setup complete.")
