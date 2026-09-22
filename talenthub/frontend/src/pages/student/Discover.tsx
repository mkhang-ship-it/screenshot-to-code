import { useEffect, useState } from "react";
import { Brain, Compass } from "lucide-react";
import { get, post } from "../../api/client";
import { Card, ErrorBox, Loading, PageHeader } from "../../components/ui";

interface Assessment {
  test_type: string;
  result: string;
  date: string;
}

const TEST_NAMES: Record<string, string> = {
  holland: "Holland (Nghề nghiệp)",
  disc: "DISC (Tính cách)",
  mbti: "MBTI (Tính cách)",
  mi: "MI (Đa trí thông minh)",
};

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
        subtitle="Bộ test khoa học giúp học sinh khám phá điểm mạnh, tiềm ẩn và định hướng phát triển (slide 12)."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {Object.entries(TEST_NAMES).map(([key, name]) => {
          const done = data.some((a) => a.test_type === key);
          const expanded = open === key;
          return (
            <Card key={key} className={done ? "border-emerald-200" : ""}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Brain size={18} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-800 text-sm">{name}</div>
                  <div className="text-xs text-slate-500">
                    {done ? "✅ Đã hoàn thành" : "Khoảng 15 phút"}
                  </div>
                </div>
                {done ? (
                  <button
                    onClick={() => setOpen(expanded ? null : key)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    {expanded ? "Thu gọn" : "Xem lại"}
                  </button>
                ) : (
                  <button
                    onClick={() => submitDemo(key)}
                    disabled={busy === key}
                    className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    title="Lưu kết quả tự đánh giá demo để trải nghiệm luồng"
                  >
                    {busy === key ? "Đang lưu..." : "Làm bài demo"}
                  </button>
                )}
              </div>
              {expanded && done && (
                <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
                  {(() => {
                    const a = data.find((x) => x.test_type === key)!;
                    const { lines, isDemo } = prettyResult(a.result);
                    return (
                      <>
                        {isDemo && (
                          <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium mb-1">
                            Kết quả demo
                          </span>
                        )}
                        {lines.map((l, i) => (
                          <div key={i}>{l}</div>
                        ))}
                        <div className="text-slate-400">Ngày {a.date}</div>
                      </>
                    );
                  })()}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
        <Compass size={18} className="text-violet-600" /> Kết quả đã thực hiện
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.length === 0 && (
          <Card>
            <p className="text-sm text-slate-500">
              Chưa có kết quả bài test — hoàn thành bài khảo sát để AI phân tích điểm mạnh của bạn.
            </p>
          </Card>
        )}
        {data.map((a, i) => (
          <Card key={i}>
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">
              {TEST_NAMES[a.test_type] ?? a.test_type}
            </div>
            <div className="text-sm text-slate-700 font-medium">{a.result}</div>
            <div className="text-xs text-slate-400 mt-1">Ngày {a.date}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}