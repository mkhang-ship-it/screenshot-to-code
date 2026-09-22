"""NHÀ TRƯỜNG — KPI tổng quan, phân tích năng lực (bản đồ & xếp hạng), báo cáo, lớp & khối."""
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import (
    Activity,
    ActivityRegistration,
    ClassGroup,
    Evaluation,
    Skill,
    Student,
    StudentSkill,
    Teacher,
    User,
)

router = APIRouter(prefix="/school", tags=["school"])


def _pct_delta(curr: int, prev: int) -> str:
    if prev <= 0:
        return "mới trong tháng" if curr > 0 else "—"
    pct = round((curr - prev) / prev * 100)
    return f"+{pct}% so với tháng trước" if pct >= 0 else f"{pct}% so với tháng trước"


@router.get("/overview")
def overview(db: Session = Depends(get_db)):
    """KPI toàn trường (slide 24): học sinh hoạt động/tháng, tỷ lệ tham gia & hoàn thành."""
    total_students = db.query(Student).count()
    total_hours = db.query(func.coalesce(func.sum(Student.experience_hours), 0)).scalar()
    active_regs = db.query(ActivityRegistration).filter(ActivityRegistration.status == "registered").count()
    checked_in = db.query(func.coalesce(func.sum(ActivityRegistration.hours), 0)).scalar()
    done = db.query(ActivityRegistration).filter(ActivityRegistration.hours >= 1).count()
    participation = round(active_regs / max(total_students, 1) * 100)
    completion = round(done / max(active_regs, 1) * 100) if active_regs else 0

    # phân bố theo lĩnh vực
    fields = (
        db.query(Activity.field, func.count(Activity.id))
        .group_by(Activity.field)
        .all()
    )
    # hoạt động trong tháng hiện tại (start_date "YYYY-MM-DD")
    this_month = datetime.now().strftime("%Y-%m")
    activities_this_month = (
        db.query(Activity).filter(Activity.start_date.like(f"{this_month}%")).count()
    )
    # xu hướng thật: tháng này vs tháng trước (đăng ký / hoàn thành / HS mới / giờ check-in)
    month_expr = func.strftime("%Y-%m", ActivityRegistration.registered_at)
    regs_by_month = {
        m: c
        for m, c in db.query(month_expr, func.count(ActivityRegistration.id))
        .group_by(month_expr)
        .all()
    }
    done_by_month = {
        m: c
        for m, c in db.query(month_expr, func.count(ActivityRegistration.id))
        .filter(ActivityRegistration.hours >= 1)
        .group_by(month_expr)
        .all()
    }
    prev_month = f"{this_month[:4]}-{int(this_month[5:7]) - 1:02d}" if this_month[5:7] != "01" else f"{int(this_month[:4]) - 1}-12"
    regs_delta = _pct_delta(regs_by_month.get(this_month, 0), regs_by_month.get(prev_month, 0))
    done_delta = _pct_delta(done_by_month.get(this_month, 0), done_by_month.get(prev_month, 0))

    # 6 tháng gần nhất: đăng ký (cam) vs hoàn thành (hồng) — slide 24
    monthly = []
    y, m = int(this_month[:4]), int(this_month[5:7])
    for _ in range(6):
        key = f"{y}-{m:02d}"
        monthly.append(
            {
                "month": f"T{m}",
                "key": key,
                "registrations": regs_by_month.get(key, 0),
                "completions": done_by_month.get(key, 0),
            }
        )
        m -= 1
        if m == 0:
            m, y = 12, y - 1
    monthly.reverse()

    return {
        "total_students": total_students,
        "total_hours": float(total_hours),
        "active_registrations": active_regs,
        "participation_pct": participation,
        "completion_pct": completion,
        "activities_per_month": activities_this_month,
        "field_distribution": [{"field": f, "count": c} for f, c in fields],
        "monthly": monthly,
        "trends": {
            "students_delta": f"+{total_students} đang hoạt động",
            "hours_delta": f"{float(checked_in or 0):.0f}h đã ghi nhận",
            "participation_delta": regs_delta,
            "completion_delta": done_delta,
        },
    }


@router.get("/talent-analysis")
def talent_analysis(db: Session = Depends(get_db)):
    """Bản đồ năng khiếu + bảng xếp hạng khối (slide 25)."""
    # điểm TB thật từng kỹ năng từ StudentSkill.level (thang 0-10 → /100)
    skills = db.query(Skill).filter(Skill.is_active.is_(True)).all()
    skill_map = []
    for sk in skills:
        avg = (
            db.query(func.avg(StudentSkill.level))
            .filter(StudentSkill.skill_id == sk.id)
            .scalar()
        )
        skill_map.append(
            {"name": sk.name, "code": sk.code, "avg_score": round((avg or 0) * 10, 1)}
        )

    # xếp hạng khối theo điểm + tổng giờ hoạt động
    grades = db.query(Student.grade).distinct().all()
    grade_rank = []
    for (g,) in grades:
        rows = db.query(Student).filter(Student.grade == g).all()
        avg = round(sum(s.talent_score for s in rows) / len(rows), 1) if rows else 0
        hours = round(sum(s.experience_hours for s in rows), 1)
        grade_rank.append({"grade": g, "avg_score": avg, "count": len(rows), "hours": hours})
    grade_rank.sort(key=lambda x: -x["avg_score"])

    top_students = (
        db.query(Student)
        .order_by(Student.talent_score.desc())
        .limit(10)
        .all()
    )
    return {
        "skill_map": skill_map,
        "grade_ranking": grade_rank,
        "top_students": [
            {"id": s.id, "full_name": s.user.full_name, "class_name": s.class_name, "grade": s.grade, "talent_score": s.talent_score, "hours": s.experience_hours}
            for s in top_students
        ],
    }


@router.get("/reports")
def reports(db: Session = Depends(get_db)):
    """Dữ liệu báo cáo (slide 26) — frontend xuất CSV/XLSX/PDF từ đây."""
    students = db.query(Student).order_by(Student.grade.asc(), Student.talent_score.desc()).all()
    return [
        {
            "id": s.id,
            "full_name": s.user.full_name,
            "class_name": s.class_name,
            "grade": s.grade,
            "talent_score": s.talent_score,
            "experience_hours": s.experience_hours,
        }
        for s in students
    ]


@router.get("/classes")
def classes(db: Session = Depends(get_db)):
    """Tổng quan khối & lớp (slide 27): GVCN + top 5 lớp xuất sắc."""
    rows = (
        db.query(Student.class_name, Student.grade, func.count(Student.id), func.avg(Student.talent_score), func.sum(Student.experience_hours))
        .group_by(Student.class_name, Student.grade)
        .all()
    )
    # GVCN thật từ ClassGroup.homeroom_teacher_id
    homerooms: dict[tuple[str, int], str] = {}
    for cg in db.query(ClassGroup).all():
        name = "—"
        if cg.homeroom_teacher_id:
            t = db.query(Teacher).filter(Teacher.id == cg.homeroom_teacher_id).first()
            if t and t.user:
                name = t.user.full_name
        homerooms[(cg.name, cg.grade)] = name

    class_list = [
        {
            "name": name,
            "grade": grade,
            "count": cnt,
            "avg_score": round(avg or 0, 1),
            "total_hours": float(hours or 0),
            "homeroom": homerooms.get((name, grade), "—"),
        }
        for name, grade, cnt, avg, hours in rows
    ]
    top_classes = sorted(class_list, key=lambda c: -c["avg_score"])[:5]
    return {
        "grades": sorted({g for _, g, *_ in rows}),
        "classes": class_list,
        "top_classes": top_classes,
    }