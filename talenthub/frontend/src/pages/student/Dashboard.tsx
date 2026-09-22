import { useEffect, useState } from "react";
import { CalendarDays, Flame, Sparkles, Trophy, Users } from "lucide-react";
import { get } from "../../api/client";
import { Card, ErrorBox, Loading, PageHeader, StatCard } from "../../components/ui";

interface Overview {
  full_name: string;
  class_name: string;
  grade: number;
  talent_score: number;
  experience_hours: number;
  school_rank: number;
  school_total: number;
  unlocked_badges: { code: string; name: string; icon: string; color: string }[];
  ai_analysis: string | null;
  roadmap: { title: string; content: string }[];
  activities: { id: number; title: string; field: string; status: string; hours: number }[];
}

export default function Dashboard() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    get<Overview>("/student/overview").then(setData).catch((e) => setError(String(e.message || e)));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  return (
    <div>
      <PageHeader
        title={`Xin chào, ${data.full_name}! 👋`}
        subtitle={`Lớp ${data.class_name} · Khối ${data.grade} — theo dõi hành trình phát triển năng lực của bạn.`}
      />

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Điểm năng lực" value={data.talent_score} delta="Thang điểm 100" icon={<Trophy size={18} />} color="text-amber-600" />
        <StatCard label="Giờ trải nghiệm" value={`${data.experience_hours}h`} delta="Tích lũy tự động qua check-in" icon={<Flame size={18} />} color="text-orange-600" />
        <StatCard label="Xếp hạng khối" value={`#${data.school_rank}/${data.school_total}`} delta={`Khối ${data.grade} · ${data.school_total} bạn`} icon={<Users size={18} />} color="text-blue-600" />
        <StatCard label="Huy hiệu đã mở" value={data.unlocked_badges.length} delta="Explorer/Innovator/Expert/Master" icon={<Sparkles size={18} />} color="text-violet-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI analysis */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-violet-600" />
            <h2 className="font-semibold text-slate-900">AI phân tích năng lực</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {data.ai_analysis ?? "Đang phân tích — hoàn thành bài test năng khiếu để nhận gợi ý."}
          </p>
          <a
            href="/student/roadmap"
            className="mt-4 block rounded-xl bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-100 p-4 text-sm text-slate-700 hover:border-violet-300"
          >
            💡 Xem lộ trình 3 tháng được AI gợi ý riêng cho bạn →
          </a>
        </Card>

        {/* Roadmap */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays size={18} className="text-blue-600" />
            <h2 className="font-semibold text-slate-900">Lộ trình gợi ý 3 tháng tới</h2>
          </div>
          <div className="space-y-3">
            {data.roadmap.length === 0 && (
              <p className="text-sm text-slate-500">Chưa có lộ trình — AI sẽ gợi ý sau bài khảo sát năng khiếu.</p>
            )}
            {data.roadmap.map((r) => (
              <div key={r.title} className="flex gap-3">
                <div className="shrink-0 h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                  {r.title.replace("Tháng ", "T")}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-800">{r.title}</div>
                  <div className="text-xs text-slate-500">{r.content}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent activities */}
      <div className="mt-6">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays size={18} className="text-emerald-600" />
            <h2 className="font-semibold text-slate-900">Hoạt động của bạn</h2>
          </div>
          {data.activities.length === 0 ? (
            <p className="text-sm text-slate-500">
              Bạn chưa tham gia hoạt động nào — khám phá sân chơi ngay!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 text-xs uppercase tracking-wider">
                    <th className="pb-2">Hoạt động</th>
                    <th className="pb-2">Lĩnh vực</th>
                    <th className="pb-2">Trạng thái</th>
                    <th className="pb-2 text-right">Giờ tích lũy</th>
                  </tr>
                </thead>
                <tbody>
                  {data.activities.map((a) => (
                    <tr key={a.id} className="border-t border-slate-100">
                      <td className="py-2.5 font-medium text-slate-800">{a.title}</td>
                      <td className="py-2.5 text-slate-500 capitalize">{a.field.replace("_", " ")}</td>
                      <td className="py-2.5">
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                          {a.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-medium">{a.hours}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}