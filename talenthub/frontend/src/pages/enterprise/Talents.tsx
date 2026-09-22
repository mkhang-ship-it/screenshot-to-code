import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Filter, Search } from "lucide-react";
import { get } from "../../api/client";
import { Card, ErrorBox, Loading, PageHeader } from "../../components/ui";

interface Talent {
  id: number;
  full_name: string;
  class_name: string;
  grade: number;
  talent_score: number;
  experience_hours: number;
  interests: string | null;
  avatar_url: string | null;
}

export default function Talents() {
  const [data, setData] = useState<Talent[] | null>(null);
  const [q, setQ] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [grade, setGrade] = useState("");
  const [field, setField] = useState("");
  const [minScore, setMinScore] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (classFilter) params.set("class_name", classFilter);
    if (grade) params.set("grade", grade);
    if (field) params.set("field", field);
    if (minScore) params.set("min_score", minScore);
    get<Talent[]>(`/enterprise/talents?${params.toString()}`)
      .then(setData)
      .catch((e) => setError(String((e as Error).message || e)));
  }, [q, classFilter, grade, field, minScore]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Tìm kiếm nhân tài"
        subtitle="Tra cứu hồ sơ học sinh theo tên, lớp, khối, lĩnh vực, điểm năng lực — để tuyển thực tập hoặc tài trợ tài năng (slide 29)."
      />

      <Card className="mb-5">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3 uppercase tracking-wider">
          <Filter size={13} /> Bộ lọc
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
            <Search size={15} className="text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tên / sở thích..."
              className="py-2 text-sm outline-none w-full"
            />
          </div>
          <input
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            placeholder="Lớp (VD: 11B1)"
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none"
          />
          <select value={grade} onChange={(e) => setGrade(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white">
            <option value="">Tất cả khối</option>
            {[10, 11, 12].map((g) => (
              <option key={g} value={g}>
                Khối {g}
              </option>
            ))}
          </select>
          <select value={field} onChange={(e) => setField(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white">
            <option value="">Tất cả lĩnh vực</option>
            <option value="ky_thuat">Kỹ thuật</option>
            <option value="nghe_thuat">Nghệ thuật</option>
            <option value="kinh_doanh">Kinh doanh</option>
            <option value="the_thao">Thể thao</option>
            <option value="hoc_thuat">Học thuật</option>
            <option value="sang_tao">Sáng tạo</option>
          </select>
          <select value={minScore} onChange={(e) => setMinScore(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white">
            <option value="">Điểm năng lực ≥ bất kỳ</option>
            <option value="60">≥ 60</option>
            <option value="70">≥ 70</option>
            <option value="80">≥ 80</option>
          </select>
        </div>
      </Card>

      <div className="mb-4 text-sm text-slate-500">{data.length} hồ sơ phù hợp</div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.length === 0 && (
          <Card className="md:col-span-2 lg:col-span-3">
            <p className="text-sm text-slate-500 text-center py-6">Không tìm thấy hồ sơ phù hợp với bộ lọc.</p>
          </Card>
        )}
        {data.map((t) => (
          <Card key={t.id}>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-lg font-bold shrink-0">
                {t.full_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 truncate">{t.full_name}</div>
                <div className="text-xs text-slate-400">
                  {t.class_name} · Khối {t.grade}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-amber-600">{t.talent_score}</div>
                <div className="text-[10px] text-slate-400">điểm</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500 line-clamp-2">{t.interests ?? "Chưa cập nhật sở thích"}</div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{t.experience_hours}h trải nghiệm</span>
              <Link to={`/passport/${t.id}`} className="text-xs text-blue-600 hover:underline">
                Xem passport →
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}