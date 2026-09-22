import { useEffect, useState } from "react";
import { Activity, CalendarDays, School, Users } from "lucide-react";
import { get } from "../../api/client";
import { Card, ErrorBox, Loading, PageHeader, StatCard } from "../../components/ui";

interface Overview {
  total_students: number;
  total_hours: number;
  active_registrations: number;
  participation_pct: number;
  completion_pct: number;
  activities_per_month: number;
  field_distribution: { field: string; count: number }[];
  monthly: { month: string; key: string; registrations: number; completions: number }[];
  trends: {
    students_delta: string;
    hours_delta: string;
    participation_delta: string;
    completion_delta: string;
  };
}

const FIELD_LABELS: Record<string, string> = {
  ky_thuat: "Kỹ thuật",
  hoc_thuat: "Học thuật",
  kinh_doanh: "Kinh doanh",
  nghe_thuat: "Nghệ thuật",
  the_thao: "Thể thao",
  sang_tao: "Sáng tạo",
};

const DONUT_COLORS = ["#f97316", "#facc15", "#ec4899", "#8b5cf6", "#14b8a6", "#3b82f6"];

export default function Overview() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    get<Overview>("/school/overview").then(setData).catch((e) => setError(String((e as Error).message || e)));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  const totalFields = data.field_distribution.reduce((s, f) => s + f.count, 0) || 1;
  const shares = data.field_distribution.map((f, i) => ({
    ...f,
    pct: Math.round((f.count / totalFields) * 100),
    color: DONUT_COLORS[i % DONUT_COLORS.length],
  }));
  // vòng donut bằng conic-gradient
  let acc = 0;
  const gradient = shares
    .map((s) => {
      const from = acc;
      acc += s.pct;
      return `${s.color} ${from}% ${acc}%`;
    })
    .join(", ");

  const maxMonthly = Math.max(...data.monthly.flatMap((m) => [m.registrations, m.completions]), 1);

  return (
    <div>
      <PageHeader
        title="Tổng quan nhà trường"
        subtitle="Theo dõi toàn diện — quản lý hiệu quả — nâng cao chất lượng giáo dục (slide 24)."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Học sinh hoạt động" value={data.total_students} delta={data.trends.students_delta} icon={<Users size={18} />} color="text-blue-600" />
        <StatCard label="Hoạt động/tháng" value={data.activities_per_month} delta={data.trends.hours_delta} icon={<CalendarDays size={18} />} color="text-emerald-600" />
        <StatCard label="Tỷ lệ tham gia" value={`${data.participation_pct}%`} delta={data.trends.participation_delta} icon={<Activity size={18} />} color="text-orange-500" />
        <StatCard label="Tỷ lệ hoàn thành" value={`${data.completion_pct}%`} delta={data.trends.completion_delta} icon={<School size={18} />} color="text-violet-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-slate-900 mb-4">Phân bố năng khiếu</h2>
          <div className="flex items-center gap-6">
            <div
              className="h-36 w-36 shrink-0 rounded-full"
              style={{ background: `conic-gradient(${gradient})`, mask: "radial-gradient(circle, transparent 52%, black 53%)", WebkitMask: "radial-gradient(circle, transparent 52%, black 53%)" }}
            />
            <div className="flex-1 space-y-2">
              {shares.map((s) => (
                <div key={s.field} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="flex-1 text-slate-600">{FIELD_LABELS[s.field] ?? s.field}</span>
                  <span className="font-semibold text-slate-900">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 rounded-xl bg-slate-50 border border-slate-100 p-4 flex items-center justify-between">
            <div className="text-sm text-slate-500">Tổng giờ trải nghiệm toàn trường</div>
            <div className="text-lg font-bold text-slate-900">{data.total_hours}h</div>
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-900 mb-1">Tham gia &amp; hoàn thành — 6 tháng</h2>
          <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-orange-500" /> Đăng ký</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-pink-500" /> Hoàn thành</span>
          </div>
          <div className="flex items-end gap-3 h-44">
            {data.monthly.map((m) => (
              <div key={m.key} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex items-end gap-1 h-32">
                  <div
                    className="w-4 rounded-t bg-orange-500"
                    style={{ height: `${Math.max(3, (m.registrations / maxMonthly) * 100)}%` }}
                    title={`${m.registrations} đăng ký`}
                  />
                  <div
                    className="w-4 rounded-t bg-pink-500"
                    style={{ height: `${Math.max(3, (m.completions / maxMonthly) * 100)}%` }}
                    title={`${m.completions} hoàn thành`}
                  />
                </div>
                <span className="text-xs text-slate-400">{m.month}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-4 text-sm text-emerald-800">
            <School size={16} className="inline mr-1.5" />
            Mỗi học sinh nên tích lũy <b>ít nhất 10 giờ/năm</b> để hoàn thành mục tiêu trải nghiệm.
          </div>
        </Card>
      </div>
    </div>
  );
}
