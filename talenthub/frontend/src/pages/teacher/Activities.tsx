import { useCallback, useEffect, useState } from "react";
import { MapPin, Plus, Users } from "lucide-react";
import { get, post } from "../../api/client";
import { Card, ErrorBox, Loading, PageHeader } from "../../components/ui";

interface Activity {
  id: number;
  title: string;
  field: string;
  description: string | null;
  capacity: number;
  start_date: string | null;
  end_date: string | null;
  status: string;
  registered_count: number;
}

const FIELDS = ["ky_thuat", "nghe_thuat", "kinh_doanh", "the_thao", "hoc_thuat", "sang_tao"];

export default function Activities() {
  const [data, setData] = useState<Activity[] | null>(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", field: "ky_thuat", description: "", capacity: 30 });

  const load = useCallback(() => {
    get<Activity[]>("/teacher/activities").then(setData).catch((e) => setError(String((e as Error).message || e)));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    if (!form.title.trim()) return;
    await post("/teacher/activities", { ...form, start_date: null, end_date: null });
    setShowForm(false);
    setForm({ title: "", field: "ky_thuat", description: "", capacity: 30 });
    load();
  };

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Sân chơi của tôi"
        subtitle="Tạo và quản lý các lab, CLB, workshop mình phụ trách (slide 21)."
        actions={
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium"
          >
            <Plus size={16} /> Tạo sân chơi
          </button>
        }
      />

      {showForm && (
        <Card className="mb-6 border-blue-200">
          <h3 className="font-semibold text-slate-900 mb-3">Sân chơi mới</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Tên sân chơi *"
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400"
            />
            <div className="flex gap-3">
              <select
                value={form.field}
                onChange={(e) => setForm({ ...form, field: e.target.value })}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
              >
                {FIELDS.map((f) => (
                  <option key={f} value={f}>
                    {f.replace("_", " ")}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                placeholder="Sức chứa"
                className="w-24 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none"
              />
            </div>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Mô tả ngắn"
              className="md:col-span-2 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400"
            />
            <div className="md:col-span-2 flex gap-2">
              <button onClick={create} className="text-sm px-4 py-2 rounded-xl bg-blue-600 text-white font-medium">
                Lưu
              </button>
              <button onClick={() => setShowForm(false)} className="text-sm px-4 py-2 rounded-xl bg-slate-100 text-slate-600">
                Hủy
              </button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.length === 0 && (
          <Card>
            <p className="text-sm text-slate-500">Chưa có sân chơi nào — bấm "Tạo sân chơi" để bắt đầu.</p>
          </Card>
        )}
        {data.map((a) => (
          <Card key={a.id}>
            <div className="flex items-start justify-between">
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 font-medium capitalize">
                {a.field.replace("_", " ")}
              </span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full ${
                  a.status === "open" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                }`}
              >
                {a.status === "open" ? "Đang mở" : a.status}
              </span>
            </div>
            <h3 className="mt-2 font-semibold text-slate-900">{a.title}</h3>
            <p className="mt-1 text-sm text-slate-500 line-clamp-2">{a.description}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Users size={13} />
                {a.registered_count}/{a.capacity} học viên
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={13} />
                {a.start_date ?? "Sắp mở"}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}