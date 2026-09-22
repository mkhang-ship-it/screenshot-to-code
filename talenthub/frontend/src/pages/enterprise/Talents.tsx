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
        <div className="flex items-center gap-2 text-xs text-muted-light mb-3 uppercase tracking-wider">
          <Filter size={13} /> Bộ lọc
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-line px-3">
            <Search size={15} className="text-muted-light" />
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
            className="px-3 py-2 rounded-xl border border-line text-sm outline-none"
          />
          <select value={grade} onChange={(e) => setGrade(e.target.value)} className="px-3 py-2 rounded-xl border border-line text-sm bg-white">
            <option value="">Tất cả khối</option>
            {[10, 11, 12].map((g) => (
              <option key={g} value={g}>
                Khối {g}
              </option>
            ))}
          </select>
          <select value={field} onChange={(e) => setField(e.target.value)} className="px-3 py-2 rounded-xl border border-line text-sm bg-white">
            <option value="">Tất cả lĩnh vực</option>
            <option value="ky_thuat">Kỹ thuật</option>
            <option value="nghe_thuat">Nghệ thuật</option>
            <option value="kinh_doanh">Kinh doanh</option>
            <option value="the_thao">Thể thao</option>
            <option value="hoc_thuat">Học thuật</option>
            <option value="sang_tao">Sáng tạo</option>
          </select>
          <select value={minScore} onChange={(e) => setMinScore(e.target.value)} className="px-3 py-2 rounded-xl border border-line text-sm bg-white">
            <option value="">Điểm năng lực ≥ bất kỳ</option>
            <option value="60">≥ 60</option>
            <option value="70">≥ 70</option>
            <option value="80">≥ 80</option>
          </select>
        </div>
      </Card>

      <div className="mb-4 text-sm text-muted">{data.length} hồ sơ phù hợp</div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.length === 0 && (
          <Card className="md:col-span-2 lg:col-span-3">
            <p className="text-sm text-muted text-center py-6">Không tìm thấy hồ sơ phù hợp với bộ lọc.</p>
          </Card>
        )}
        {data.map((t) => (
          <Card key={t.id}>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center text-lg font-bold shrink-0">
                {t.full_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-ink truncate">{t.full_name}</div>
                <div className="text-xs text-muted-light">
                  {t.class_name} · Khối {t.grade}
                </div>
              </div>
              <div className="text-lg font-extrabold text-pink-600">{t.talent_score}</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(t.interests ?? "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3).map((s, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-canvas-soft text-muted font-medium">
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-2 text-xs text-muted">
              {t.experience_hours}h trải nghiệm · Sẵn sàng thực tập
            </div>
            <div className="mt-3 flex gap-2">
              <Link
                to={`/passport/${t.id}`}
                className="flex-1 text-center text-xs px-3 py-2 rounded-full border border-line font-semibold text-ink hover:bg-canvas-soft"
              >
                Xem hồ sơ
              </Link>
              <button className="flex-1 text-xs px-3 py-2 rounded-full cta-gradient text-white font-semibold">
                Liên hệ
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}