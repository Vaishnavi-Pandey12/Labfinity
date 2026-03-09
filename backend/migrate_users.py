"""
Migration script to replace the old `students`/`faculties` layout
with the unified `users` table and the new interactive classroom
schema. Running this will drop the legacy tables and then invoke
`Base.metadata.create_all` to recreate everything from the
current SQLAlchemy models (users, classrooms, assignments, etc.).

Usage: run from the backend directory:
    python migrate_users.py
"""
from db import engine, Base
from models import User, Classroom, ClassroomStudent, Assignment, QuizQuestion, QuizAttempt, Submission  # noqa: F401
from sqlalchemy import text

print("Dropping legacy tables (students, faculties) if they exist ...")
with engine.begin() as conn:
    conn.execute(text("DROP TABLE IF EXISTS students CASCADE;"))
    conn.execute(text("DROP TABLE IF EXISTS faculties CASCADE;"))
    print("Creating new schema from models...")
    Base.metadata.create_all(bind=engine)
    print("Schema creation complete.")

print("Migration completed!")
