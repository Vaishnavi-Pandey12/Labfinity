from sqlalchemy import (
    Column,
    Integer,
    String,
    TIMESTAMP,
    Text,
    Date,
    ForeignKey,
    UniqueConstraint,
    CheckConstraint,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    # `password` stores the hashed password. OAuth-only users will receive an
    # empty string so that the column remains NOT NULL as per schema.
    password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)
    registration_no = Column(String(50), nullable=True)
    google_id = Column(String(255), unique=True, nullable=True)
    profile_picture = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint("role IN ('student','faculty')", name="role_check"),
    )

    # relationships
    classrooms = relationship("Classroom", back_populates="faculty")
    classroom_entries = relationship("ClassroomStudent", back_populates="student")
    quiz_attempts = relationship("QuizAttempt", back_populates="student")
    submissions = relationship("Submission", back_populates="student")

    def __repr__(self):
        return f"<User(id={self.id}, name='{self.name}', email='{self.email}', role='{self.role}')>"


class Classroom(Base):
    __tablename__ = "classrooms"

    id = Column(Integer, primary_key=True, index=True)
    class_name = Column(String(255), nullable=False)
    subject = Column(String(100), nullable=False)
    faculty_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    join_code = Column(String(20), unique=True, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    faculty = relationship("User", back_populates="classrooms")
    students = relationship("ClassroomStudent", back_populates="classroom")
    assignments = relationship("Assignment", back_populates="classroom")

    def __repr__(self):
        return f"<Classroom(id={self.id}, class_name='{self.class_name}', subject='{self.subject}')>"


class ClassroomStudent(Base):
    __tablename__ = "classroom_students"

    id = Column(Integer, primary_key=True, index=True)
    classroom_id = Column(Integer, ForeignKey("classrooms.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    joined_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("classroom_id", "student_id", name="uq_classroom_student"),
    )

    classroom = relationship("Classroom", back_populates="students")
    student = relationship("User", back_populates="classroom_entries")

    def __repr__(self):
        return f"<ClassroomStudent(classroom_id={self.classroom_id}, student_id={self.student_id})>"


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    classroom_id = Column(Integer, ForeignKey("classrooms.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    due_date = Column(Date)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    classroom = relationship("Classroom", back_populates="assignments")
    questions = relationship("QuizQuestion", back_populates="assignment")
    attempts = relationship("QuizAttempt", back_populates="assignment")
    submissions = relationship("Submission", back_populates="assignment")

    def __repr__(self):
        return f"<Assignment(id={self.id}, title='{self.title}')>"


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False)
    question = Column(Text, nullable=False)
    option1 = Column(String(255))
    option2 = Column(String(255))
    option3 = Column(String(255))
    option4 = Column(String(255))
    correct_answer = Column(String(255))

    assignment = relationship("Assignment", back_populates="questions")

    def __repr__(self):
        return f"<QuizQuestion(id={self.id}, assignment_id={self.assignment_id})>"


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    score = Column(Integer)
    attempted_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    assignment = relationship("Assignment", back_populates="attempts")
    student = relationship("User", back_populates="quiz_attempts")

    def __repr__(self):
        return f"<QuizAttempt(id={self.id}, student_id={self.student_id}, score={self.score})>"


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    file_url = Column(Text)
    submitted_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User", back_populates="submissions")

    def __repr__(self):
        return f"<Submission(id={self.id}, student_id={self.student_id})>"