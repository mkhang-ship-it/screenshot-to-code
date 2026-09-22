import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { get, post } from "../../api/client";
import { Card, ErrorBox, Loading } from "../../components/ui";

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
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">Tuyển thực tập sinh</h1>
          <p className="mt-1 text-sm text-muted">
            {data.length} tin đăng · {data.reduce((s, p) => s + p.applicant_count, 0)} ứng viên đang xét duyệt.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-full cta-gradient text-white font-semibold"
        >
          <Plus size={16} /> Đăng tin mới
        </button>
      </div>

      {showForm && (
        <Card className="mb-6 border-portal-soft">
          <h3 className="font-semibold text-ink mb-3">Tin tuyển thực tập mới</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Tiêu đề vị trí *"
              className="px-3 py-2 rounded-xl border border-line text-sm outline-none focus:border-portal"
            />
            <div className="flex gap-3">
              <input
                type="number"
                min={1}
                value={form.slots}
                onChange={(e) => setForm({ ...form, slots: Number(e.target.value) })}
                placeholder="Số vị trí"
                className="w-28 px-3 py-2 rounded-xl border border-line text-sm outline-none"
              />
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="flex-1 px-3 py-2 rounded-xl border border-line text-sm outline-none"
              />
            </div>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Mô tả công việc, yêu cầu..."
              className="md:col-span-2 px-3 py-2 rounded-xl border border-line text-sm outline-none focus:border-portal"
            />
            <div className="md:col-span-2 flex gap-2">
              <button onClick={create} className="text-sm px-4 py-2 rounded-xl bg-portal text-white font-medium">
                Đăng tin
              </button>
              <button onClick={() => setShowForm(false)} className="text-sm px-4 py-2 rounded-xl bg-canvas-soft text-muted">
                Hủy
              </button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.length === 0 && (
          <Card className="lg:col-span-2">
            <p className="text-sm text-muted text-center py-6">Chưa có tin tuyển dụng — bấm "Đăng tin mới".</p>
          </Card>
        )}
        {data.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="font-bold text-ink">{p.title}</div>
              <span
                className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full font-medium ${
                  p.status === "open" ? "bg-emerald-50 text-emerald-600" : "bg-canvas-soft text-muted"
                }`}
              >
                {p.status === "open" ? "Đang tuyển" : "Tạm dừng"}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
              <span>{p.slots} vị trí</span>
              <span>{p.applicant_count} ứng viên</span>
              {p.deadline && <span>Hạn: {p.deadline}</span>}
            </div>
            {p.description && (
              <p className="mt-1.5 text-xs text-muted-light line-clamp-2">{p.description}</p>
            )}
            <div className="mt-3 flex gap-2">
              <button className="flex-1 text-xs px-3 py-2 rounded-full border border-line font-semibold text-ink hover:bg-canvas-soft">
                Xem ứng viên
              </button>
              <button className="flex-1 text-xs px-3 py-2 rounded-full bg-orange-100 font-semibold text-ink">
                Chỉnh sửa
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}