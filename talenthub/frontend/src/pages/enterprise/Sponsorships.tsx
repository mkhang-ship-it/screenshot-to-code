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

  return (
    <div>
      <PageHeader
        title="Tài trợ dự án học sinh"
        subtitle="Đồng hành tài trợ các dự án sáng tạo của học sinh — CSR và tiếp cận nhân tài sớm (slide 31)."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Rocket size={18} className="text-violet-600" />
            <h2 className="font-semibold text-slate-900">Tài trợ dự án mới</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white md:col-span-1"
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
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none"
            />
            <button
              onClick={sponsor}
              className="flex items-center justify-center gap-1.5 text-sm px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 font-medium"
            >
              <HandCoins size={15} /> Xác nhận tài trợ
            </button>
          </div>
          {ok && <div className="mt-3 text-sm text-emerald-600 font-medium">{ok}</div>}
          {selected && (
            <p className="mt-3 text-xs text-slate-500">
              {selected.owner_name} · {selected.member_count} thành viên · đã nhận {(selected.sponsored_total / 1_000_000).toFixed(1)}M₫ tài trợ đã duyệt.
            </p>
          )}
          <p className="mt-3 text-xs text-slate-400">
            Số tiền hiển thị bằng VNĐ. Doanh nghiệp nhận báo cáo tiến độ dự án định kỳ 2 tháng.
          </p>
        </Card>

        <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white p-6 flex flex-col justify-center">
          <div className="text-sm text-violet-200">Tổng tài trợ đã cam kết</div>
          <div className="mt-1 text-3xl font-bold">{(total / 1_000_000).toFixed(1)}M₫</div>
          <div className="mt-2 text-xs text-violet-200">{data.length} dự án đã/đang tài trợ</div>
        </div>
      </div>

      <Card>
        <h2 className="font-semibold text-slate-900 mb-3">Lịch sử tài trợ</h2>
        {data.length === 0 ? (
          <p className="text-sm text-slate-500">Chưa có tài trợ nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="pb-2">Dự án</th>
                  <th className="pb-2">Lĩnh vực</th>
                  <th className="pb-2 text-right">Số tiền</th>
                  <th className="pb-2 text-center">Trạng thái</th>
                  <th className="pb-2 text-right">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr key={d.sponsorship_id} className="border-b border-slate-100">
                    <td className="py-2.5 font-medium text-slate-800">{d.project_title}</td>
                    <td className="py-2.5 text-slate-500 capitalize">{d.field.replace("_", " ")}</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900">
                      {(d.amount / 1_000_000).toFixed(1)}M₫
                    </td>
                    <td className="py-2.5 text-center">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          d.status === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {d.status === "approved" ? "Đã duyệt" : "Chờ duyệt"}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-slate-400">{d.created_at}</td>
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