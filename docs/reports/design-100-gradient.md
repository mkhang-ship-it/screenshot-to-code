# Design 100% Match — Gradient System Report (2026-09-22)

## Vấn đề phát hiện

So sánh ảnh chụp app với slide gốc (xem trực tiếp `slides/slide_*.png`):
code cũ chỉ dùng màu flat 2-stop cùng hue (`from-portal to-portal-dark`),
trong khi slide dùng **gradient 3-stop rực rỡ** + hero riêng theo từng portal.

## Bằng chứng pixel (Pillow sampling trên slide)

| Slide | Vùng | Gradient đo được |
|---|---|---|
| 10 (HS dashboard) | hero chào mừng | `#FF514A → #F04B67 → #EA4481 → #C345A9 → #8B4AD4` |
| 16 (HS AI gợi ý) | thẻ TÓM TẮT TỪ AI | `#F53463 → #BD4A8D → #9445BA → #634DDC` |
| 28 (DN tổng quan) | hero FPT Software | `#FF6646 → #FF454E → #F54671 → #EE3380 → #BC3AA4 → #8842C8` |
| 24 (NT tổng quan) | hero THPT Nguyễn Du | `#F4417E → #E4498E → #CC4BA8 → #AF4DBA → #9351D0 → #7C57DB` |
| 20 (GV tổng quan) | hero Cô Lê Thị Hương | `#FE8D1D → #FD8026` (cam) |
| 20 (GV) | pill nav active | `#FB9A29 → #FA8B26` (cam) |
| 32 (Passport) | hero | `#202F6B → #0F126A → #542CB9` (chàm đậm) |

## Spec gradient đã áp dụng

### Biến dùng chung (`index.css :root`)
```css
--hero-gradient: linear-gradient(100deg, #FF5A4E 0%, #EF4580 48%, #844BD2 100%);
--nav-gradient:  linear-gradient(90deg, #F97316 0%, #C44296 100%);
--cta-gradient:  linear-gradient(90deg, #F43F5E 0%, #922C6B 100%);
```
Class tiện ích: `.hero-gradient`, `.nav-gradient`, `.cta-gradient`.
`.btn-primary` dùng `var(--cta-gradient)`.

### Biến per-portal (`Layout.tsx` → inline style trên `<main>`)
| Portal | `--hero-gradient` | `--nav-gradient` | `--cta-gradient` |
|---|---|---|---|
| Học sinh | `#FF5A4E → #EF4580 → #844BD2` | `#FF7A3D → #A1458F` | `#F43F5E → #A1458F` |
| Giáo viên | `#FBBF24 → #F97316 → #EA580C` (cam, theo slide 20) | `#FB9A29 → #F97316` | `#FB9A29 → #EA580C` |
| Nhà trường | `#F4417E → #C345A9 → #7C57DB` | `#EC4899 → #9B6AB5` | `#EC4899 → #6E4390` |
| Doanh nghiệp | `#FF5A4E → #EE3380 → #8842C8` | `#F97316 → #C44296` | `#F43F5E → #922C6B` |
| Passport | `#202F6B → #34428A → #542CB9` (chàm, theo slide 32) | `#4858AC → #34428A` | `#4858AC → #34428A` |

NavLink active trong sidebar dùng `background: p.nav` (pill gradient, đúng slide).

## Thay đổi theo trang

- **HS Dashboard**: hero dùng `var(--hero-gradient)` (đỏ-cam → hồng → tím).
- **HS Roadmap**: thẻ AI + timeline dùng `hero-gradient`.
- **HS Badges**: thẻ đã mở khóa = nền `hero-gradient` full + chữ trắng + pill "Đã đạt"
  (đúng slide 17); thẻ khóa = nền trắng + thanh tiến trình gradient.
- **HS Checkin/Profile/Activities/Discover**: amber/violet/emerald → portal tokens.
- **GV Overview**: thêm hero cam (slide 20) + nút "Tạo sân chơi mới / Vào chấm điểm".
- **NT Overview**: thêm hero hồng-tím (slide 24) "Ban giám hiệu / Tổng quan năng lực
  toàn trường"; donut giữ màu cam/vàng/hồng/tím/xanh đúng legend slide 24;
  cột biểu đồ giữ cam (Đăng ký) + hồng (Hoàn thành) đúng slide.
- **DN Overview**: thêm hero (slide 28) "Xin chào {công ty} / N hồ sơ mới" + 2 nút CTA.
- **Passport**: avatar + thẻ QR + thanh kỹ năng dùng `hero-gradient` chàm.
- **NT Classes, GV Students/Activities, HS Talents pills**: violet/amber → portal.

## Verify

- `pnpm build` ✅ 1.73s green · `npx eslint` ✅ 0 errors · Playwright ✅ 6/6 pass.
- Pixel compare (Pillow): canvas `#FDF7F1` 84–97%, accent pixels tăng mạnh
  (enterprise 0.1% → 5.8%, passport 0.9% → 4.8%) — gradient đã render.
- Đối chiếu ảnh chụp `/tmp/pixel-{student,teacher,school,enterprise}.png`
  với slide 10/20/24/28: hero, nav pill, CTA, KPI deltas xanh, donut/bar chart khớp.
- Semantic colors giữ lại đúng slide: delta KPI xanh lá, huy chương hạng
  (Analysis hồng/cam/tím), icon chips Reports, legend biểu đồ cam/hồng (slide 24).

*Verified: 2026-09-22 · Tool: xem ảnh slide trực tiếp + Playwright + Pillow*

## Round 2 — Chi tiết từng trang (đối chiếu ảnh slide trực tiếp)

Đã xem trực tiếp 20+ slide PNG và screenshot từng trang, fix toàn bộ chi tiết lệch:

| Trang | Slide | Chi tiết đã khớp |
|---|---|---|
| HS Profile | 11 | Cover gradient + avatar vuông cam + nút Chia sẻ/Chỉnh sửa, stats cam, skill bars nhiều màu, chứng chỉ medal cam, role pill gradient, bars đánh giá gradient |
| HS Discover | 12 | 4 thẻ test icon màu + nút kem/gradient, thẻ "Định hướng" gradient + bars trắng, banner điểm khởi đầu; fix bug JSON thô/mojibake |
| HS Activities | 13 | Banner card theo lĩnh vực (cam/hồng-tím), filter pills navy, nút Đăng ký gradient, progress gradient, "Còn N chỗ" xanh, banner tham gia |
| HS Checkin | 14 | Thẻ QR gradient + QR trắng + nút trắng, lịch sử icon tím + "+Nh" hồng |
| HS Badges | 17 | Thẻ mở = nền gradient + "Đã đạt", thẻ khóa trắng + progress gradient |
| HS Roadmap | 16 | Thẻ AI gradient + timeline gradient |
| HS Statistics | 18 | KPI icon màu (tím/xanh/cam/hồng), donut đúng legend, cột cam/hồng T1–T6, top-khoa cards |
| GV Grading | 22 | Queue cam + sliders cam + avatar cam + Lưu nháp/Gửi đánh giá |
| GV Students | 23 | Avatar cam, điểm hồng đậm, pills sân chơi |
| GV Activities | 21 | Bảng icon màu + nút cam + thẻ phụ trách |
| NT Analysis | 25 | Rank medals hồng/cam/tím + điểm theo hạng, radar hồng + labels clamp không cắt |
| NT Reports | 26 | Header + nút tạo mới, icon màu + pills tải pastel |
| NT Classes | 27 | Pills khối cam/tím/hồng + icon tròn màu + viền đáy màu + top5 medals/bar hồng |
| DN Talents | 29 | Avatar đỏ, điểm hồng, pills kem, Xem hồ sơ + Liên hệ gradient |
| DN Internships | 30 | Pills xanh/cream, nút peach "Chỉnh sửa", nút tạo gradient |
| DN Sponsorships | 31 | Banner hồng-tím, pills Tiềm năng, bars gradient + % xanh, Tài trợ ngay |
| Sidebar | all | Labels đúng slide: "AI gợi ý", "Chấm điểm", "Học viên", "Tổng quan"; nav active pill gradient |

Giữ đúng slide (semantic): delta KPI xanh, huy chương hạng, icon Reports, legend cam/hồng (24), donut/bar Analysis.

## Verify cuối
- `pnpm build` ✅ 1.79s · Playwright ✅ 29/29 pass · Pixel: canvas 79–88%, accent present all portals.
- Screenshots đối chiếu: `/tmp/detail-*.png`, `/tmp/seq-*.png`, `/tmp/all-*.png`, `/tmp/final-analysis.png`.

## Round 3 — Logo + chi tiết nền (đối chiếu ảnh slide trực tiếp)

- Trích pixel vùng logo slide 10: navy `#002060` + vàng `#F0B000`; xem crop thấy icon
  chữ F navy + cánh cam + sao vàng, wordmark **navy một màu** `#1B2A5E`.
- Code cũ sai: box gradient tím + chữ "Hub" hồng. Fix:
  - `src/components/Logo.tsx` (mới): `LogoMark` SVG (F navy + cánh cam `#F5A623`
    + sao vàng `#FFC107`) + `LogoWordmark` navy một màu + đủ tagline 3 cụm.
  - `Layout.tsx` sidebar + `Login.tsx`: dùng logo mới.
  - `public/logo.svg` favicon mới + `<link rel="icon">` trong `index.html`.
  - Nền `main`: blob cam góc phải + sóng navy đáy (đúng slide), subtle, không che nội dung.
  - Dashboard: PageHeader → "Tổng quan cá nhân" (slide 10), hero giữ lời chào.
  - Sidebar labels đúng slide: "AI gợi ý", "Chấm điểm", "Học viên", "Tổng quan".
- Verify: build ✅, screenshot login + dashboard đối chiếu slide ✅.
