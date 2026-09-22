# Báo cáo — Khu vực GIÁO VIÊN (bộ não làm trực tiếp)

Ngày: 2026-09-22 · Người làm: BỘ NÃO (session này) · Nguồn spec: slide 20-23 (`docs/slide-ocr/`)

## 1. Danh mục rà soát (đối chiếu slide 20-23)

| Màn hình slide | Trạng thái code `app/teacher/` | Kết luận |
|---|---|---|
| Slide 20: Tổng quan (Học viên, Sân chơi, Bài chờ chấm, Đánh giá HV) | `index.php` + `includes/kpi-cards.php` + `dashboard-data.php` | ✅ Khớp — 4 KPI đúng nhãn, có fallback rỗng an toàn |
| Slide 21: Sân chơi của tôi (tạo/CRUD, lĩnh vực, thời gian, SL tham gia, thao tác) | `activities/index.php` | ✅ Khớp — bảng cột: Hoạt động(+category=lĩnh vực), Thời gian, Địa điểm, Đăng ký/sức chứa, Trạng thái, Thao tác; lifecycle 7 trạng thái (draft→archived) |
| Slide 22: Chấm điểm theo tiêu chí (Chuyên môn 40, Sáng tạo 20, Làm việc nhóm 20, Kỷ luật 20) | `grading.php` + `assessments/` | ✅ Khớp — `criteriaWeights` 40/20/20/20, slider 0-100, nhận xét, hàng chờ chấm theo lớp |
| Slide 23: Học viên của tôi (tìm theo tên/lớp; cột: học viên, lớp, điểm năng lực, giờ trải nghiệm, huy hiệu, năng khiếu) | `students/index.php` | ✅ Khớp — bảng đủ 6 cột + search tên/lớp + thẻ năng khiếu |

## 2. File đã sửa (bug duplicate `<title>` / `<meta description>`: 2 bản TalentHub + FTalentHub → giữ 1 bản FTalentHub)

- `app/teacher/index.php` — bỏ `<title>…| TalentHub</title>` + meta trùng (dòng 105-108 cũ)
- `app/teacher/notifications.php` — tương tự
- `app/teacher/grading.php` — gộp 2 title → `Chấm điểm theo Lớp - {class} | FTalentHub`
- `app/teacher/profile.php` — bỏ title `| TalentHub Teacher` trùng
- `app/teacher/checkins/index.php` — bỏ meta+title TalentHub trùng

## 3. Kết quả verify

```
php -l app/teacher/index.php            → No syntax errors
php -l app/teacher/notifications.php    → No syntax errors
php -l app/teacher/grading.php          → No syntax errors
php -l app/teacher/profile.php          → No syntax errors
php -l app/teacher/checkins/index.php   → No syntax errors
```
Quét lại toàn bộ `app/teacher/`: không còn file nào có >1 `<title>`.

Verification về dữ liệu: MySQL `talenthub` chạy; bảng `assessment_criteria` có đủ `chuyen_mon`/`sang_tao`/`ky_luat`/`lam_viec_nhom` (0-100, khớp rubric slide 22). Lưu ý: vẫn còn 3 criteria cũ scale 0-10 (`teamwork`, `initiative`, `execution`) đang `status='active'` — nếu đọc criteria chung sẽ lẫn vào danh sách chấm điểm; **cần chốt**: seed chỉ kích hoạt 4 criteria mới (40/20/20/20) hoặc đổi số.

## 4. Điểm còn lệch slide + đề xuất

1. **Criteria cũ 0-10 vẫn active** trong DB (teamwork/initiative/execution) — nếu UI đọc mọi criteria active sẽ hiển thị 7 thay vì 4. Đề xuất: cập nhật seed/closure bật/đóng đúng 4 criteria 40/20/20/20 (impact thấp, cần chốt với team vì chạm dữ liệu).
2. Slide 21 có cột "Lĩnh vực" riêng — code hiện hiển thị `category_label` thành chip dưới tên hoạt động (tương đương, không cần đổi UI).

## 5. Cần chốt spec với team
- Xác nhận bộ tiêu chí chấm điểm chính thức (4 tiêu chí 40/20/20/20) và vô hiệu hoá bộ cũ 0-10.
- (Chung) Nhất quán nhãn thương hiệu: đã gom về "FTalentHub" tại teacher portal.