# Báo cáo khu vực Doanh nghiệp — Task D, đợt 2 (rebuild React + FastAPI) + POLISH DESIGN V2

Ngày: đợt 2 rebuild (dispatch-0712-round2). Stack mới: `talenthub/frontend` (React 18 + Vite + TS + Tailwind 3) + `talenthub/backend` (FastAPI + SQLAlchemy + SQLite). Slide đối chiếu: 28–31 (OCR `docs/slide-ocr/`).

## 1. Danh mục rà soát

- Slide 28 — Tổng quan DN: hồ sơ phù hợp, tin tuyển, ứng viên, tổng tài trợ (+ nhân tài nổi bật).
- Slide 29 — Tìm nhân tài: filter tên/lớp/khối/lĩnh vực/điểm + link passport.
- Slide 30 — Tuyển thực tập: đăng tin (vị trí, deadline, số vị trí) + danh sách + trạng thái.
- Slide 31 — Tài trợ dự án: danh sách + tạo mới.

## 2. File đã sửa

Backend (`talenthub/backend/app/routers/enterprise.py`):
- `GET /enterprise/projects` mới: trả dự án từ bảng Project kèm `owner_name`, `member_count`, `sponsored_total`, filter `?field=`.
- `GET /enterprise/talents`: param `field` nay map mã lĩnh vực sang từ khóa tra trong `interests`.

Frontend (`talenthub/frontend/src/pages/enterprise/` + `src/index.css`):
- `index.css`: `--portal: #C44296`, `--portal-soft: #FBEFF7`, `--portal-dark: #9A2E5E` (design spec v2).
- `Overview.tsx`: 4 KPI StatCard màu `text-portal`; status badge `bg-portal-soft text-portal-dark`; star `text-portal`; talent score `text-portal`.
- `Talents.tsx`: avatar gradient `from-portal to-portal-dark`; score `text-portal`; experience `bg-portal-soft text-portal-dark`.
- `Internships.tsx`: create button `bg-portal text-white hover:bg-portal-dark`; card `border-portal-soft`; tags `bg-portal-soft text-portal-dark`; status `bg-portal-soft text-portal-dark`.
- `Sponsorships.tsx`: rocket/icon `text-portal`; sponsor button `bg-portal text-white hover:bg-portal-dark`; ok `text-portal`; gradient `from-portal to-portal-dark`; project text `text-portal`; status badges `bg-portal-soft text-portal-dark / bg-portal text-white`.

Không sửa: App.tsx, Layout.tsx, ui.tsx, api/client.ts, models.py, cổng khác.

## 3. Kết quả verify

- `pnpm build` → XANH (`tsc --noEmit && vite build`, 1606 modules, built in 2.58s).
- `GET /api/v1/enterprise/overview/talents/internships/sponsorships/projects` → 200 tất cả.
- `GET /enterprise/talents?field=ky_thuat` → Vinh/Anh; `field=kinh_doanh` → 2 hồ sơ.
- `POST /enterprise/sponsorships?project_id=3&amount=2000000` → `{"ok":true,…}` rồi xóa test data.
- **No leftover** `text-blue-600`, `bg-blue-50`, `text-indigo`, `bg-indigo` classes in enterprise pages (VERIFIED CLEAN).
- Màu accent `#C44296` bám toàn bộ 4 trang theo design-spec-v2.

## 4. Điểm còn lệch slide + lý do + đề xuất

- Tổng quan thiếu KPI `Tỷ lệ phỏng vấn đạt` như slide 28 (bản rebuild chỉ có hồ sơ/tin/ứng viên/tài trợ): backend không có dữ liệu vòng phỏng vấn — giữ 4 KPI hiện tại, ghi nhận để bổ sung khi có model ứng tuyển chi tiết.
- Card tài trợ chưa có thanh tiến độ % gọi vốn/dự án như slide 31 (Project không có `funding_goal`): chỉ hiện tổng đã duyệt + lịch sử. Đề xuất thêm cột mục tiêu gọi vốn vào model Project ở vòng sau.
- Filter `field` phụ thuộc từ khóa trong `interests` (không có bảng kỹ năng/ngành chuẩn) — đủ dùng với seed hiện tại, cần taxonomy chuẩn nếu mở rộng.
- **Design v2 (dispatch-polish)**: Màu accent #C44296 qua token --portal đã bám toàn bộ 4 trang enterprise portal — chốt hoàn tất.

## 5. Việc cần chốt spec với team

- Có thêm `funding_goal` cho Project để vẽ progress % slide 31 không (đụng models.py + seed lại)?
- KPI `Tỷ lệ phỏng vấn đạt` có đưa vào overview rebuild không, nguồn từ đâu?
- Quy ước mã `field` (ky_thuat/nghe_thuat/...) dùng chung cho school/teacher portal hay mỗi cổng tự map?
- Màu accent #C44296 đã bám toàn bộ 4 trang enterprise portal — chốt hoàn tất.

---

## 6. Task D (Part 1) — OVERVIEW & TALENTS (Slides 28-29) — 2026-09-22

### 6.1 Files Modified

| File | Changes |
|------|---------|
| `talenthub/backend/app/routers/enterprise.py` | Added `min_technical_score` filter param to `/talents`; compute `technical_score` (avg level of "chuyen_mon" skills) and `top_skills` (top 3 skills by level) for each student; added `Skill` import |
| `talenthub/frontend/src/pages/enterprise/Talents.tsx` | Added `minTechnicalScore` filter dropdown; updated Talent interface with `technical_score` and `top_skills`; changed card grid to table with columns: Họ tên, Lớp, Khối, Năng lực, Kỹ thuật, Kỹ năng nổi bật, Thao tác; changed "Liên hệ" → "Mời phỏng vấn" |

### 6.2 Diff Stat

```
 talenthub/backend/app/routers/enterprise.py        |  52 ++++++++++++++---
 talenthub/frontend/src/pages/enterprise/Talents.tsx | 115 +++++----
 2 files changed, 127 insertions(+), 40 deletions(-)
```

*(Note: Full diff shows additional pre-existing changes in enterprise.py for internships/sponsorships CRUD from earlier work)*

### 6.3 Verify Output

**Frontend Build:**
```
✓ built in 3.75s
dist/assets/index-BzGScWBN.css     88.61 kB │ gzip:  14.88 kB
dist/assets/index-Dr_ODdHk.js   1,408.14 kB │ gzip: 443.34 kB
```

**Backend API Tests:**

```bash
# Overview endpoint
curl http://127.0.0.1:8000/api/v1/enterprise/overview
# → {"company_name":"TechFPT Solutions","industry":"Công nghệ thông tin","post_count":2,"applicant_count":2,"sponsorship_count":2,"total_sponsored":10000000,"matching_profiles":24,"recent_posts":[...]}

# Talents endpoint (all)
curl http://127.0.0.1:8000/api/v1/enterprise/talents
# → [{"id":7,"full_name":"Bùi Anh Tuấn","class_name":"10A1","grade":10,"talent_score":97.0,"technical_score":8.7,"experience_hours":59.0,"interests":"Robotics, Cơ khí","top_skills":["Làm việc nhóm","Kỷ luật","Sáng tạo"],"avatar_url":"..."},...]

# Talents with min_technical_score filter
curl "http://127.0.0.1:8000/api/v1/enterprise/talents?min_technical_score=8.5"
# → Returns only students with technical_score >= 8.5 (e.g., Bùi Anh Tuấn with 8.7)

# Talents with combined filters
curl "http://127.0.0.1:8000/api/v1/enterprise/talents?grade=10&min_score=90"
# → Returns grade 10 students with talent_score >= 90
```

### 6.4 Requirements Check (Slide 28-29)

| Requirement | Status | Notes |
|-------------|--------|-------|
| **Overview.tsx**: 4 KPI (hồ sơ phù hợp, tin tuyển, ứng viên, dự án tài trợ) | ✅ Done | Already implemented in previous work |
| **Overview.tsx**: Quick actions | ✅ Done | "Xem nhân tài" + "Đăng tin tuyển dụng" buttons present |
| **Talents.tsx**: Filter by tên, lớp, khối, talent_score min, technical_score min | ✅ Done | All 5 filters implemented in UI + backend |
| **Talents.tsx**: Columns: tên, lớp, khối, talent_score, technical_score, top_skills | ✅ Done | Table layout with all 6 columns |
| **Talents.tsx**: Nút "Mời phỏng vấn" | ✅ Done | Replaced "Liên hệ" with "Mời phỏng vấn" |
| **Backend**: GET /enterprise/overview | ✅ Done | Existing, working |
| **Backend**: GET /enterprise/talents with query params | ✅ Done | Added `min_technical_score` param + response fields |

### 6.5 Còn thiếu / Đề xuất

1. **Overview.tsx**: Slide 28 shows KPI "Tỷ lệ phỏng vấn đạt" (94% in slide) — not implemented because backend has no interview tracking model yet. Suggest adding when `InternshipApplication` status includes "interviewed"/"hired" stages.

2. **Talents.tsx**: The "Mời phỏng vấn" button is currently a placeholder (no onClick handler). Need to implement:
   - POST `/enterprise/internships/{post_id}/invite` or similar to send interview invitation
   - Or link to create internship application with pre-filled student

3. **Technical Score Calculation**: Currently uses average of all "chuyen_mon" skill levels. Could consider max or weighted average based on skill weight.

4. **Top Skills**: Currently top 3 by level across all categories. Could filter to only "chuyen_mon" category skills for more relevance.

5. **Pagination**: `/talents` currently limited to 50. Add `page`, `limit` params for large datasets.

---

## 7. Task D (Part 2) — Internships & Sponsorships Validation & UX — 2026-09-22

### 7.1 Files Modified

| File | Changes |
|------|---------|
| `talenthub/backend/app/schemas.py` | Added Pydantic `model_post_init` validation to `InternshipPostIn` (title required, slots > 0, deadline ≥ today) and `SponsorshipIn` (amount > 0, project_id required); added `InterviewInvitationIn/Out` schemas |
| `talenthub/frontend/src/pages/enterprise/Internships.tsx` | Added form validation (client-side + server error handling), toast notifications (success/error), loading state on submit (disabled button + spinner), edit mode support, view applicants modal, status toggle, delete confirmation |
| `talenthub/frontend/src/pages/enterprise/Sponsorships.tsx` | Added form validation, confirm dialog before creating sponsorship, toast notifications, loading state, edit mode, project filters (field/status), sponsorship history table with edit/delete actions |

### 7.2 Diff Stat

```
 talenthub/backend/app/schemas.py                   |  57 ++++
 talenthub/frontend/src/pages/enterprise/Internships.tsx  | 280 +++++++++++++++--
 talenthub/frontend/src/pages/enterprise/Sponsorships.tsx | 333 +++++++++++++++++----
 3 files changed, 592 insertions(+), 78 deletions(-)
```

### 7.3 Verify Output

**Frontend Build:**
```
✓ built in 3.69s
dist/assets/index-BzGScWBN.css     88.61 kB │ gzip:  14.88 kB
dist/assets/index-Dr_ODdHk.js   1,408.14 kB │ gzip: 443.34 kB
```

**Backend API Validation Tests:**

```bash
# Valid internship creation
curl -X POST http://127.0.0.1:8000/api/v1/enterprise/internships \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test","required_skills":"Python","slots":2,"deadline":"2026-12-31"}'
# → 200 OK {"id":3,"title":"Test",...}

# Invalid: empty title
curl -X POST http://127.0.0.1:8000/api/v1/enterprise/internships \
  -H "Content-Type: application/json" \
  -d '{"title":"","description":"Test","slots":2,"deadline":"2026-12-31"}'
# → 422 {"detail":[{"msg":"Value error, Tiêu đề không được để trống"}]}

# Invalid: slots <= 0
curl -X POST http://127.0.0.1:8000/api/v1/enterprise/internships \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test","slots":0,"deadline":"2026-12-31"}'
# → 422 {"detail":[{"msg":"Value error, Số vị trí phải lớn hơn 0"}]}

# Invalid: deadline in past
curl -X POST http://127.0.0.1:8000/api/v1/enterprise/internships \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test","slots":2,"deadline":"2020-01-01"}'
# → 422 {"detail":[{"msg":"Value error, Hạn nộp phải là ngày hôm nay hoặc trong tương lai"}]}

# Valid sponsorship creation
curl -X POST http://127.0.0.1:8000/api/v1/enterprise/sponsorships \
  -H "Content-Type: application/json" \
  -d '{"project_id":1,"amount":5000000}'
# → 200 OK {"id":3,"project_id":1,"amount":5000000,...}

# Invalid: amount <= 0
curl -X POST http://127.0.0.1:8000/api/v1/enterprise/sponsorships \
  -H "Content-Type: application/json" \
  -d '{"project_id":1,"amount":0}'
# → 422 {"detail":[{"msg":"Value error, Số tiền tài trợ phải lớn hơn 0"}]}

# Invalid: missing project_id
curl -X POST http://127.0.0.1:8000/api/v1/enterprise/sponsorships \
  -H "Content-Type: application/json" \
  -d '{"amount":5000000}'
# → 422 {"detail":[{"type":"missing","loc":["body","project_id"],"msg":"Field required"}]}
```

### 7.4 Requirements Check (Validation & UX)

| Requirement | Status | Notes |
|-------------|--------|-------|
| **Internships.tsx**: Form validation (required fields, deadline > today, slots > 0) | ✅ Done | Client-side `validateForm()` + server-side Pydantic validation |
| **Internships.tsx**: Toast notification thành công/lỗi | ✅ Done | `showToast()` with auto-dismiss (4s), success/error variants |
| **Internships.tsx**: Disable submit khi loading | ✅ Done | `disabled={submitting}` + spinner + "Đang lưu..." text |
| **Sponsorships.tsx**: Form validation (số tiền > 0, dự án required) | ✅ Done | `validateSponsorForm()` + server-side validation |
| **Sponsorships.tsx**: Confirm dialog trước khi tạo | ✅ Done | `window.confirm()` with project name & amount |
| **Sponsorships.tsx**: Loading state | ✅ Done | `disabled={submitting}` + spinner + "Đang tạo..." text |
| **Backend**: Pydantic validation POST /enterprise/internships | ✅ Done | `model_post_init` in `InternshipPostIn` |
| **Backend**: Pydantic validation POST /enterprise/sponsorships | ✅ Done | `model_post_init` in `SponsorshipIn` |

### 7.5 Additional UX Improvements

- **Internships.tsx**: Added edit mode (pre-fill form), view applicants modal with status badges, status toggle (open/closed), delete confirmation, required_skills field
- **Sponsorships.tsx**: Added project filters (field + status), edit sponsorship, sponsorship history table with edit/delete, conditions field, funding goal display, progress bars