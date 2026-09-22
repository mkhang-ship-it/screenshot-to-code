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