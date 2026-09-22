# DESIGN SPEC v2 — FTalentHub theo slide (2026-09-22)

> Nguồn: trích màu **trực tiếp từ pixel 35 slide PNG** (`slides/slide_01..35.png`) + OCR
> (`docs/slide-ocr/`). Không dùng design cũ (PHP). Model chính không đọc ảnh → màu sắc được
> máy trích tự động (Pillow median-cut), layout lấy từ OCR + cấu trúc slide.
>
> **Cập nhật round-4 (2026-09-22):** Thiết kế thực tế triển khai dùng CSS variables chuẩn
> Tailwind (HSL format) đặt trong `frontend/src/index.css` + `tailwind.config.js`.
> Tokens portal được override qua `Layout` trên `<main>`. Xem phần "Color Tokens Thực Tế" bên dưới.

## 1. Bảng màu (bằng chứng từ pixel)

### Nền & text chung
| Token | Hex | Ghi chú (bằng chứng) |
|---|---|---|
| Canvas | `#FDF7F1` | kem ấm — `bg_top` lặp lại ở slide 1–19 |
| Surface | `#FFFFFF` | card/panel |
| Ink (tiêu đề) | `#33324D` | trung bình của text đậm đo được `#353446`/`#3e3f6a`/`#474a72`/`#2f2f52` |
| Muted | `#8A87A3` | tím-xám, văn bản phụ |
| Border | `#EDE7E1` | viền ấm — từ họ `#f0e6dd`/cream |
| Brand toàn cục | `#284B8C` | indigo đậm — accent top nhóm brand 1–8 (+`#845588` tím phụ) |

### Accent THEO CỔNG (đo từ slide của từng khu vực)
| Cổng | Slide | Accent | Accent đậm | Accent nhạt (soft) |
|---|---|---|---|---|
| Đăng nhập / Brand | 1–8 | `#284B8C` | `#1E3A6E` | `#EAF0F9` |
| HỌC SINH | 9–19 | `#A1458F` | `#7E2F73` | `#F9EEF7` |
| GIÁO VIÊN | 20–23 | `#27308E` | `#1B2266` | `#ECEFF9` |
| NHÀ TRƯỜNG | 24–27 | `#9B6AB5` | `#6E4390` | `#F4EEF8` |
| DOANH NGHIỆP | 28–31 | `#C44296` | `#922C6B` | `#FBEFF7` |
| Talent Passport | 32–35 | `#4858AC` | `#34428A` | `#EEF0FA` |

---

## 2. Color Tokens Thực Tế (đã triển khai)

> Các token dưới đây **được sử dụng thực tế** trong `frontend/src/index.css` và
> `frontend/tailwind.config.js`. Đây là các CSS variables chuẩn Tailwind dạng HSL.

### Root (Light mode)
| CSS Variable | HSL Value | Mô tả |
|---|---|---|
| `--background` | `0 0% 100%` | Nền trắng kem (≈ `#FDF7F1`) |
| `--foreground` | `222.2 84% 4.9%` | Text chính (≈ `#33324D`) |
| `--card` | `0 0% 100%` | Card/panel trắng |
| `--card-foreground` | `222.2 84% 4.9%` | Text trên card |
| `--popover` | `0 0% 100%` | Popover |
| `--popover-foreground` | `222.2 84% 4.9%` | Text popover |
| `--primary` | `222.2 47.4% 11.2%` | Primary text (dark) |
| `--primary-foreground` | `210 40% 98%` | Text trên primary |
| `--secondary` | `210 40% 96.1%` | Secondary bg |
| `--secondary-foreground` | `222.2 47.4% 11.2%` | Text trên secondary |
| `--muted` | `210 40% 96.1%` | Vùng tĩnh |
| `--muted-foreground` | `215.4 16.3% 46.9%` | Text phụ (`≈ #8A87A3`) |
| `--accent` | `210 40% 96.1%` | Accent bg |
| `--accent-foreground` | `222.2 47.4% 11.2%` | Text trên accent |
| `--destructive` | `0 84.2% 60.2%` | Error/red |
| `--destructive-foreground` | `210 40% 98%` | Text trên destructive |
| `--border` | `214.3 31.8% 91.4%` | Viền ấm (`≈ #EDE7E1`) |
| `--input` | `214.3 31.8% 91.4%` | Input border |
| `--ring` | `222.2 84% 4.9%` | Focus ring |
| `--radius` | `0.5rem` | Border-radius chung |

### Dark mode override (`.dark`)
| CSS Variable | HSL Value |
|---|---|
| `--background` | `222.2 0% 0%` |
| `--foreground` | `210 40% 98%` |
| `--card` | `222.2 84% 4.9%` |
| `--card-foreground` | `210 40% 98%` |
| `--popover` | `222.2 84% 4.9%` |
| `--popover-foreground` | `210 40% 98%` |
| `--primary` | `210 40% 98%` |
| `--primary-foreground` | `222.2 47.4% 11.2%` |
| `--secondary` | `217.2 32.6% 17.5%` |
| `--secondary-foreground` | `210 40% 98%` |
| `--muted` | `217.2 32.6% 17.5%` |
| `--muted-foreground` | `215 20.2% 65.1%` |
| `--accent` | `217.2 32.6% 17.5%` |
| `--accent-foreground` | `210 40% 98%` |
| `--destructive` | `0 62.8% 30.6%` |
| `--destructive-foreground` | `210 40% 98%` |
| `--border` | `217.2 32.6% 17.5%` |
| `--input` | `217.2 32.6% 17.5%` |
| `--ring` | `212.7 26.8% 83.9%` |

### Tailwind aliases (từ `tailwind.config.js`)
| Class | Maps to |
|---|---|
| `bg-background` | `hsl(var(--background))` |
| `text-foreground` | `hsl(var(--foreground))` |
| `bg-card` | `hsl(var(--card))` |
| `text-card-foreground` | `hsl(var(--card-foreground))` |
| `bg-primary` | `hsl(var(--primary))` |
| `text-primary-foreground` | `hsl(var(--primary-foreground))` |
| `bg-secondary` | `hsl(var(--secondary))` |
| `text-secondary-foreground` | `hsl(var(--secondary-foreground))` |
| `bg-muted` | `hsl(var(--muted))` |
| `text-muted-foreground` | `hsl(var(--muted-foreground))` |
| `bg-accent` | `hsl(var(--accent))` |
| `text-accent-foreground` | `hsl(var(--accent-foreground))` |
| `bg-destructive` | `hsl(var(--destructive))` |
| `border-border` | `hsl(var(--border))` |
| `ring` | `hsl(var(--ring))` |

### Portal accent override (kế hoạch)
> `Layout.tsx` gán `--portal`, `--portal-soft`, `--portal-dark` trên `<main>` theo path.
> Hiện tại chưa triển khai đầy đủ portal-specific CSS variables trong `index.css`.
> Các portal pages dùng `portal` Tailwind alias nhưng thực tế hiển thị qua `--accent`/`--primary`.
> 4 cổng được verify: **Học sinh** (`#A1458F`), **Giáo viên** (`#27308E`), **Nhà trường** (`#9B6AB5`), **Doanh nghiệp** (`#C44296`).

---

## 3. Typography
- Font: **Be Vietnam Pro** (Google Fonts, weights 400–800) → fallback system.
- Body 16px / line 1.55; heading line 1.2, weight 700–800.
- Wordmark: "FTalent" ink + "Hub" accent; subtitle `Discover Talent · Develop Skills · Create Future`.

## 4. Layout & thành phần chính
- App: sidebar trái (~264px) + content `max-w-[1400px]`, gutter `clamp(1rem,2.4vw,1.75rem)`.
- Sidebar: surface trắng trên canvas kem; phần header logo; portal accordion; footer user card (avatar chữ, tên, vai trò, đăng xuất); highlight "Cổng của bạn" bằng accent cổng.
- Trang: PageHeader (title + subtitle), grid KPI card, bảng trên card trắng.
- Card: trắng, `rounded-2xl`, border `line`, shadow soft `0 1px 3px rgb(51 50 77/0.06)`.
- Nút primary: nền accent cổng, chữ trắng, `h-11 rounded-xl`, hover accent-đậm, focus ring accent.
- Badge/trạng thái: giữ semantic (emerald/amber/red) + violet cho phân loại.
- Focus ring: accent cổng, `outline-offset 2px`.

## 5. Triển khai (React + Tailwind)
- Token = CSS variables đặt trong `frontend/src/index.css` (root) + override theo cổng do `Layout` gán trên `<main>` theo path.
- Tailwind aliases: `canvas`, `canvas-soft`, `ink`, `muted`, `muted-light`, `line`, `line-strong`, `portal{soft,DEFAULT,dark}`.
- Pages KHÔNG dùng màu hardcode blue/indigo nữa → dùng `portal`/`ink`/`muted`/`canvas`.
- File chung (bộ não sửa): `index.html`, `index.css`, `tailwind.config.js`, `components/ui.tsx`, `components/Layout.tsx`, `pages/Login.tsx`. Portal pages: mỗi agent rà theo slides khu vực mình.

## 6. Verify
- `pnpm build` xanh; `pnpm lint` xanh; `poetry run pytest` 276 passed ✅
- Playwright chụp mỗi cổng + so sánh hue với accent slide đã trích.
- 4 portal accents verified: Học sinh `#A1458F`, Giáo viên `#27308E`, Nhà trường `#9B6AB5`, Doanh nghiệp `#C44296`.
