import uuid
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, JSON, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class DifficultyEnum(str, enum.Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"

class SubmissionStatusEnum(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    WRONG_ANSWER = "wrong_answer"
    RUNTIME_ERROR = "runtime_error"
    TIME_LIMIT_EXCEEDED = "time_limit_exceeded"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    submissions = relationship("Submission", back_populates="user", cascade="all, delete-orphan")

class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description_md = Column(Text, nullable=False)
    theory_md = Column(Text, nullable=False)
    starter_code = Column(Text, nullable=False)
    difficulty = Column(String, default="Medium")  # e.g., "Easy", "Medium", "Hard"
    tags = Column(JSON, default=list)  # e.g., ["Linear Algebra", "Transformers"]
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    test_cases = relationship("TestCase", back_populates="problem", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="problem", cascade="all, delete-orphan")

class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id", ondelete="CASCADE"), nullable=False)
    input_json = Column(JSON, nullable=False)  # inputs as a JSON object, e.g., {"seq_len": 3, "d_model": 4}
    expected_output = Column(Text, nullable=False)  # serialized expected output, e.g., a JSON or string
    is_public = Column(Boolean, default=True)

    problem = relationship("Problem", back_populates="test_cases")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    problem_id = Column(Integer, ForeignKey("problems.id", ondelete="CASCADE"), nullable=False)
    code = Column(Text, nullable=False)
    status = Column(String, default="pending")  # enum status: pending, accepted, wrong_answer, etc.
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="submissions")
    problem = relationship("Problem", back_populates="submissions")
