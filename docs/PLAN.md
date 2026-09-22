# FTalentHub — Plan phát triển theo Slide (35 slide, 2026-09-22)

Nguồn: Google Slides `1dG55klst0MDvzfkmmTfUswAjzmOvggG6` (OCR 35 slide — `docs/slide-ocr/`).
Bối cảnh: codebase PHP 8.3 + MySQL đã có tại `talenthub/` (copy từ `RMain/TalentHub`).
Hướng đã chốt với user: **phát triển tiếp trên codebase có sẵn**, ưu tiên **4 cổng theo đúng slide**.

## 1. Slide nói gì (tóm tắt)

FTalentHub = "Hub tài năng đa lĩnh vực" — hệ sinh thái phát hiện/phát triển/kết nối năng lực
học sinh từ sớm. Slogan: **Khám phá năng khiếu – Bứt phá tương lai**
(`Discover Talent · Develop Skills · Create Future`). Team FPI Cần Thơ.

5 nỗi khó của học sinh: (1) không biết điểm mạnh, (2) thiếu trải nghiệm thực tế,
(3) không có hồ sơ năng lực, (4) không biết hợp ngành nghề gì, (5) nhà trường khó đánh giá toàn diện.

Quy trình tổng thể: **Khảo sát năng lực & sở thích → Ghép nhóm tham gia sân chơi →
Tham gia/đánh giá năng lực → Cấp chứng nhận → Kết nối doanh nghiệp.**

Lĩnh vực: Nghệ thuật, Thể thao, Kinh doanh, Kỹ thuật, Học thuật, Sáng tạo.
AI: phân tích bài test → xác định điểm mạnh → gợi ý nhóm/hoạt động/lộ trình →
đánh giá & phản hồi → theo dõi phát triển (Talent Passport).

## 2. 8 khu vực theo slide (đối chiếu code có sẵn)

| Khu vực | Slide | Trạng thái code `talenthub/` | Việc cần làm |
|---|---|---|---|
| HỌC SINH: tổng quan, hồ sơ năng lực, khám phá năng khiếu (Holland/DISC/MBTI/MI), đăng ký hoạt động, check-in QR, đánh giá, AI gợi ý, huy hiệu (Explorer/Innovator/Expert/Master), thống kê | 9–16, 19 | `app/learner/*` + `app/student/*` có sẵn | ✅ xong (agent A): thêm KPI Xếp hạng + nav Talent Passport, bỏ duplicate title/meta 7 file |
| GIÁO VIÊN: tổng quan, sân chơi của tôi (CRUD), chấm điểm rubric (Chuyên môn 40/Sáng tạo 20/Làm việc nhóm 20…), học viên của tôi | 20–23 | `app/teacher/*` có sẵn (rubric-form) | ✅ xong (bộ não): bỏ duplicate title/meta 5 file; rubric 40/20/20/20 đúng slide |
| NHÀ TRƯỜNG: tổng quan KPI, phân tích năng lực (bản đồ năng khiếu, xếp hạng khối), báo cáo PDF/Excel, lớp & khối | 24–27 | `app/school/*` có sẵn; reports hiện chỉ CSV (gap) | ✅ xong (agent BC): KPI theo slide 24 + trend, xếp hạng khối + top HS, **export XLSX + PDF thuần PHP** |
| DOANH NGHIỆP: tổng quan, tìm nhân tài (filter), tuyển thực tập, tài trợ dự án | 28–31 | `app/enterprise/*` có sẵn | ✅ xong (agent D): KPI nhãn slide 28, enrich giờ trải nghiệm thẻ ứng viên |
| Talent Passport: QR định danh, hồ sơ, chứng chỉ, dự án, hoạt động, kỹ năng, CV số | 19, 32–35 | `app/learner/talent-passport*.php` có | ✅ xong (agent D): QR mã TP-XXXX, CV A4 đã chạy |

## 3. Chẻ task (1 agent = 1 khu vực)

- **Agent A — Khu vực HỌC SINH** (`app/learner/`, `app/student/`): đối chiếu slide 9–16, 19. ✅ xong — báo cáo tại `docs/reports/khu-vuc-hoc-sinh.md`.
- **BỘ NÃO — Khu vực GIÁO VIÊN** (`app/teacher/`): đối chiếu slide 20–23. ✅ xong — `docs/reports/khu-vuc-giao-vien.md`. (Lưu ý: 2 pane Orca B/C là mirror của CÙNG 1 session — thực tế chỉ 3 agents + bộ não.)
- **Agent BC — Khu vực NHÀ TRƯỜNG** (`app/school/`): đối chiếu slide 24–27 + export PDF/Excel. ✅ xong — `docs/reports/khu-vuc-nha-truong.md`.
- **Agent D — Khu vực DOANH NGHIỆP + Talent Passport** (`app/enterprise/`, `app/learner/talent-passport*`): đối chiếu slide 28–31, 19. ✅ xong — `docs/reports/khu-vuc-doanh-nghiep.md`.
- **BỘ NÃO (session này)**: viết plan, dispatch, verify chéo, báo cáo gộp. ✅

## 4. Quy tắc bắt buộc cho mọi agent

- Code tại `/Users/khangnguyenminh/Desktop/FTalentHub /talenthub` (note: tên folder có space/sau "FTalentHub" — luôn quote path).
- Chỉ sửa file của khu vực mình; KHÔNG đụng file agent khác.
- Verify trước khi báo cáo: `php -l` file đã sửa; chạy thử seed → gọi trang → cleanup nếu có.
- Báo cáo: danh sách file sửa (diff stat), kết quả verify, việc còn thiếu.
- Frontend: giữ nguyên style Tailwind hiện có; UI khớp màn hình slide (8 khu vực trên).

## 5. Kết quả đợt 1 (2026-09-22) — đã verify

- 19/19 file sửa qua `php -l` OK; smoke test server: `index.php`/`login.php`/`api_ai_suggest.php` → 200, 4 portal → 302 (redirect login, không runtime error).
- `talenthub/` đã tách thành git repo riêng (baseline `e38b4fa`) để diff từ nay.
- Báo cáo chi tiết 4 khu vực: `docs/reports/*.md`.

## 6. Mở rộng (task kế — cần chốt spec trước)

1. **Xếp hạng peer** slide 10: định nghĩa phạm vi (lớp/trường/khối), công thức, tần suất — hiện là proxy xếp loại từ điểm.
2. **Huy hiệu Master**: mở từ 100h hay đủ 200h — hiện `LevelProgression` mở Master từ 100h (target 200h).
3. **Criteria chấm điểm**: seed đang có 3 criteria cũ scale 0-10 vẫn active lẫn lộn — chốt chỉ bật 4 criteria 40/20/20/20.
4. **Tìm nhân tài backend**: `learner_evaluations` rỗng → chỉ trả 1/4 hồ sơ seeded; cần fallback legacy `student_skills` hoặc bổ sung seed evaluations + `project_members`.
5. **Filter Khối chết** trong `assets/js/talent-search.js` (ngoài scope app) — chuyển filter lên backend hoặc cho phép sửa JS.
6. **Báo cáo PDF**: hiện text-only (không composer) — XLSX/CSV đủ UTF-8; nếu cần PDF đẹp thêm dependency.
7. **GVCN + điểm TB lớp/khối**: seed chưa phân công GVCN (`teacher_class_assignments`), `talentScore` NULL — seed bổ sung để có số.
8. **`app/student/` vs `app/learner/`**: gộp route hay giữ shim.

---

## 7. Đợt 2 (2026-09-22) — REBUILD từ đầu: React + FastAPI + SQLite ✅

> Quyết định user: **bỏ PHP/MySQL**, xây lại từ đầu theo 4 cổng slide. Hướng UI: **dùng chính opencode
> (4 pane có vision) đọc slide + OCR tự viết React** — không dùng screenshot-to-code/Gemini/Claude ngoài.
> Stack mới: React 18 + Vite + TS + Tailwind 3 (frontend) · FastAPI + SQLAlchemy 2 + SQLite (backend).

### Cấu trúc mới
```
talenthub/
├── backend/            # FastAPI + SQLite (talenthub.db)
│   └── app/            # models.py (26 bảng: +auth_tokens), database.py, config.py, schemas.py,
│                       # main.py (mount 6 routers: +auth), seed.py, routers/{auth,student,teacher,school,enterprise,passport}.py
└── frontend/           # React 18 + Vite + TS + Tailwind 3
    └── src/            # App.tsx (22 route: +/login), auth/AuthContext.tsx, components/{Layout,ui}.tsx,
                        # api/client.ts (Bearer token), pages/{login + student(7),teacher(4),school(4),enterprise(4),passport(1)}
```

### Trạng thái — KHUNG (bộ não) + 4 CỔNG (3 agent + bộ não) ✅ mega-xanh
- **Khung**: backend 21 endpoint chạy `127.0.0.1:8000` (seed: 12 HS, 4 GV, 7 sân chơi, 4 huy hiệu, 12 passport, 2 tin TT, 2 tài trợ); frontend dev `localhost:5173`; `pnpm build` XANH.
- **HỌC SINH** (agent A, 7 trang + `student.py` mở rộng): +`GET /student/evaluations`, +`GET /student/checkins`, +`POST /student/assessments`, sửa `checkin` (params student_id); Profile đủ đánh giá/chứng chỉ/dự án; Badge hiện "còn Xh nữa" (current_hours); Discover nút demo thật. Chi tiết: `docs/reports/khu-vuc-hoc-sinh.md`.
- **NHÀ TRƯỜNG** (agent BC, 4 trang + `school.py`): trend/delta thật theo tháng + `monthly` 6 tháng; `skill_map` tính thật từ `StudentSkill`; `classes` + homeroom thật + `top_classes`; Reports export CSV/JSON theo khối; Analysis radar 4 trục + top HS. Chi tiết: `docs/reports/khu-vuc-nha-truong.md`.
- **DOANH NGHIỆP** (agent D, 4 trang + `enterprise.py`): +`GET /enterprise/projects` (owner/members/sponsored, filter field); Talents + filter Lĩnh vực + debounce; Sponsorships dùng dữ liệu thật; Overview + Nhân tài nổi bật. Chi tiết: `docs/reports/khu-vuc-doanh-nghiep.md`.
- **GIÁO VIÊN + Passport** (bộ não): 4 trang teacher + passport verify OK (rubric 40/20/20/20 auto-update talent_score, QR định danh).

### Verify độc lập (bộ não, 71-2 08:4x)
- `pnpm build` XANH (1604 modules).
- 21/21 endpoints HTTP 200: kể cả mới (`student/evaluations`, `student/checkins`, `student/badges`+current_hours, `school/overview`+monthly, `school/classes`+top_classes+homeroom, `enterprise/projects`, `enterprise/talents?field=ky_thuat`).

### Dispatch & tránh conflict
- Spec: `docs/dispatch-0712-round2.md`. Mỗi agent CHỈ sửa file portal mình (không đụng App.tsx/Layout/ui/api/client/models).
- Lưu ý: thực tế có **3 agent pane** (A=HS, BC=NT mirror, D=DN) + **bộ não = GIÁO VIÊN** — đủ 4 cổng, không lỗ hụt (xem giải thích cuối session).

### Việc kế (chốt spec trước)
1. ~~Auth thật~~ → ✅ ĐÃ XONG đợt 3 (xem section 8).
2. Flow test năng khiếu thật (ngân hàng câu hỏi) thay nút "demo" ở Discover.
3. Port PDF/XLSX export sang FastAPI (đang CSV/JSON; round-1 PHP đã có XLSX/PDF).
4. `funding_goal` cho Project (vẽ progress % slide 31) + KPI "tỷ lệ phỏng vấn đạt" — đụng models.py + reseed.
5. ~~Seed rải nhiều tháng~~ → ✅ ĐÃ XONG đợt 3 (40 HS, 6 tháng T4→T9).

---

## 8. Đợt 3 (2026-09-22) — AUTH + SEED DEMO ĐẸP ✅ (bộ não tự làm)

> User chốt: "Auth + seed demo đẹp (Recommended)". Không dispatch agent (đụng file khung cấm agent).

### Auth (backend)
- `models.py`: +bảng `auth_tokens` (token 48-hex ngẫu nhiên, FK users).
- `routers/auth.py` mới: `POST /auth/login` (sha256 `fth_{pass}`), `GET /auth/me`, `POST /auth/logout` (xóa token).
- `schemas.py`: `LoginIn/LoginOut` (đã có sẵn) + `UserOut` mở rộng `profile_id`/`detail` (class_name/grade/subject).
- `seed.py`: password **demo123** cho mọi tài khoản — **hs01@ftalenthub.edu.vn** (HS) · **nguyen.van.hung@ftalenthub.edu.vn** (GV) · **bgh@ftalenthub.edu.vn** (Trường) · **hr@techfpt.vn** (DN).

### Auth (frontend)
- `api/client.ts`: `getToken/setToken` + tự gắn `Authorization: Bearer` vào mọi request; `/auth/me` phục hồi phiên khi reload.
- `auth/AuthContext.tsx` mới: `useAuth()` (user/login/logout/initializing) + `roleHome(role)` + `roleLabel(role)`.
- `pages/Login.tsx` mới: hero gradient brand, form email+pass, **4 tài khoản demo bấm nhanh**, redirect đúng cổng theo vai.
- `App.tsx`: bọc `AuthProvider`; `/login` ngoài Layout; `RequireAuth` guard (chưa login → `/login`); `/` redirect theo vai trò (HS/GV/NT/DN).
- `components/Layout.tsx`: user card (avatar chữ + tên + vai trò) + nút đăng xuất; badge "Cổng của bạn" highlight cổng thuộc vai trò.

### Seed demo đẹp (40 HS, 6 tháng)
- 40 HS (6 lớp 10A1…12C2), 4 GV email cố định, đủ 6 khối dữ liệu.
- `registered_at`/`checked_in_at`/`evaluated_at` **rải T4→T9/2026** → school overview `monthly` 6 cột có số: T4 7 regs → T9 6 regs; done dao động 0–5/tháng.
- Realistic KPI: participation **65%** (13 hồ sơ pending), completion **77%** (một số duyệt nhưng chưa check-in).
- 79→65 checkins, 40 evaluations, 40 passports, 9 hoạt động rải tháng, 3 dự án + 2 tài trợ + 2 tin TT.

### Verify độc lập (bộ não)
- `pnpm build` XANH (1606 modules); dev server `localhost:5173` 200.
- Auth round-trip: login 4 vai → 200; `/auth/me` 200; logout → `/auth/me` **401**; sai pass → **401**.
- 20/20 endpoints HTTP 200 (trừ `student/roadmap` không tồn tại — Roadmap page dùng `/student/overview`).
- Backend/DB: reseed sạch 2 lần, auth_tokens tạo tự động.

### Design Rebuild ✅ (mark complete)
- Design System v2 rebuilt: React 18 + Vite + TS + Tailwind 3 + FastAPI + SQLite
- All 5 portal accents verified via Playwright runtime (read from `<main>` inline styles):
  - Học sinh `#A1458F` / Giáo viên `#27308E` / Nhà trường `#9B6AB5` / Doanh nghiệp `#C44296` / Passport `#4858AC`
- **CSS variables implemented**: `Layout.tsx` sets `--portal`, `--portal-soft`, `--portal-dark` as inline styles on `<main>` per route prefix. ✅ Verified via Playwright `getComputedStyle(document.querySelector('main'))`
- 23 pages covered with design tokens (`text-portal`, `bg-portal-soft`, `text-portal-dark`)
- Tailwind aliases (`canvas`, `ink`, `muted`, `line`, `portal`) all defined in `tailwind.config.js`
- `pnpm lint` ✅ 0 errors, `pnpm build` ✅ green, `poetry run pytest` ✅ 276 passed
- No leftover `text-blue-*`/`bg-blue-*`/`text-indigo-*`/`text-slate-900` classes in any page ✅
- `docs/design-spec-v2.md` updated with actual CSS tokens
- `docs/reports/round-4-design-rebuild.md` + `docs/reports/design-v2-verify-final.md` written

### Remaining Issues (non-blocking)
- Semantic data-viz colors hardcoded in school/Overview.tsx (donut chart) and student/Dashboard.tsx (KPI status) — intentional per-slide design, not errors
- Frontend chunk size >500kB (expected for large codebase)
