# Đợt 2 — Dispatch Task cho agents (Rebuild FTalentHub mới: React + FastAPI + SQLite)

## Bối cảnh
Workspace `/Users/khangnguyenminh/Desktop/FTalentHub ` (có space cuối tên — luôn quote path).
Dự án mới `talenthub/` được xây LẠI từ đầu (bỏ PHP/MySQL cũ) theo 35 slide (OCR: `docs/slide-ocr/`).

### Stack
- Backend: `talenthub/backend/` — FastAPI + SQLAlchemy 2 + SQLite (`talenthub.db`). Đang chạy tại `http://127.0.0.1:8000`, docs tại `/docs`.
- Frontend: `talenthub/frontend/` — React 18 + Vite + TS + Tailwind 3 + react-router-dom. Đang chạy tại `http://localhost:5173` (proxy `/api` → 127.0.0.1:8000).

### Trạng thái khung (bộ não đã làm — KHÔNG cần làm lại)
- Backend: models 25 bảng (`app/models.py`), seed đầy đủ (`python -m app.seed` — 12 HS, 4 GV, 7 sân chơi...), 5 routers (`app/routers/{student,teacher,school,enterprise,passport}.py`). **18/18 endpoints smoke 200 OK**.
- Frontend: `src/App.tsx` (router hoàn chỉnh), `src/components/Layout.tsx` (sidebar 4 cổng), `src/api/client.ts`, `src/components/ui.tsx` (Card/StatCard/PageHeader/Loading/ErrorBox). Toàn bộ pages đã có bản functional sơ bộ, **`pnpm build` xanh**.

### Quy tắc tránh conflict (bắt buộc)
- **CHỈ sửa file trong thư mục portal của mình** (liệt kê dưới) + `docs/reports/` để ghi báo cáo.
- **KHÔNG đụng** `src/App.tsx`, `src/components/Layout.tsx`, `src/components/ui.tsx`, `src/api/client.ts`, `src/pages/passport/`, và thư mục portal của agent khác.
- Nếu cần endpoint mới → thêm vào ĐÚNG file router của portal mình trong `backend/app/routers/<portal>.py` (không sửa router khác, không sửa `models.py` nếu không bắt buộc — seed lại bằng `.venv/bin/python -m app.seed` nếu đổi model).

### Trước khi làm
```bash
cd "/Users/khangnguyenminh/Desktop/FTalentHub /talenthub/backend" && . .venv/bin/activate && python -m app.seed
# backend đang chạy sẵn ở 127.0.0.1:8000 — nếu restart: .venv/bin/uvicorn app.main:app --port 8000 --host 127.0.0.1
# frontend dev: cd "/Users/khangnguyenminh/Desktop/FTalentHub /talenthub/frontend" && pnpm dev
```
Verify (tùy cổng): `curl -s http://127.0.0.1:8000/api/v1/<đường dẫn portal>`.

### Nghiệm thu
- `cd "/Users/khangnguyenminh/Desktop/FTalentHub /talenthub/frontend" && pnpm build` phải xanh (TypeScript không lỗi).
- Endpoint portal của mình trả dữ liệu thực.

## Task A — HỌC SINH (`term_32c4ca50`)
- Sửa: mọi file trong `talenthub/frontend/src/pages/student/` (7 trang: Dashboard, Profile, Discover, Activities, Checkin, Badges, Roadmap).
- Backend: `talenthub/backend/app/routers/student.py`.
- Slide: 9–19 (xem `docs/slide-ocr/slide_09..19.md` + ảnh `slides/slide_09..19.png`).
- Việc cần làm:
  1. Rà soát 7 trang so với slide: đủ tiêu đề, KPI, luồng thao tác (đăng ký sân chơi, check-in QR, xem huy hiệu, lộ trình AI).
  2. Tinh chỉnh UI cho khớp nội dung slide (bố cục card, bảng, màu theo ngữ nghĩa).
  3. Bổ sung/thêm endpoint cần thiết trong `student.py` nếu trang cần (giữ ngầm định `student_id` mặc định = học sinh đầu tiên của seed).
  4. Ghi báo cáo: `docs/reports/khu-vuc-hoc-sinh.md` (ghi rõ ngày, những gì làm/tinh chỉnh, kết quả build, endpoint verify).

## Task BC — NHÀ TRƯỜNG (`term_242ae708`)
- Sửa: mọi file trong `talenthub/frontend/src/pages/school/` (4 trang: Overview, Analysis, Reports, Classes).
- Backend: `talenthub/backend/app/routers/school.py`.
- Slide: 24–27 (`docs/slide-ocr/slide_24..27.md` + `slides/slide_24..27.png`).
- Việc cần làm:
  1. Rà soát 4 trang so với slide: KPI trường, bản đồ năng khiếu + xếp hạng khối + top HS, báo cáo (xuất CSV/JSON — đã có XLSX/PDF round-1 bằng PHP, nay chuyển sang CSV/JSON trước, nếu muốn PDF thì note trong báo cáo), tổng quan lớp/khối.
  2. Tinh chỉnh UI khớp slide 24–27.
  3. Bổ sung endpoint cần thiết trong `school.py` nếu thiếu.
  4. Ghi báo cáo: `docs/reports/khu-vuc-nha-truong.md`.

## Task D — DOANH NGHIỆP (`term_7fa3d4bc`)
- Sửa: mọi file trong `talenthub/frontend/src/pages/enterprise/` (4 trang: Overview, Talents, Internships, Sponsorships).
- Backend: `talenthub/backend/app/routers/enterprise.py`.
- Slide: 28–31 (`docs/slide-ocr/slide_28..31.md` + `slides/slide_28..31.png`).
- Việc cần làm:
  1. Rà soát 4 trang so với slide: tổng quan DN (hồ sơ phù hợp, tin tuyển, ứng viên, tài trợ), tìm nhân tài (filter tên/lớp/khối/điểm), tuyển thực tập (đăng tin + danh sách), tài trợ dự án (danh sách + tạo mới).
  2. Tinh chỉnh UI khớp slide 28–31.
  3. Bổ sung endpoint cần thiết trong `enterprise.py` nếu thiếu (vd: danh sách dự án học sinh để tài trợ — hiện Sponsorships page đang hardcode 3 dự án, nếu có thể thêm `GET /enterprise/projects` từ bảng Project thì tốt).
  4. Ghi báo cáo: `docs/reports/khu-vuc-doanh-nghiep.md`.

## Do bộ não (GIÁO VIÊN) tự làm — không dispatch
- Teacher portal (`src/pages/teacher/` 4 trang) + Passport (`src/pages/passport/Passport.tsx`) + `teacher.py`/`passport.py` — đã scaffold xong.

## Sau khi cả 3 agent xong
- Bộ não sẽ verify build + chạy toàn bộ smoke endpoints, tổng hợp vào `docs/PLAN.md`.