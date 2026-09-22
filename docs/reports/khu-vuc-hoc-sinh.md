# Báo cáo — Khu vực Học sinh (Task A, đợt 2 rebuild)

Ngày: 2026-07-12 (đợt 2) | Stack: React 18 + Vite + TS + Tailwind 3 / FastAPI + SQLAlchemy + SQLite
Phạm vi: `talenthub/frontend/src/pages/student/` (7 trang) + `talenthub/backend/app/routers/student.py`
Slide đối chiếu: `docs/slide-ocr/ocr_slide_09..19.txt` (bản OCR; tên file thực tế có tiền tố `ocr_`, không có ảnh `slides/*.png`)

## 1. Rà soát 7 trang so với slide 9–19

| Trang | Slide | Trước | Sau |
|---|---|---|---|
| Dashboard | 10 (KPI điểm/huy hiệu/giờ/xếp hạng) | Đủ 4 KPI + xếp hạng khối từ DB; nhưng delta "+3.2 so với tháng trước" bịa + box "IoT & Drone" cứng | Delta → "Thang điểm 100" / "Khối X · N bạn"; box cứng → link "Xem lộ trình 3 tháng" tới `/student/roadmap` |
| Profile | 11 (thông tin/kỹ năng/chứng chỉ/dự án) + 15 (đánh giá) | Chỉ có thông tin + kỹ năng; thiếu chứng chỉ/dự án/đánh giá chi tiết | Thêm 3 khối: Đánh giá GV/HLV (tiêu chí Chuyên môn 40/Sáng tạo 20/Nhóm 20/Kỷ luật 20 + tổng/xếp loại/nhận xét), Chứng chỉ, Dự án (vai trò Chủ nhiệm/Thành viên) |
| Discover | 12 (Holland/DISC/MBTI/MI) | Nút "Làm bài"/"Xem lại" chết (không onClick; "Xem lại" disabled) | "Xem lại" mở rộng chi tiết kết quả (parse JSON gọn + nhãn "Kết quả demo"); bài chưa làm → "Làm bài demo" (POST, gắn nhãn demo trung thực) |
| Activities | 13 (slot còn lại, lọc lĩnh vực, đăng ký) | Đủ; `register()` không bắt lỗi | Thêm try/catch + hiển thị lỗi |
| Checkin | 14 (QR + lịch sử) | Chỉ form check-in, không có lịch sử | Thêm khối Lịch sử check-in (tự reload sau mỗi lần check-in thành công) |
| Badges | 17 (Explorer 10 / Innovator 50 / Expert 100 / Master 200h) | Ngưỡng đúng; nhưng text "Còn {min_hours}h nữa" sai (hiện tổng thay vì còn lại) | Backend trả thêm `current_hours`; UI hiện "Còn Xh nữa" = min − current |
| Roadmap | 16 (AI + lộ trình 3 tháng) | Tốt; subtitle ghi nhầm "slide 18" | Sửa → "slide 16" |

## 2. Backend — chỉ sửa `app/routers/student.py` (cộng thêm, không đổi contract cũ)

1. `GET /student/evaluations` (mới) — điểm 4 tiêu chí + tổng + xếp loại (XS/Tốt/Khá/Đạt) + nhận xét + tên GV + tên hoạt động (slide 15).
2. `GET /student/checkins` (mới) — lịch sử check-in join hoạt động, 50 bản mới nhất (slide 14).
3. `POST /student/assessments` (mới) — nộp/upsert kết quả test theo `test_type` (validate thuộc holland/disc/mbti/mi, result không rỗng).
4. `POST /student/checkin` (sửa) — thêm param `student_id` (mặc định 1); trước đây fallback query hardcode `student_id == 1` và `registration_id` không kiểm tra chủ sở hữu.
5. `_student_payload` (mở rộng) — thêm `certificates[]` + `projects[]` (owner/member); `/overview` và `/profile` cùng hưởng.
6. `GET /student/badges` (mở rộng) — thêm `current_hours` phục vụ text "còn lại".
7. Không đụng `models.py`, router khác, `App.tsx`, `Layout.tsx`, `ui.tsx`, `api/client.ts`.

## 3. Verify

- `cd talenthub/frontend && pnpm build` → **XANH** (`tsc --noEmit` + `vite build`, 1604 modules, `built in 1.88s`).
- Backend reload (restart uvicorn PID 30023, chạy lại trên 127.0.0.1:8000) + curl `/api/v1/student/*`:
  - `GET /student/evaluations` → 1 bản ghi thật (IoT Lab, GV Nguyễn Văn Hùng, tổng 73.0 Khá, có nhận xét).
  - `GET /student/checkins` → lịch sử thật (`QR-0001-001`, +1h).
  - `GET /student/overview` → keys gồm `school_rank/school_total/certificates/projects/roadmap/ai_analysis`; certs 2, projects 1.
  - `GET /student/badges` → explorer unlocked (11h), innovator 22%, expert 11%, master 6%.
  - `GET /student/profile` → certs 2, projects 1, evals 1.
  - `POST /student/activities/2/register` → `{"ok":true,"status":"registered"}`; `GET /student/activities` → slots_left/registered đúng từng sân chơi.
  - `POST /student/checkin?qr_code=FLOW-TEST` → `+1 giờ`, `hours 3.0`, `chk_total 12.0`.
  - `POST /student/assessments` (mbti demo) → `{"ok":true}`.
- **Seed đã hoàn nguyên sau test**: xóa registration activity 2 vừa tạo, xóa checkin FLOW-TEST + trừ lại 1h, xóa bản ghi mbti demo → `regs s1 = [(1, 2.0)]`, `hours = 11.0`, `checkins = 12`, assessments s1 còn holland + disc. Không chạy lại `python -m app.seed` (không đổi model).

## 4. Điểm còn lệch / chưa làm + lý do + đề xuất

1. **Kết quả test demo gắn nhãn, không phải bài thi thật.** `POST /student/assessments` phục vụ trải nghiệm luồng; MBTI/MI seed chưa có nên nút "Làm bài demo" lưu JSON mẫu có `note: "Kết quả demo tự đánh giá"` và UI gắn nhãn "Kết quả demo". Đề xuất: khi có ngân hàng câu hỏi + chấm điểm chuẩn thì thay bằng flow làm bài thật, giữ nguyên contract endpoint.
2. **Check-in vẫn dùng `student_id` mặc định (demo, chưa có auth).** Đúng ngầm định của dispatch ("student_id mặc định = học sinh đầu tiên"), nhưng cần auth thật trước khi production để chống check-in hộ.
3. **Slide 18 là trang tổng quan trường (không thuộc cổng HS)** — Roadmap Али đúng nội dung slide 16; subtitle cũ ghi "slide 18" đã sửa.
4. **Talent Passport** thuộc trang riêng (`pages/passport/`, ngoài phạm vi Task A) — Profile đã link dữ liệu (chứng chỉ/dự án/đánh giá) làm đầu vào Passport.
5. Tên file slide thực tế là `ocr_slide_*.txt`, không có `slide_09..19.md` hay `slides/*.png` như dispatch mô tả — đối chiếu bằng OCR text.

## 5. Việc cần chốt spec với team

1. Flow làm bài test thật (ngân hàng câu hỏi, chấm điểm, ai được mở đợt) để thay nút demo ở Discover.
2. Auth học sinh (thay `student_id=1` mặc định) trước khi mở check-in/đăng ký production.
3. Công thức xếp hạng khối đã có (`talent_score` trong cùng `grade`) — chốt có hiển thị công khai toàn khối không.
4. Có cần trang Thống kê riêng cổng HS (slide 9 liệt kê "Thống kê") hay Dashboard hiện tại đã đủ.
