import { useEffect, useState } from "react";
import { Award } from "lucide-react";
import { get } from "../../api/client";
import { Card, ErrorBox, Loading, PageHeader } from "../../components/ui";

interface Badge {
  code: string;
  name: string;
  min_hours: number;
  icon: string;
  color: string;
  description: string;
  unlocked: boolean;
  current_hours: number;
  progress_pct: number;
}

const COLOR_MAP: Record<string, string> = {
  blue: "from-blue-500 to-indigo-600",
  violet: "from-violet-500 to-purple-600",
  amber: "from-amber-400 to-orange-500",
  emerald: "from-emerald-500 to-teal-600",
};

export default function Badges() {
  const [data, setData] = useState<Badge[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    get<Badge[]>("/student/badges").then(setData).catch((e) => setError(String((e as Error).message || e)));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  const unlocked = data.filter((b) => b.unlocked).length;

  return (
    <div>
      <PageHeader
        title="Huy hiệu năng lực"
        subtitle={`Đã mở khóa ${unlocked}/${data.length} huy hiệu — tích lũy giờ trải nghiệm để thăng cấp (slide 17).`}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-500">Tiến trình tổng</span>
          <span className="font-semibold text-slate-900">
            {unlocked}/{data.length} huy hiệu
          </span>
        </div>
        <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-violet-600"
            style={{ width: `${(unlocked / Math.max(data.length, 1)) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.map((b) => (
          <Card
            key={b.code}
            className={`relative ${b.unlocked ? "border-transparent ring-2 ring-amber-200" : "opacity-90"}`}
          >
            <div
              className={`mx-auto h-16 w-16 rounded-full bg-gradient-to-br ${
                b.unlocked ? COLOR_MAP[b.color] ?? "from-blue-500 to-indigo-600" : "from-slate-200 to-slate-300"
              } flex items-center justify-center text-white shadow-lg`}
            >
              <Award size={28} />
            </div>
            <div className="mt-3 text-center">
              <div className={`font-semibold ${b.unlocked ? "text-slate-900" : "text-slate-500"}`}>
                {b.name}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{b.min_hours}+ giờ trải nghiệm</div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{b.description}</p>
            </div>
            {/* progress */}
            <div className="mt-3">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>
                  {b.unlocked
                    ? "Đã mở khóa 🎉"
                    : `Còn ${Math.max(0, Math.round((b.min_hours - b.current_hours) * 10) / 10)}h nữa`}
                </span>
                <span>{b.progress_pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    b.unlocked ? "bg-gradient-to-r from-amber-400 to-orange-500" : "bg-slate-300"
                  }`}
                  style={{ width: `${b.progress_pct}%` }}
                />
              </div>
            </div>
            {b.unlocked && (
              <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs shadow">
                ✓
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}