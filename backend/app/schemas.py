from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Any
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# TestCase Schemas
class TestCaseBase(BaseModel):
    input_json: dict = Field(..., description="JSON representation of input arguments")
    expected_output: str = Field(..., description="Expected output string")
    is_public: bool = True

class TestCaseCreate(TestCaseBase):
    pass

class TestCaseResponse(TestCaseBase):
    id: int
    problem_id: int

    class Config:
        from_attributes = True

# Problem Schemas
class ProblemBase(BaseModel):
    title: str
    difficulty: str  # Easy, Medium, Hard
    tags: List[str] = []

class ProblemCreate(ProblemBase):
    description_md: str
    theory_md: str
    starter_code: str
    test_cases: List[TestCaseCreate] = []

class ProblemUpdate(BaseModel):
    title: Optional[str] = None
    difficulty: Optional[str] = None
    tags: Optional[List[str]] = None
    description_md: Optional[str] = None
    theory_md: Optional[str] = None
    starter_code: Optional[str] = None

class ProblemResponse(ProblemBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ProblemDetailResponse(ProblemBase):
    id: int
    description_md: str
    theory_md: str
    starter_code: str
    test_cases: List[TestCaseResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True

# Submission Schemas
class SubmissionCreate(BaseModel):
    problem_id: int
    code: str

class SubmissionResponse(BaseModel):
    id: str
    problem_id: int
    user_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class SubmissionDetail(SubmissionResponse):
    code: str
    error_message: Optional[str] = None

    class Config:
        from_attributes = True
