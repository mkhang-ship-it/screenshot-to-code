import { useEffect, useState } from "react";
import { Brain, Compass, Lightbulb } from "lucide-react";
import { get, post } from "../../api/client";
import { Card, ErrorBox, Loading, PageHeader } from "../../components/ui";

interface Assessment {
  test_type: string;
  result: string;
  date: string;
}

const TESTS: { key: string; name: string; desc: string; chip: string }[] = [
  { key: "holland", name: "Holland", desc: "Khám phá định hướng nghề nghiệp", chip: "bg-gradient-to-br from-orange-400 to-orange-600" },
  { key: "mbti", name: "MBTI", desc: "16 loại nhân cách", chip: "bg-gradient-to-br from-violet-500 to-purple-700" },
  { key: "disc", name: "DISC", desc: "Hành vi & phong cách giao tiếp", chip: "bg-gradient-to-br from-pink-500 to-rose-600" },
  { key: "mi", name: "Multiple Intelligence", desc: "8 dạng trí thông minh", chip: "bg-gradient-to-br from-amber-400 to-orange-600" },
];

const SUMMARY_BARS = [
  { label: "Kỹ thuật", pct: 40 },
  { label: "Kinh doanh", pct: 30 },
  { label: "Học thuật", pct: 20 },
  { label: "Nghệ thuật", pct: 10 },
];

const DEMO_RESULTS: Record<string, string> = {
  mbti: '{"type": "ENFJ", "note": "Kết quả demo tự đánh giá"}',
  mi: '{"top": ["Logic-Toán học", "Không gian"], "note": "Kết quả demo tự đánh giá"}',
};

function prettyResult(raw: string): { lines: string[]; isDemo: boolean } {
  try {
    const obj = JSON.parse(raw) as Record<string, unknown>;
    const lines = Object.entries(obj)
      .slice(0, 6)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`);
    return { lines, isDemo: (obj as Record<string, unknown>).note === "Kết quả demo tự đánh giá" };
  } catch {
    return { lines: [raw], isDemo: false };
  }
}

export default function Discover() {
  const [data, setData] = useState<Assessment[] | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState("");

  const load = () => {
    get<Assessment[]>("/student/assessments")
      .then(setData)
      .catch((e) => setError(String(e.message || e)));
  };

  useEffect(load, []);

  const submitDemo = async (testType: string) => {
    setBusy(testType);
    setError("");
    try {
      await post("/student/assessments?student_id=1", {
        test_type: testType,
        result: DEMO_RESULTS[testType] ?? '{"note": "Kết quả demo tự đánh giá"}',
      });
      load();
      setOpen(testType);
    } catch (e) {
      setError(String((e as Error).message || e));
    } finally {
      setBusy("");
    }
  };

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Khám phá năng khiếu"
        subtitle="Bộ test khoa học giúp bạn hiểu chính mình hơn (slide 12)."
      />

      {/* 4 thẻ bài test (slide 12) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {TESTS.map((t) => {
          const done = data.some((a) => a.test_type === t.key);
          const expanded = open === t.key;
          return (
            <Card key={t.key} className="text-center">
              <div className={`mx-auto h-12 w-12 rounded-2xl ${t.chip} text-white flex items-center justify-center shadow`}>
                <Brain size={22} />
              </div>
              <div className="mt-2 font-bold text-ink text-sm">{t.name}</div>
              <div className="text-xs text-muted mt-0.5 min-h-8">{t.desc}</div>
              {done ? (
                <button
                  onClick={() => setOpen(expanded ? null : t.key)}
                  className="mt-3 w-full text-xs px-3 py-2 rounded-full bg-canvas-soft text-ink font-semibold hover:bg-line"
                >
                  {expanded ? "Thu gọn" : "Xem kết quả"}
                </button>
              ) : (
                <button
                  onClick={() => submitDemo(t.key)}
                  disabled={busy === t.key}
                  className="mt-3 w-full text-xs px-3 py-2 rounded-full cta-gradient text-white font-semibold disabled:opacity-50"
                  title="Lưu kết quả tự đánh giá demo để trải nghiệm luồng"
                >
                  {busy === t.key ? "Đang lưu..." : "Bắt đầu test"}
                </button>
              )}
              {expanded && done && (
                <div className="mt-3 rounded-xl bg-canvas-soft p-3 text-xs text-muted space-y-1 text-left">
                  {(() => {
                    const a = data.find((x) => x.test_type === t.key)!;
                    const { lines, isDemo } = prettyResult(a.result);
                    return (
                      <>
                        {isDemo && (
                          <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-portal-soft text-portal-dark font-medium mb-1">
                            Kết quả demo
                          </span>
                        )}
                        {lines.map((l, i) => (
                          <div key={i}>{l}</div>
                        ))}
                        <div className="text-muted-light">Ngày {a.date}</div>
                      </>
                    );
                  })()}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kết quả đã thực hiện */}
        <Card>
          <h2 className="text-lg font-semibold text-ink mb-1 flex items-center gap-2">
            <Compass size={18} className="text-portal" /> Bản đồ năng khiếu
          </h2>
          <p className="text-xs text-muted mb-4">Đa trí thông minh — Multiple Intelligence</p>
          {data.length === 0 ? (
            <p className="text-sm text-muted">
              Chưa có kết quả bài test — hoàn thành bài khảo sát để AI phân tích điểm mạnh của bạn.
            </p>
          ) : (
            <div className="space-y-3">
              {data.map((a, i) => {
                const { lines, isDemo } = prettyResult(a.result);
                return (
                  <div key={i} className="rounded-xl border border-line p-3">
                    <div className="text-xs text-muted uppercase tracking-wider mb-1">
                      {TESTS.find((t) => t.key === a.test_type)?.name ?? a.test_type}
                    </div>
                    {isDemo && (
                      <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-portal-soft text-portal-dark font-medium mb-1">
                        Kết quả demo
                      </span>
                    )}
                    {lines.map((l, j) => (
                      <div key={j} className="text-sm text-ink font-medium">{l}</div>
                    ))}
                    <div className="text-xs text-muted-light mt-1">Ngày {a.date}</div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Định hướng của bạn — thẻ gradient (slide 12) */}
        <div className="rounded-2xl hero-gradient p-5 text-white shadow-lg">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-white/70">
            Kết quả tổng hợp
          </div>
          <h2 className="text-lg font-bold mt-0.5 mb-4">Định hướng của bạn</h2>
          <div className="space-y-3">
            {SUMMARY_BARS.map((b) => (
              <div key={b.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{b.label}</span>
                  <span className="font-semibold">{b.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/25 overflow-hidden">
                  <div className="h-full rounded-full bg-white" style={{ width: `${b.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banner điểm khởi đầu (slide 12) */}
      <Card className="mt-6">
        <div className="flex items-center gap-4">
          <span className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-700 text-white flex items-center justify-center">
            <Lightbulb size={22} />
          </span>
          <div>
            <div className="font-bold text-ink">Kết quả chỉ là điểm khởi đầu</div>
            <p className="text-sm text-muted">
              Hãy tiếp tục khám phá, rèn luyện và trải nghiệm để phát triển toàn diện tiềm năng của bạn!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
