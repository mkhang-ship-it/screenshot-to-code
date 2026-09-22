import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Users,
  School,
  Building2,
  IdCard,
  LayoutDashboard,
  FileText,
  BarChart3,
  Sparkles,
  QrCode,
  Award,
  Compass,
  CalendarDays,
  ClipboardCheck,
  Star,
  Search,
  Briefcase,
  HandCoins,
  BookOpen,
  Trophy,
  LogOut,
} from "lucide-react";
import { useAuth, roleLabel } from "../auth/AuthContext";

const PORTALS = [
  {
    key: "student",
    label: "Học sinh",
    icon: GraduationCap,
    color: "text-blue-600",
    items: [
      { to: "/student", label: "Tổng quan", icon: LayoutDashboard },
      { to: "/student/profile", label: "Hồ sơ năng lực", icon: FileText },
      { to: "/student/discover", label: "Khám phá năng khiếu", icon: Compass },
      { to: "/student/activities", label: "Hoạt động", icon: CalendarDays },
      { to: "/student/checkin", label: "Check-in QR", icon: QrCode },
      { to: "/student/badges", label: "Huy hiệu", icon: Award },
      { to: "/student/roadmap", label: "Lộ trình AI", icon: Sparkles },
    ],
  },
  {
    key: "teacher",
    label: "Giáo viên",
    icon: Users,
    color: "text-violet-600",
    items: [
      { to: "/teacher", label: "Tổng quan", icon: LayoutDashboard },
      { to: "/teacher/activities", label: "Sân chơi của tôi", icon: BookOpen },
      { to: "/teacher/grading", label: "Chấm điểm rubric", icon: ClipboardCheck },
      { to: "/teacher/students", label: "Học viên của tôi", icon: Users },
    ],
  },
  {
    key: "school",
    label: "Nhà trường",
    icon: School,
    color: "text-emerald-600",
    items: [
      { to: "/school", label: "Tổng quan KPI", icon: LayoutDashboard },
      { to: "/school/analysis", label: "Phân tích năng lực", icon: BarChart3 },
      { to: "/school/reports", label: "Báo cáo", icon: FileText },
      { to: "/school/classes", label: "Lớp & Khối", icon: School },
    ],
  },
  {
    key: "enterprise",
    label: "Doanh nghiệp",
    icon: Building2,
    color: "text-amber-600",
    items: [
      { to: "/enterprise", label: "Tổng quan", icon: LayoutDashboard },
      { to: "/enterprise/talents", label: "Tìm nhân tài", icon: Search },
      { to: "/enterprise/internships", label: "Tuyển thực tập", icon: Briefcase },
      { to: "/enterprise/sponsorships", label: "Tài trợ dự án", icon: HandCoins },
    ],
  },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100 flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white">
            <Trophy size={18} />
          </div>
          <div>
            <div className="font-bold text-slate-900 leading-tight">FTalentHub</div>
            <div className="text-[11px] text-slate-500 leading-tight">
              Khám phá năng khiếu · Bứt phá tương lai
            </div>
          </div>
        </div>

        {/* Portals */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {PORTALS.map((portal) => {
            const isOwn = portal.key === user?.role;
            return (
              <div key={portal.key}>
                <div className="flex items-center gap-2 px-2 mb-1.5">
                  <portal.icon size={15} className={portal.color} />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {portal.label}
                  </span>
                  {isOwn && (
                    <span className="ml-auto text-[9px] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 rounded-full px-1.5 py-0.5">
                      Cổng của bạn
                    </span>
                  )}
                </div>
                <div
                  className={`space-y-0.5 rounded-lg ${isOwn ? "ring-1 ring-blue-100 p-1 -m-1" : ""}`}
                >
                  {portal.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-slate-600 hover:bg-slate-50"
                        }`
                      }
                    >
                      <item.icon size={16} className="shrink-0" />
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Passport shortcut */}
        <div className="px-3 pb-3">
          <NavLink
            to="/passport/1"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 text-amber-700 hover:bg-amber-100/70"
          >
            <IdCard size={16} />
            Talent Passport
          </NavLink>
        </div>

        {/* User card */}
        {user && (
          <div className="px-3 pb-4">
            <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-xs font-bold">
                {user.full_name
                  .split(" ")
                  .slice(-2)
                  .map((w) => w[0])
                  .join("")}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-800 truncate">
                  {user.full_name}
                </div>
                <div className="text-[11px] text-blue-600 font-medium">
                  {roleLabel(user.role)}
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Đăng xuất"
                className="text-slate-400 hover:text-red-600 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1 min-w-0 p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}