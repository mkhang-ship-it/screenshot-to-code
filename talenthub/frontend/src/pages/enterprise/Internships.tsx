import { useCallback, useEffect, useState } from "react";
import { Briefcase, Plus } from "lucide-react";
import { get, post } from "../../api/client";
import { Card, ErrorBox, Loading, PageHeader } from "../../components/ui";

interface Internship {
  id: number;
  title: string;
  description: string | null;
  slots: number;
  status: string;
  deadline: string | null;
  applicant_count: number;
}

export default function Internships() {
  const [data, setData] = useState<Internship[] | null>(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", slots: 2, deadline: "" });

  const load = useCallback(() => {
    get<Internship[]>("/enterprise/internships").then(setData).catch((e) => setError(String((e as Error).message || e)));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    if (!form.title.trim()) return;
    setError("");
    try {
      await post("/enterprise/internships", {
        title: form.title,
        description: form.description,
        slots: form.slots,
        deadline: form.deadline || null,
      });
      setShowForm(false);
      setForm({ title: "", description: "", slots: 2, deadline: "" });
      load();
    } catch (e) {
      setError(String((e as Error).message || e));
    }
  };

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Tuyển thực tập"
        subtitle="Đăng tin tuyển thực tập sinh, theo dõi ứng viên nộp hồ sơ (slide 30)."
        actions={
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600 font-medium"
          >
            <Plus size={16} /> Đăng tin mới
          </button>
        }
      />

      {showForm && (
        <Card className="mb-6 border-amber-200">
          <h3 className="font-semibold text-slate-900 mb-3">Tin tuyển thực tập mới</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Tiêu đề vị trí *"
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-amber-400"
            />
            <div className="flex gap-3">
              <input
                type="number"
                min={1}
                value={form.slots}
                onChange={(e) => setForm({ ...form, slots: Number(e.target.value) })}
                placeholder="Số vị trí"
                className="w-28 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none"
              />
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none"
              />
            </div>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Mô tả công việc, yêu cầu..."
              className="md:col-span-2 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-amber-400"
            />
            <div className="md:col-span-2 flex gap-2">
              <button onClick={create} className="text-sm px-4 py-2 rounded-xl bg-amber-500 text-white font-medium">
                Đăng tin
              </button>
              <button onClick={() => setShowForm(false)} className="text-sm px-4 py-2 rounded-xl bg-slate-100 text-slate-600">
                Hủy
              </button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {data.length === 0 && (
          <Card>
            <p className="text-sm text-slate-500 text-center py-6">Chưa có tin tuyển dụng — bấm "Đăng tin mới".</p>
          </Card>
        )}
        {data.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Briefcase size={18} />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{p.title}</div>
                  <div className="text-sm text-slate-500 mt-0.5 line-clamp-2">{p.description ?? "—"}</div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{p.slots} vị trí</span>
                    <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">{p.applicant_count} ứng viên</span>
                    {p.deadline && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Hạn: {p.deadline}</span>}
                  </div>
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
          </Card>
        ))}
      </div>
    </div>
  );
}