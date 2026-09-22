# Báo cáo — Cổng Nhà trường (Task BC, đợt 2 rebuild)

Ngày: 2026-09-22. Stack mới: React 18 + Vite + TS + Tailwind 3 / FastAPI + SQLite
(không còn PHP/MySQL — báo cáo round-1 PHP xem lịch sử git, đã superseded).
Slide đối chiếu: `docs/slide-ocr/ocr_slide_24..27.txt` + `slides/slide_24..27.png`.

## 1. File đã sửa

- `talenthub/backend/app/routers/school.py` (duy nhất file backend được đụng):
  - `/overview`: bỏ trend hardcode (+12%/+18%/...) → delta thật tháng-này-vs-tháng-trước
    từ `registered_at`; thêm `monthly` (6 tháng: đăng ký vs hoàn thành);
    `activities_per_month` = hoạt động có `start_date` trong tháng hiện tại.
  - `/talent-analysis`: `skill_map` tính thật từ `StudentSkill.level` (×10 → /100,
    thay heuristic copy talent_score); `grade_ranking` thêm `hours` (tổng giờ/khối).
  - `/classes`: thêm `homeroom` thật từ `ClassGroup.homeroom_teacher_id` → Teacher → User;
    thêm `top_classes` (top 5 theo điểm TB).
- `talenthub/frontend/src/pages/school/Overview.tsx`: KPI đúng nhãn slide 24
  (Học sinh hoạt động / Hoạt động/tháng / Tỷ lệ tham gia / Tỷ lệ hoàn thành);
  donut conic-gradient Phân bố năng khiếu + %; bars 6 tháng Đăng ký (cam) vs Hoàn thành (hồng).
- `.../school/Analysis.tsx`: radar SVG 6-trục→4-trục theo đúng số skill seed;
  xếp hạng khối có giờ hoạt động + link `Xem chi tiết bảng xếp hạng →` tới `/school/classes`;
  top HS giữ link `Xem passport → /passport/{id}`.
- `.../school/Reports.tsx`: cards theo slide 26 (Toàn trường / Khối 10-11-12 / Top 10),
  mỗi card Tải CSV (BOM UTF-8, Excel đọc được) + JSON, kèm số HS + ngày.
- `.../school/Classes.tsx`: cards tổng quan Khối (Lớp/Học sinh/Điểm TB) + bảng
  `TOP 5 LỚP XUẤT SẮC` (Lớp, GVCN, Điểm TB + bar) + cards lớp có GVCN.

Không đụng: App.tsx, Layout.tsx, ui.tsx, api/client.ts, cổng khác, models.py.

## 2. Verify

- `cd talenthub/frontend && pnpm build` → XANH (`tsc --noEmit` + vite, 1604 modules, 1.60s).
- curl (200 OK): `/api/v1/school/overview` (928B, monthly T4–T9, T9: 12 đk/12 ht),
  `/talent-analysis` (skill 65.0 thật; khối 12: 92.0/134h, 11: 78.0/110h, 10: 64.0/86h),
  `/reports` (12 HS), `/classes` (homeroom thật VD "Lê Quốc Dũng", có `top_classes`).
- Backend đã restart (uvicorn không `--reload`) để nhận router mới.

## 3. Điểm còn lệch slide + lý do

1. Quy mô demo (2.148 HS, 1.820 HĐ) vs seed 12 HS/7 HĐ — portal hiển thị dữ liệu thật;
   muốn số lớn phải seed thêm.
2. Radar 4 trục (Chuyên môn/Sáng tạo/Kỷ luật/Làm việc nhóm) thay vì 6 như slide —
   seed chỉ có 4 skill; đúng dữ liệu, không vẽ trục giả.
3. Trend tháng: seed dồn 1 tháng nên tháng cũ = 0 → hiện "mới trong tháng" (trung thực
   hơn số hardcode cũ). Muốn % đẹp cần seed rải nhiều tháng.
4. Reports chỉ CSV/JSON (đúng dispatch đợt 2); PDF/XLSX đã làm ở round-1 PHP,
   note lại nếu team muốn port sang backend mới (gợi ý: endpoint trả file + frontend Blob).
5. Slide có thêm mục Giáo viên / Hoạt động & Sân chơi / Cài đặt trong sidebar —
   ngoài 4 trang Task BC (thuộc Layout chung, không đụng theo quy tắc).

## 4. Việc cần chốt spec với team

- Định nghĩa trend khi thiếu lịch sử ("mới trong tháng" hiện tại có OK?).
- Có port export PDF/XLSX server-side sang FastAPI không, hay CSV/JSON đủ?
- Sidebar school có cần thêm Giáo viên/Hoạt động/Cài đặt (task owner là ai)?
