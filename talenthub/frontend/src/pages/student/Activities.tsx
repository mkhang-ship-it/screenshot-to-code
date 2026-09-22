import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Search } from "lucide-react";
import { get, post } from "../../api/client";
import { Card, ErrorBox, Loading, PageHeader } from "../../components/ui";

interface Activity {
  id: number;
  title: string;
  field: string;
  description: string | null;
  capacity: number;
  start_date: string | null;
  registered: boolean;
  slots_left: number;
}

const FIELD_NAMES: Record<string, string> = {
  nghe_thuat: "Nghệ thuật",
  the_thao: "Thể thao",
  kinh_doanh: "Kinh doanh",
  ky_thuat: "Kỹ thuật",
  hoc_thuat: "Học thuật",
  sang_tao: "Sáng tạo",
};

export default function Activities() {
  const [data, setData] = useState<Activity[] | null>(null);
  const [field, setField] = useState("");
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (field) params.set("field", field);
    if (q) params.set("q", q);
    get<Activity[]>(`/student/activities?${params.toString()}`)
      .then(setData)
      .catch((e) => setError(String(e.message || e)));
  }, [field, q]);

  useEffect(() => {
    load();
  }, [load]);

  const register = async (id: number) => {
    setError("");
    try {
      await post(`/student/activities/${id}/register`, {});
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
        title="Hoạt động & Sân chơi"
        subtitle="Săn slot các lab, câu lạc bộ, workshop và cuộc thi hấp dẫn — phân loại theo lĩnh vực (slide 13)."
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex rounded-xl bg-white border border-slate-200 overflow-hidden items-center px-3">
          <Search size={15} className="text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm hoạt động..."
            className="px-2 py-2 text-sm outline-none w-52"
          />
        </div>
        <button
          onClick={() => setField("")}
          className={`text-sm px-3 py-2 rounded-lg border ${
            !field ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200"
          }`}
        >
          Tất cả
        </button>
        {Object.entries(FIELD_NAMES).map(([key, name]) => (
          <button
            key={key}
            onClick={() => setField(field === key ? "" : key)}
            className={`text-sm px-3 py-2 rounded-lg border ${
              field === key ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((a) => (
          <Card key={a.id}>
            <div className="flex items-start justify-between mb-2">
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 font-medium">
                {FIELD_NAMES[a.field] ?? a.field}
              </span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full ${
                  a.slots_left > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                }`}
              >
                {a.slots_left > 0 ? `Còn ${a.slots_left} chỗ` : "Hết chỗ"}
              </span>
            </div>
            <h3 className="font-semibold text-slate-900">{a.title}</h3>
            <p className="mt-1 text-sm text-slate-500 line-clamp-2">{a.description}</p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
              <CalendarDays size={13} />
              {a.start_date ?? "Sắp mở"}
            </div>
            <button
              onClick={() => register(a.id)}
              disabled={a.registered || a.slots_left <= 0}
              className="mt-4 w-full text-sm py-2 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400"
            >
              {a.registered ? "Đã đăng ký ✓" : "Đăng ký ngay"}
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}