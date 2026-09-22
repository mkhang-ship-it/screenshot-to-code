# Báo cáo khu vực NHÀ TRƯỜNG — Task BC Part 2 (Reports & Classes)

Ngày: đợt 2 rebuild. Stack: `talenthub/frontend` (React 18 + Vite + TS + Tailwind 3) + `talenthub/backend` (FastAPI + SQLAlchemy + SQLite). Slide đối chiếu: 26–27 (OCR `docs/slide-ocr/ocr_slide_26..27.txt`).

## 1. Danh mục rà soát

- Slide 26 — Báo cáo: xuất CSV/JSON — Danh sách HS, hoạt động, điểm đánh giá, huy hiệu
- Slide 27 — Tổng quan lớp/khối: sĩ số, GV chủ nhiệm, tổng giờ trải nghiệm, tỷ lệ hoàn thành hoạt động

## 2. File đã sửa

### Backend (`talenthub/backend/app/routers/school.py`)
- **`GET /school/reports`**: Hỗ trợ 4 loại báo cáo qua query param:
  - `type=students` — Danh sách HS (id, tên, lớp, khối, điểm năng lực, giờ trải nghiệm)
  - `type=activities` — Hoạt động (đăng ký, vai trò, trạng thái, giờ, tên hoạt động, lĩnh vực)
  - `type=evaluations` — Điểm đánh giá (chuyên môn, sáng tạo, làm việc nhóm, kỷ luật, tổng, nhận xét)
  - `type=badges` — Huy hiệu (mã, tên, điều kiện giờ, thời gian nhận)
  - `format=json|csv` — Xuất JSON hoặc CSV (UTF-8 BOM, Excel đọc được)
- **`GET /school/classes`**: Thêm `completion_rate` (tỷ lệ hoàn thành hoạt động = % đăng ký có giờ > 0)

### Frontend (`talenthub/frontend/src/pages/school/`)
- **`Reports.tsx`**: Giao diện 4 tab báo cáo, preview bảng dữ liệu (có phân trang 20/50/100/500/1000 dòng), nút tải JSON/CSV, tên file tự động có timestamp
- **`Classes.tsx`**: Thêm hiển thị "Tỷ lệ hoàn thành hoạt động" (% + progress bar) cho mỗi lớp, cập nhật subtitle

Không đụng: student/, enterprise/, teacher/, passport/, App.tsx, Layout.tsx, ui.tsx, api/client.ts, models.py (trừ import).

## 3. Kết quả verify

### Backend endpoints (tất cả 200 OK):
- `GET /school/reports?type=students&format=json` → 40 HS
- `GET /school/reports?type=activities&format=json` → 42 đăng ký
- `GET /school/reports?type=evaluations&format=json` → 40 đánh giá
- `GET /school/reports?type=badges&format=json` → 53 huy hiệu
- `GET /school/reports?type=students&format=csv` → CSV UTF-8 BOM chuẩn
- `GET /school/classes` → 6 lớp, 3 khối, có `completion_rate` (0-71%)

### Frontend build:
- `pnpm build` → **XANH** (tsc --noEmit + vite build, ~1.4s)

## 4. Điểm còn lệch slide + lý do + đề xuất

- Slide 26 có PDF/Excel — hiện chỉ CSV/JSON. Đề xuất thêm Excel (xlsx) nếu cần.
- Slide 27 có "Phân tích năng khiếu khối 10/11/12" với biểu đồ — hiện chỉ có bảng thống kê. Đề xuất thêm chart (đã có slide 25 /school/analysis).
- Completion rate hiện chỉ tính theo `hours > 0` trong `activity_registrations` — có thể refine theo status "completed" nếu có enum.

## 5. Việc cần chốt spec với team

- Có cần xuất Excel (.xlsx) bên cạnh CSV/JSON không?
- Completion rate định nghĩa: `hours > 0` hay `status == 'completed'`?
- Có cần filter theo ngày/khoa học cho báo cáo không?