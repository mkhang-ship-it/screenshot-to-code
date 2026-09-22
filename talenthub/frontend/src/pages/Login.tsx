import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, KeyRound, Mail, Loader2, GraduationCap, Users, School, Building2 } from "lucide-react";
import { useAuth, roleHome, type AuthUser } from "../auth/AuthContext";

const DEMO_ACCOUNTS: { role: AuthUser["role"]; email: string; label: string; icon: typeof Users }[] = [
  { role: "student", email: "hs01@ftalenthub.edu.vn", label: "Học sinh", icon: GraduationCap },
  { role: "teacher", email: "nguyen.van.hung@ftalenthub.edu.vn", label: "Giáo viên", icon: Users },
  { role: "school", email: "bgh@ftalenthub.edu.vn", label: "Nhà trường", icon: School },
  { role: "enterprise", email: "hr@techfpt.vn", label: "Doanh nghiệp", icon: Building2 },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      navigate(roleHome(user.role), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-white/15 backdrop-blur items-center justify-center text-white mb-4 shadow-xl">
            <Trophy size={30} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">FTalentHub</h1>
          <p className="text-blue-100 mt-1.5 text-sm">
            Khám phá năng khiếu · Bứt phá tương lai
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-7">
          <h2 className="text-lg font-bold text-slate-900">Đăng nhập</h2>
          <p className="text-sm text-slate-500 mt-0.5 mb-5">
            Hệ sinh thái tài năng đa lĩnh vực dành cho học sinh
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Email
              </label>
              <div className="relative mt-1.5">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ban@ftalenthub.edu.vn"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Mật khẩu
              </label>
              <div className="relative mt-1.5">
                <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Trophy size={16} />}
              {loading ? "Đang đăng nhập…" : "Đăng nhập"}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              Tài khoản demo · mật khẩu <span className="font-mono">demo123</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => {
                    setEmail(acc.email);
                    setError("");
                  }}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-slate-200 text-left text-xs text-slate-700 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <acc.icon size={14} className="text-blue-600 shrink-0" />
                  <span className="truncate">
                    <span className="font-semibold block">{acc.label}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{acc.email}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-3 text-center">
              Chọn vai trò để điền nhanh → nhấn Đăng nhập
            </p>
          </div>
        </div>

        <p className="text-center text-blue-200/80 text-xs mt-5">
          Team FPI Cần Thơ · Discover Talent · Develop Skills · Create Future
        </p>
      </div>
    </div>
  );
}