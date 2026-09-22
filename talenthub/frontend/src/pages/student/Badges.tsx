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

      <div className="rounded-2xl border border-line bg-white p-5 mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted">Tiến trình tổng</span>
          <span className="font-semibold text-ink">
            {unlocked}/{data.length} huy hiệu
          </span>
        </div>
        <div className="h-3 rounded-full bg-canvas-soft overflow-hidden">
          <div
            className="h-full rounded-full hero-gradient"
            style={{ width: `${(unlocked / Math.max(data.length, 1)) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.map((b) =>
          b.unlocked ? (
            <div
              key={b.code}
              className="relative rounded-2xl hero-gradient p-5 text-white shadow-lg flex items-center gap-4"
            >
              <div className="h-16 w-16 shrink-0 rounded-2xl bg-white/20 flex items-center justify-center">
                <Award size={30} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-lg">{b.name}</div>
                <div className="text-sm text-white/85">{b.description}</div>
              </div>
              <span className="shrink-0 rounded-full bg-white/25 px-3 py-1 text-xs font-semibold">
                Đã đạt
              </span>
            </div>
          ) : (
            <Card key={b.code}>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 rounded-2xl bg-canvas-soft text-muted flex items-center justify-center">
                  <Award size={30} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-lg text-ink">{b.name}</div>
                  <div className="text-sm text-muted">
                    {b.min_hours} giờ trải nghiệm — chuyên gia trẻ
                  </div>
                </div>
              </div>
              {/* progress */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted mb-1.5">
                  <span>Tiến độ</span>
                  <span className="font-semibold text-ink">
                    {b.current_hours}/{b.min_hours}h
                  </span>
                </div>
                <div className="h-2 rounded-full bg-canvas-soft overflow-hidden">
                  <div
                    className="h-full rounded-full hero-gradient"
                    style={{ width: `${b.progress_pct}%` }}
                  />
                </div>
              </div>
            </Card>
          )
        )}
      </div>
    </div>
  );
}