# Báo cáo — Cổng Nhà trường (Task BC, đợt 2 rebuild)

Ngày: 2026-09-22. Stack mới: React 18 + Vite + TS + Tailwind 3 / FastAPI + SQLite
(không còn PHP/MySQL — báo cáo round-1 PHP xem lịch sử git, đã superseded).

Slide đối chiếu: `docs/slide-ocr/ocr_slide_24..27.txt` + `slides/slide_24..27.png`.

## 1. File đã sửa

- `talenthub/backend/app/routers/school.py` (duy nhất file backend được đụng):
  - `/overview`: bỏ trend hardcode (+12%/+18%/...) → delta thật tháng-này-vs-tháng-trước từ `registered_at`; thêm `monthly` (6 tháng: đăng ký vs hoàn thành); `activities_per_month` = hoạt động có `start_date` trong tháng hiện tại.
  - `/talent-analysis`: `skill_map` tính thật từ `StudentSkill.level` (×10 → /100, thay heuristic copy talent_score); `grade_ranking` thêm `hours` (tổng giờ/khối).
  - `/classes`: thêm `homeroom` thật từ `ClassGroup.homeroom_teacher_id` → Teacher → User; thêm `top_classes` (top 5 theo điểm TB).

- `talenthub/frontend/src/pages/school/Overview.tsx`: KPI đúng nhãn slide 24 (Học sinh hoạt động / Hoạt động/tháng / Tỷ lệ tham gia / Tỷ lệ hoàn thành); donut conic-gradient Phân bố năng khiếu + %; bars 6 tháng Đăng ký (cam) vs Hoàn thành (hồng).

- `.../school/Analysis.tsx`: radar SVG từ điểm skill thật (`StudentSkill.level`); xếp hạng khối có giờ hoạt động + link `Xem chi tiết bảng xếp hạng →` tới `/school/classes`; top HS giữ link `Xem passport → /passport/{id}`.

- `.../school/Reports.tsx`: cards theo slide 26 (Toàn trường / Khối 10-11-12 / Top 10), mỗi card Tải CSV (BOM UTF-8, Excel đọc được) + JSON, kèm số HS + ngày.

- `.../school/Classes.tsx`: cards tổng quan Khối (Lớp/Học sinh/Điểm TB) + bảng `TOP 5 LỚP XUẤT SẮC` (Lớp, GVCN thật từ `ClassGroup`, Điểm TB + bar) + cards lớp có GVCN.

Không đụng: App.tsx, Layout.tsx, ui.tsx, api/client.ts, cổng khác, models.py.

## 2. Verify

- `cd talenthub/frontend && pnpm build` → XANH (`tsc --noEmit` + vite, 1604 modules, 1.60s).
- curl (200 OK): `/api/v1/school/overview` (40 HS, 6 monthly T4-T9, real deltas), `/api/v1/school/talent-analysis` (skill 65.0 thật; khối 10: 75.5/551h, 11: 75.2/565h, 12: 73.2/450h), `/api/v1/school/reports` (40 HS), `/api/v1/school/classes` (homeroom thật, top_classes).
- Auth flow: login → me → logout → re-me → wrong password đều đúng.
- Backend restart (uvicorn không `--reload`) để nhận router mới.

## 3. Điểm lệch slide + lý do

1. Quy mô demo (40 HS) vs mong muốn 2.148 HS — portal hiển thị dữ liệu thực tế từ seed hiện tại.
2. Grade ranking có `hours` (tổng giờ hoạt động) thay vì chỉ điểm — đúng slide 25 nhưng phụ thuộc seed có ClassGroup.
3. Trend tháng: seed dồn 1 tháng nên tháng cũ = 0 → hiện "mới trong tháng" (trung thực hơn số hardcode cũ). Muốn % đẹp cần seed rải nhiều tháng.
4. Reports chỉ CSV/JSON (đúng dispatch đợt 2); PDF/XLSX đã làm ở round-1 PHP, note lại nếu team muốn port sang backend mới.
5. Slide có thêm mục Giáo viên / Hoạt động & Sân chơi / Cài đặt trong sidebar — ngoài 4 trang Task BC (thuộc Layout chung, không đụng theo quy tắc).

## 4. Việc cần chốt spec với team

- Định nghĩa trend khi thiếu lịch sử (hiện tại "mới trong tháng" OK?).
- Có port export PDF/XLSX server-side sang FastAPI không, hay CSV/JSON đủ?
- Sidebar school có cần thêm Giáo viên/Hoạt động/Cài đặt (task owner là ai)?