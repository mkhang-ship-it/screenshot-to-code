import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, HandCoins, Search, Star, Users } from "lucide-react";
import { get } from "../../api/client";
import { Card, ErrorBox, Loading, PageHeader, StatCard } from "../../components/ui";

interface Overview {
  company_name: string;
  industry: string;
  post_count: number;
  applicant_count: number;
  sponsorship_count: number;
  total_sponsored: number;
  matching_profiles: number;
  recent_posts: { id: number; title: string; slots: number; status: string; applicants: number }[];
}

interface TopTalent {
  id: number;
  full_name: string;
  class_name: string;
  grade: number;
  talent_score: number;
}

export default function Overview() {
  const [data, setData] = useState<Overview | null>(null);
  const [top, setTop] = useState<TopTalent[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    get<Overview>("/enterprise/overview").then(setData).catch((e) => setError(String((e as Error).message || e)));
    get<TopTalent[]>("/enterprise/talents?min_score=80")
      .then((t) => setTop(t.slice(0, 3)))
      .catch(() => setTop([]));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  return (
    <div>
      <PageHeader
        title={data.company_name}
        subtitle={`Ngành: ${data.industry} — kết nối doanh nghiệp với nguồn nhân tài trẻ từ trường (slide 28).`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Hồ sơ phù hợp" value={data.matching_profiles} delta="Điểm năng lực ≥ 70" icon={<Users size={18} />} color="text-blue-600" />
        <StatCard label="Tin tuyển dụng" value={data.post_count} delta={`${data.recent_posts.length} tin gần đây`} icon={<Briefcase size={18} />} color="text-amber-600" />
        <StatCard label="Ứng viên" value={data.applicant_count} delta="Đã nộp hồ sơ" icon={<Search size={18} />} color="text-violet-600" />
        <StatCard label="Tổng tài trợ" value={`${(data.total_sponsored / 1_000_000).toFixed(0)}M₫`} delta={`${data.sponsorship_count} dự án`} icon={<HandCoins size={18} />} color="text-emerald-600" />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Tin tuyển dụng gần đây</h2>
          <span className="text-xs text-slate-400">Xem thêm trong "Tuyển thực tập"</span>
        </div>
        {data.recent_posts.length === 0 ? (
          <p className="text-sm text-slate-500">Chưa có tin tuyển dụng nào.</p>
        ) : (
          <div className="space-y-3">
            {data.recent_posts.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
                <div>
                  <div className="font-medium text-slate-800 text-sm">{p.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {p.slots} vị trí · {p.applicants} ứng viên
                  </div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full ${
                    p.status === "open" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {p.status === "open" ? "Đang tuyển" : "Đóng"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Star size={16} className="text-amber-500" /> Nhân tài nổi bật
          </h2>
          <Link to="/enterprise/talents" className="text-xs text-blue-600 hover:underline">
            Xem tất cả →
          </Link>
        </div>
        {top.length === 0 ? (
          <p className="text-sm text-slate-500">Chưa có hồ sơ điểm cao (≥ 80).</p>
        ) : (
          <div className="space-y-3">
            {top.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
                <div>
                  <div className="font-medium text-slate-800 text-sm">{t.full_name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {t.class_name} · Khối {t.grade}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-amber-600">★ {t.talent_score}</span>
                  <Link to={`/passport/${t.id}`} className="text-xs text-blue-600 hover:underline">
                    Xem passport →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}