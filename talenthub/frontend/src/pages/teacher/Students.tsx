import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { get } from "../../api/client";
import { Card, ErrorBox, Loading, PageHeader } from "../../components/ui";

interface TeacherInfo {
  id: number;
  full_name: string;
}

interface StudentRow {
  student_id: number;
  full_name: string;
  class_name: string;
  hours: number;
  talent_score: number;
  activity_count: number;
}

interface Response {
  teacher: TeacherInfo;
  total: number;
  students: StudentRow[];
}

export default function Students() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<Response | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    get<Response>("/teacher/my-students")
      .then(setData)
      .catch((e) => setError(String((e as Error).message || e)));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  const q = (params.get("q") ?? "").toLowerCase();
  const filtered = data.students.filter(
    (s) => !q || s.full_name.toLowerCase().includes(q) || s.class_name.toLowerCase().includes(q)
  );

  return (
    <div>
      <PageHeader
        title="Học viên của tôi"
        subtitle={`${data.total} học viên từ các sân chơi thầy/cô phụ trách — điểm năng lực, giờ trải nghiệm và nhận xét (slide 23).`}
        actions={
          <div className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2">
            <Search size={15} className="text-slate-400" />
            <input
              value={params.get("q") ?? ""}
              onChange={(e) => {
                const next = new URLSearchParams(params);
                if (e.target.value) next.set("q", e.target.value);
                else next.delete("q");
                setParams(next, { replace: true });
              }}
              placeholder="Tìm theo tên / lớp..."
              className="text-sm outline-none w-44"
            />
          </div>
        }
      />

      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 bg-slate-50/60">
              <th className="px-5 py-3">Học viên</th>
              <th className="px-5 py-3">Lớp</th>
              <th className="px-5 py-3 text-center">Sân chơi tham gia</th>
              <th className="px-5 py-3 text-center">Giờ trải nghiệm</th>
              <th className="px-5 py-3 text-center">Điểm năng lực</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                  Không tìm thấy học viên phù hợp.
                </td>
              </tr>
            )}
            {filtered.map((s) => (
              <tr key={s.student_id} className="border-b border-slate-100 hover:bg-slate-50/60">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {s.full_name.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-800">{s.full_name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-500">{s.class_name}</td>
                <td className="px-5 py-3 text-center">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-violet-50 text-violet-700">
                    {s.activity_count} sân chơi
                  </span>
                </td>
                <td className="px-5 py-3 text-center font-medium">{s.hours}h</td>
                <td className="px-5 py-3 text-center">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      s.talent_score >= 80
                        ? "bg-amber-50 text-amber-700"
                        : s.talent_score >= 70
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {s.talent_score}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}