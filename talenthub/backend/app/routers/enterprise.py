"""DOANH NGHIỆP — tổng quan, tìm nhân tài (filter), tuyển thực tập, tài trợ dự án."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import (
    Enterprise,
    InternshipApplication,
    InternshipPost,
    Project,
    ProjectMember,
    Sponsorship,
    Student,
    StudentSkill,
    User,
)
from ..schemas import InternshipPostIn, InternshipPostOut

router = APIRouter(prefix="/enterprise", tags=["enterprise"])

# Slide 29: map mã lĩnh vực -> từ khóa tra trong interests (SQLite LIKE
# phân biệt hoa/thường với ký tự có dấu nên liệt kê cả 2 dạng).
FIELD_KEYWORDS: dict[str, list[str]] = {
    "ky_thuat": ["công nghệ", "Công nghệ", "AI", "IoT", "Lập trình", "lập trình", "Robotics", "robotics", "Cơ khí", "cơ khí", "Drone", "drone"],
    "nghe_thuat": ["Âm nhạc", "âm nhạc", "Nghệ thuật", "nghệ thuật", "Mỹ thuật", "mỹ thuật", "Hội họa", "hội họa", "Nhiếp ảnh", "nhiếp ảnh", "Video", "video", "Thiết kế", "thiết kế", "Guitar", "guitar"],
    "kinh_doanh": ["Kinh doanh", "kinh doanh", "Kinh tế", "kinh tế", "Tài chính", "tài chính", "Khởi nghiệp", "khởi nghiệp"],
    "the_thao": ["Thể thao", "thể thao", "Bóng", "bóng"],
    "hoc_thuat": ["Nghiên cứu", "nghiên cứu", "Viết lách", "viết lách", "Học thuật", "học thuật"],
    "sang_tao": ["Sáng tạo", "sáng tạo", "Nội dung", "nội dung", "Thiết kế", "thiết kế"],
}


def _get_enterprise(db: Session, enterprise_id: int | None = None) -> Enterprise:
    if enterprise_id is not None:
        e = db.query(Enterprise).filter(Enterprise.id == enterprise_id).first()
    else:
        e = db.query(Enterprise).first()
    if not e:
        raise HTTPException(404, "Không tìm thấy doanh nghiệp")
    return e


@router.get("/overview")
def overview(enterprise_id: int | None = None, db: Session = Depends(get_db)):
    """Tổng quan (slide 28): hồ sơ phù hợp, tin thực tập, ứng viên, tài trợ."""
    e = _get_enterprise(db, enterprise_id)
    posts = db.query(InternshipPost).filter(InternshipPost.enterprise_id == e.id).all()
    post_ids = [p.id for p in posts]
    applicants = 0
    if post_ids:
        applicants = db.query(InternshipApplication).filter(InternshipApplication.post_id.in_(post_ids)).count()
    sponsorships = db.query(Sponsorship).filter(Sponsorship.enterprise_id == e.id).all()
    total_fund = sum(sp.amount for sp in sponsorships if sp.status == "approved")
    matching = db.query(Student).filter(Student.talent_score >= 70).count()
    return {
        "company_name": e.company_name,
        "industry": e.industry,
        "post_count": len(posts),
        "applicant_count": applicants,
        "sponsorship_count": len(sponsorships),
        "total_sponsored": round(total_fund),
        "matching_profiles": matching,
        "recent_posts": [
            {"id": p.id, "title": p.title, "slots": p.slots, "status": p.status, "applicants": db.query(InternshipApplication).filter(InternshipApplication.post_id == p.id).count()}
            for p in posts[:5]
        ],
    }


@router.get("/talents")
def talents(
    q: str | None = None,
    field: str | None = None,
    class_name: str | None = None,
    grade: int | None = None,
    min_score: float | None = None,
    db: Session = Depends(get_db),
):
    """Tìm kiếm nhân tài (slide 29): filter kỹ năng/ngành/trường/lớp."""
    query = db.query(Student).join(Student.user).order_by(Student.talent_score.desc())
    if q:
        query = query.filter(
            or_(User.full_name.ilike(f"%{q}%"), Student.interests.ilike(f"%{q}%"))
        )
    if class_name:
        query = query.filter(Student.class_name == class_name)
    if grade:
        query = query.filter(Student.grade == grade)
    if field:
        kws = FIELD_KEYWORDS.get(field, [field])
        query = query.filter(or_(*[Student.interests.ilike(f"%{k}%") for k in kws]))
    if min_score is not None:
        query = query.filter(Student.talent_score >= min_score)
    rows = query.limit(50).all()
    return [
        {
            "id": s.id,
            "full_name": s.user.full_name,
            "class_name": s.class_name,
            "grade": s.grade,
            "talent_score": s.talent_score,
            "experience_hours": s.experience_hours,
            "interests": s.interests,
            "avatar_url": s.user.avatar_url,
        }
        for s in rows
    ]


@router.post("/internships", response_model=InternshipPostOut)
def create_internship(payload: InternshipPostIn, enterprise_id: int | None = None, db: Session = Depends(get_db)):
    e = _get_enterprise(db, enterprise_id)
    p = InternshipPost(
        enterprise_id=e.id,
        title=payload.title,
        description=payload.description,
        slots=payload.slots,
        deadline=payload.deadline,
        status="open",
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return InternshipPostOut(
        id=p.id, enterprise_id=p.enterprise_id, title=p.title,
        description=p.description, slots=p.slots, deadline=p.deadline,
        status=p.status, created_at=p.created_at, applicant_count=0,
    )


@router.get("/internships")
def internships(enterprise_id: int | None = None, db: Session = Depends(get_db)):
    """Danh sách tin tuyển thực tập (slide 30)."""
    e = _get_enterprise(db, enterprise_id)
    rows = db.query(InternshipPost).filter(InternshipPost.enterprise_id == e.id).all()
    return [
        {
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "slots": p.slots,
            "status": p.status,
            "deadline": p.deadline,
            "applicant_count": db.query(InternshipApplication).filter(InternshipApplication.post_id == p.id).count(),
        }
        for p in rows
    ]


@router.get("/projects")
def projects(field: str | None = None, db: Session = Depends(get_db)):
    """Danh sách dự án học sinh để doanh nghiệp chọn tài trợ (slide 31)."""
    query = db.query(Project).order_by(Project.id.desc())
    if field:
        query = query.filter(Project.field == field)
    rows = query.limit(100).all()
    out = []
    for pr in rows:
        owner = db.query(Student).join(Student.user).filter(Student.id == pr.owner_student_id).first()
        members = db.query(ProjectMember).filter(ProjectMember.project_id == pr.id).count()
        funded = (
            db.query(func.coalesce(func.sum(Sponsorship.amount), 0))
            .filter(Sponsorship.project_id == pr.id, Sponsorship.status == "approved")
            .scalar()
            or 0
        )
        out.append(
            {
                "id": pr.id,
                "title": pr.title,
                "field": pr.field,
                "description": pr.description,
                "status": pr.status,
                "owner_name": owner.user.full_name if owner else "—",
                "member_count": members,
                "sponsored_total": round(funded),
            }
        )
    return out


@router.get("/sponsorships")
def sponsorships(enterprise_id: int | None = None, db: Session = Depends(get_db)):
    """Danh sách tài trợ dự án (slide 31)."""
    e = _get_enterprise(db, enterprise_id)
    rows = (
        db.query(Sponsorship, Project)
        .join(Project, Project.id == Sponsorship.project_id)
        .filter(Sponsorship.enterprise_id == e.id)
        .all()
    )
    return [
        {
            "sponsorship_id": sp.id,
            "project_id": pr.id,
            "project_title": pr.title,
            "field": pr.field,
            "amount": sp.amount,
            "status": sp.status,
            "created_at": str(sp.created_at)[:10],
        }
        for sp, pr in rows
    ]


@router.post("/sponsorships")
def create_sponsorship(project_id: int, amount: float = 5_000_000, enterprise_id: int | None = None, db: Session = Depends(get_db)):
    e = _get_enterprise(db, enterprise_id)
    sp = Sponsorship(enterprise_id=e.id, project_id=project_id, amount=amount, status="approved")
    db.add(sp)
    db.commit()
    db.refresh(sp)
    return {"ok": True, "sponsorship_id": sp.id, "amount": sp.amount, "status": sp.status}