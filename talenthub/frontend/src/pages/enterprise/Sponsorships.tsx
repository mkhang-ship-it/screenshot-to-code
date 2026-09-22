import { useCallback, useEffect, useState } from "react";
import { HandCoins, Rocket } from "lucide-react";
import { get, post } from "../../api/client";
import { Card, ErrorBox, Loading, PageHeader } from "../../components/ui";

interface Sponsorship {
  sponsorship_id: number;
  project_id: number;
  project_title: string;
  field: string;
  amount: number;
  status: string;
  created_at: string;
}

interface Project {
  id: number;
  title: string;
  field: string;
  description: string | null;
  status: string;
  owner_name: string;
  member_count: number;
  sponsored_total: number;
}

const FIELD_NAMES: Record<string, string> = {
  ky_thuat: "Kỹ thuật",
  nghe_thuat: "Nghệ thuật",
  kinh_doanh: "Kinh doanh",
  the_thao: "Thể thao",
  hoc_thuat: "Học thuật",
  sang_tao: "Sáng tạo",
};

export default function Sponsorships() {
  const [data, setData] = useState<Sponsorship[] | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [amount, setAmount] = useState(5000000);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const load = useCallback(() => {
    get<Sponsorship[]>("/enterprise/sponsorships").then(setData).catch((e) => setError(String((e as Error).message || e)));
  }, []);

  useEffect(() => {
    load();
    get<Project[]>("/enterprise/projects")
      .then(setProjects)
      .catch(() => setProjects([]));
  }, [load]);

  const sponsor = async () => {
    if (!projectId) return;
    setError("");
    try {
      await post(`/enterprise/sponsorships?project_id=${projectId}&amount=${amount}`, {});
      setOk(`Đã tài trợ dự án #${projectId} thành công.`);
      setTimeout(() => setOk(""), 3000);
      load();
    } catch (e) {
      setError(String((e as Error).message || e));
    }
  };

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  const total = data.reduce((s, d) => s + (d.status === "approved" ? d.amount : 0), 0);
  const selected = projects.find((p) => String(p.id) === projectId);
  const maxFunded = Math.max(1, ...projects.map((p) => p.sponsored_total));

  return (
    <div>
      <PageHeader
        title="Tài trợ dự án"
        subtitle="Đầu tư vào các dự án sáng tạo của học sinh sinh viên (slide 31)."
      />

      {/* Banner tổng (slide 31) */}
      <div className="rounded-2xl hero-gradient p-5 text-white shadow-lg mb-6 flex items-center gap-4">
        <span className="h-12 w-12 shrink-0 rounded-full bg-white/20 flex items-center justify-center">
          <HandCoins size={22} />
        </span>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-white/75">
            Tổng đã tài trợ
          </div>
          <div className="text-2xl font-extrabold">
            {(total / 1_000_000).toFixed(0)} triệu VNĐ
          </div>
          <div className="text-xs text-white/80">
            trên {projects.length} dự án — tác động đến học sinh sinh viên
          </div>
        </div>
      </div>

      {/* Lưới dự án (slide 31) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {projects.map((p) => {
          const pct = Math.min(100, Math.round((p.sponsored_total / maxFunded) * 100));
          return (
            <Card key={p.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-ink">{p.title}</div>
                  <div className="text-xs text-muted mt-0.5">
                    {p.owner_name} · Nhóm {p.member_count} thành viên
                  </div>
                </div>
                <span className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-pink-50 text-pink-600 font-semibold">
                  ✨ Tiềm năng
                </span>
              </div>
              <div className="mt-3 flex justify-between text-xs">
                <span className="font-semibold text-ink">
                  {(p.sponsored_total / 1_000_000).toFixed(0)} triệu
                </span>
                <span className="font-bold text-emerald-600">{pct}%</span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-canvas-soft overflow-hidden">
                <div className="h-full rounded-full hero-gradient" style={{ width: `${pct}%` }} />
              </div>
              <button
                onClick={() => {
                  setProjectId(String(p.id));
                  document.getElementById("sponsor-form")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="mt-3 w-full text-sm py-2 rounded-full cta-gradient text-white font-semibold"
              >
                Tài trợ ngay
              </button>
            </Card>
          );
        })}
        {projects.length === 0 && (
          <Card className="lg:col-span-2">
            <p className="text-sm text-muted text-center py-6">Chưa có dự án nào kêu gọi tài trợ.</p>
          </Card>
        )}
      </div>

      <div id="sponsor-form" className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-3">
          <div className="flex items-center gap-2 mb-3">
            <Rocket size={18} className="text-portal" />
            <h2 className="font-semibold text-ink">Tài trợ dự án mới</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-line text-sm bg-white md:col-span-1"
            >
              <option value="">Chọn dự án...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} — {p.owner_name} ({FIELD_NAMES[p.field] ?? p.field})
                </option>
              ))}
            </select>
            <input
              type="number"
              min={100000}
              step={100000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="px-3 py-2 rounded-xl border border-line text-sm outline-none"
            />
            <button
              onClick={sponsor}
              className="flex items-center justify-center gap-1.5 text-sm px-4 py-2 rounded-full cta-gradient text-white font-semibold"
            >
              <HandCoins size={15} /> Xác nhận tài trợ
            </button>
          </div>
          {ok && <div className="mt-3 text-sm text-portal font-medium">{ok}</div>}
          {selected && (
            <p className="mt-3 text-xs text-muted">
              {selected.owner_name} · {selected.member_count} thành viên · đã nhận {(selected.sponsored_total / 1_000_000).toFixed(1)}M₫ tài trợ đã duyệt.
            </p>
          )}
          <p className="mt-3 text-xs text-muted-light">
            Số tiền hiển thị bằng VNĐ. Doanh nghiệp nhận báo cáo tiến độ dự án định kỳ 2 tháng.
          </p>
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold text-ink mb-3">Lịch sử tài trợ</h2>
        {data.length === 0 ? (
          <p className="text-sm text-muted">Chưa có tài trợ nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-light text-xs uppercase tracking-wider border-b border-line">
                  <th className="pb-2">Dự án</th>
                  <th className="pb-2">Lĩnh vực</th>
                  <th className="pb-2 text-right">Số tiền</th>
                  <th className="pb-2 text-center">Trạng thái</th>
                  <th className="pb-2 text-right">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr key={d.sponsorship_id} className="border-b border-line">
                    <td className="py-2.5 font-medium text-ink">{d.project_title}</td>
                    <td className="py-2.5 text-muted capitalize">{d.field.replace("_", " ")}</td>
                    <td className="py-2.5 text-right font-semibold text-ink">
                      {(d.amount / 1_000_000).toFixed(1)}M₫
                    </td>
                    <td className="py-2.5 text-center">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          d.status === "approved" ? "bg-portal-soft text-portal-dark" : "bg-portal text-white"
                        }`}
                      >
                        {d.status === "approved" ? "Đã duyệt" : "Chờ duyệt"}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-muted-light">{d.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}