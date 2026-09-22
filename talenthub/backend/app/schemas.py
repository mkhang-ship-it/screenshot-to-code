"""Pydantic schemas — response models cho 4 cổng."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---------------- users
class UserOut(ORMModel):
    id: int
    role: str
    full_name: str
    email: str
    avatar_url: Optional[str] = None
    profile_id: Optional[int] = None
    detail: Optional[dict] = None


class LoginIn(BaseModel):
    email: str
    password: str


class LoginOut(BaseModel):
    token: str
    user: UserOut


# ---------------- student
class StudentOut(ORMModel):
    id: int
    class_name: str
    grade: int
    talent_score: float
    experience_hours: float
    interests: Optional[str] = None
    bio: Optional[str] = None
    user: UserOut


class StudentDetail(StudentOut):
    badges: list = []
    skills: list = []
    evaluations: list = []


# ---------------- teacher
class TeacherOut(ORMModel):
    id: int
    subject: str
    is_homeroom: bool
    user: UserOut


class EvaluationIn(BaseModel):
    activity_id: int
    student_id: int
    chuyen_mon: float = 0
    sang_tao: float = 0
    lam_viec_nhom: float = 0
    ky_luat: float = 0
    comment: Optional[str] = None


class EvaluationOut(EvaluationIn, ORMModel):
    id: int
    teacher_id: int
    evaluated_at: datetime
    total: float = 0


# ---------------- activity
class ActivityIn(BaseModel):
    title: str
    field: str
    description: Optional[str] = None
    capacity: int = 30
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class ActivityOut(ActivityIn, ORMModel):
    id: int
    teacher_id: Optional[int] = None
    status: str = "open"
    registered_count: int = 0


# ---------------- enterprise
class InternshipPostIn(BaseModel):
    title: str
    description: Optional[str] = None
    slots: int = 3
    deadline: Optional[str] = None


class InternshipPostOut(InternshipPostIn, ORMModel):
    id: int
    enterprise_id: int
    status: str = "open"
    created_at: datetime
    applicant_count: int = 0


# ---------------- passport
class PassportOut(ORMModel):
    student_id: int
    qr_code: str
    updated_at: datetime
    student: StudentOut | None = None
    certificates: list = []
    projects: list = []
    activities: list = []
    skills: list = []
    badges: list = []