import { useEffect, useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { get, post } from "../../api/client";
import { Card, ErrorBox, Loading, PageHeader } from "../../components/ui";

interface Activity {
  id: number;
  title: string;
  field: string;
}

interface Student {
  registration_id: number;
  student_id: number;
  full_name: string;
  class_name: string;
  hours: number;
  role: string;
}

const CRITERIA = [
  { key: "chuyen_mon", label: "Chuyên môn", max: 40, hint: "Kiến thức, kỹ năng, chất lượng sản phẩm" },
  { key: "sang_tao", label: "Sáng tạo", max: 20, hint: "Ý tưởng mới, cách tiếp cận khác biệt" },
  { key: "lam_viec_nhom", label: "Làm việc nhóm", max: 20, hint: "Phối hợp, hỗ trợ, giao tiếp trong nhóm" },
  { key: "ky_luat", label: "Kỷ luật", max: 20, hint: "Đúng giờ, thái độ, hoàn thành nhiệm vụ" },
] as const;

type Criterion = (typeof CRITERIA)[number]["key"];

export default function Grading() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityId, setActivityId] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState("");
  const [scores, setScores] = useState<Record<number, Record<Criterion, number>>>({});
  const [comment, setComment] = useState<Record<number, string>>({});
  const [okMsg, setOkMsg] = useState("");

  useEffect(() => {
    get<Activity[]>("/teacher/activities").then((d) => {
      setActivities(d);
      if (d.length > 0) setActivityId(d[0].id);
    }).catch((e) => setError(String((e as Error).message || e)));
  }, []);

  useEffect(() => {
    if (!activityId) return;
    get<Student[]>(`/teacher/activities/${activityId}/students`)
      .then(setStudents)
      .catch(() => setStudents([]));
  }, [activityId]);

  const submit = async (s: Student) => {
    const sc = scores[s.registration_id] ?? { chuyen_mon: 0, sang_tao: 0, lam_viec_nhom: 0, ky_luat: 0 };
    await post("/teacher/evaluations", {
      activity_id: activityId,
      student_id: s.student_id,
      chuyen_mon: sc.chuyen_mon,
      sang_tao: sc.sang_tao,
      lam_viec_nhom: sc.lam_viec_nhom,
      ky_luat: sc.ky_luat,
      comment: comment[s.registration_id] ?? "",
    });
    setOkMsg(`Đã lưu điểm cho ${s.full_name}`);
    setTimeout(() => setOkMsg(""), 2500);
  };

  if (error) return <ErrorBox message={error} />;

  const total = (s: Student) => {
    const sc = scores[s.registration_id] ?? { chuyen_mon: 0, sang_tao: 0, lam_viec_nhom: 0, ky_luat: 0 };
    return CRITERIA.reduce((sum, c) => sum + (sc[c.key] || 0), 0);
  };

  return (
    <div>
      <PageHeader
        title="Chấm điểm rubric"
        subtitle="Chấm theo 4 tiêu chí: Chuyên môn 40 · Sáng tạo 20 · Làm việc nhóm 20 · Kỷ luật 20 (slide 22)."
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-slate-600">Sân chơi:</span>
        <select
          value={activityId ?? ""}
          onChange={(e) => setActivityId(Number(e.target.value))}
          className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
        >
          {activities.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title}
            </option>
          ))}
        </select>
        {okMsg && <span className="text-sm text-emerald-600 font-medium">{okMsg}</span>}
      </div>

      {students.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500">Sân chơi này chưa có học viên đăng ký.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-white rounded-2xl border border-slate-200 shadow-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="px-4 py-3">Học viên</th>
                {CRITERIA.map((c) => (
                  <th key={c.key} className="px-3 py-3 text-center">
                    {c.label}
                    <div className="text-[10px] text-slate-300 font-normal">{c.max} điểm</div>
                  </th>
                ))}
                <th className="px-3 py-3 text-center">Tổng</th>
                <th className="px-3 py-3">Nhận xét</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const sc = scores[s.registration_id] ?? { chuyen_mon: 0, sang_tao: 0, lam_viec_nhom: 0, ky_luat: 0 };
                return (
                  <tr key={s.registration_id} className="border-b border-slate-100">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{s.full_name}</div>
                      <div className="text-xs text-slate-400">
                        {s.class_name} · {s.hours}h
                      </div>
                    </td>
                    {CRITERIA.map((c) => (
                      <td key={c.key} className="px-3 py-3 text-center" title={c.hint}>
                        <input
                          type="number"
                          min={0}
                          max={c.max}
                          value={sc[c.key] || ""}
                          placeholder="0"
                          onChange={(e) =>
                            setScores({
                              ...scores,
                              [s.registration_id]: {
                                ...sc,
                                [c.key]: Math.min(c.max, Math.max(0, Number(e.target.value))),
                              },
                            })
                          }
                          className="w-16 text-center px-2 py-1.5 rounded-lg border border-slate-200 outline-none focus:border-blue-400"
                        />
                      </td>
                    ))}
                    <td className="px-3 py-3 text-center font-bold text-slate-900">{total(s)}</td>
                    <td className="px-3 py-3">
                      <input
                        value={comment[s.registration_id] ?? ""}
                        onChange={(e) => setComment({ ...comment, [s.registration_id]: e.target.value })}
                        placeholder="Nhận xét..."
                        className="w-44 px-2 py-1.5 rounded-lg border border-slate-200 text-xs outline-none focus:border-blue-400"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => submit(s)}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <ClipboardCheck size={13} /> Lưu
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}