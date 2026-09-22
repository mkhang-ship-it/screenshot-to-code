import { useEffect, useState } from "react";
import { FileText, Star } from "lucide-react";
import { get } from "../../api/client";
import { Card, ErrorBox, Loading, PageHeader } from "../../components/ui";

interface Profile {
  full_name: string;
  class_name: string;
  grade: number;
  talent_score: number;
  experience_hours: number;
  interests: string | null;
  bio: string | null;
  skills: { code: string; name: string; level: number }[];
  badges: { code: string; name: string; icon: string; color: string }[];
  evaluation_count: number;
  certificates: { title: string; issuer: string; issued_at: string | null }[];
  projects: { id: number; title: string; field: string; status: string; role: string }[];
}

interface Evaluation {
  id: number;
  activity: string;
  reviewer: string;
  criteria: { name: string; score: number; max: number }[];
  total: number;
  xep_loai: string;
  comment: string | null;
  date: string;
}

export default function Profile() {
  const [data, setData] = useState<Profile | null>(null);
  const [evals, setEvals] = useState<Evaluation[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    get<Profile>("/student/profile").then(setData).catch((e) => setError(String(e.message || e)));
    get<Evaluation[]>("/student/evaluations").then(setEvals).catch(() => setEvals([]));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  return (
    <div>
      <PageHeader title="Hồ sơ năng lực" subtitle="Thông tin cá nhân, năng lực, thành tích, chứng chỉ và dự án (slide 11)." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thông tin cá nhân */}
        <Card>
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
              {data.full_name.charAt(0)}
            </div>
            <h2 className="mt-3 text-lg font-bold text-slate-900">{data.full_name}</h2>
            <p className="text-sm text-slate-500">
              Lớp {data.class_name} · Khối {data.grade}
            </p>
            <div className="mt-4 w-full grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-amber-50 p-2">
                <div className="text-lg font-bold text-amber-600">{data.talent_score}</div>
                <div className="text-[11px] text-slate-500">Điểm năng lực</div>
              </div>
              <div className="rounded-xl bg-blue-50 p-2">
                <div className="text-lg font-bold text-blue-600">{data.experience_hours}h</div>
                <div className="text-[11px] text-slate-500">Trải nghiệm</div>
              </div>
              <div className="rounded-xl bg-violet-50 p-2">
                <div className="text-lg font-bold text-violet-600">{data.evaluation_count}</div>
                <div className="text-[11px] text-slate-500">Đánh giá</div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-600">
            <div className="font-medium mb-1">Sở thích</div>
            <p className="text-slate-500">{data.interests ?? "—"}</p>
            <div className="font-medium mt-3 mb-1">Giới thiệu</div>
            <p className="text-slate-500">{data.bio ?? "—"}</p>
          </div>
        </Card>

        {/* Kỹ năng */}
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={18} className="text-blue-600" />
            <h2 className="font-semibold text-slate-900">Kỹ năng năng lực</h2>
          </div>
          <div className="space-y-3">
            {data.skills.map((s) => (
              <div key={s.code}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{s.name}</span>
                  <span className="text-slate-500">{s.level}/10</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                    style={{ width: `${Math.min(100, s.level * 10)}%` }}
                  />
                </div>
              </div>
            ))}
            {data.skills.length === 0 && (
              <p className="text-sm text-slate-500">Chưa có kỹ năng được đánh giá.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Đánh giá từ GV/HLV — slide 15 */}
      <div className="mt-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Star size={18} className="text-amber-500" />
            <h2 className="font-semibold text-slate-900">Đánh giá từ giáo viên & huấn luyện viên</h2>
          </div>
          {!evals ? (
            <Loading />
          ) : evals.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có đánh giá nào được công bố.</p>
          ) : (
            <div className="space-y-4">
              {evals.map((ev) => (
                <div key={ev.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-slate-800">{ev.activity}</div>
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 font-medium">
                      {ev.total}/100 · {ev.xep_loai}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ev.criteria.map((c) => (
                      <div key={c.name} className="text-xs">
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-600">{c.name}</span>
                          <span className="font-medium text-slate-800">
                            {c.score}/{c.max}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${Math.min(100, (c.score / c.max) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {ev.comment && (
                    <p className="mt-3 text-sm text-slate-600 italic">“{ev.comment}”</p>
                  )}
                  <div className="mt-2 text-xs text-slate-400">
                    {ev.reviewer} · {ev.date}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Chứng chỉ & Dự án — slide 11 */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-slate-900 mb-3">Chứng chỉ</h2>
          {data.certificates.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có chứng chỉ nào.</p>
          ) : (
            <ul className="space-y-2">
              {data.certificates.map((c, i) => (
                <li key={i} className="text-sm rounded-xl bg-violet-50 p-3">
                  <div className="font-medium text-slate-800">{c.title}</div>
                  <div className="text-xs text-slate-500">
                    {c.issuer}
                    {c.issued_at ? ` · ${c.issued_at}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="font-semibold text-slate-900 mb-3">Dự án đã tham gia</h2>
          {data.projects.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa tham gia dự án nào.</p>
          ) : (
            <ul className="space-y-2">
              {data.projects.map((p) => (
                <li key={p.id} className="text-sm rounded-xl bg-blue-50 p-3">
                  <div className="font-medium text-slate-800">{p.title}</div>
                  <div className="text-xs text-slate-500">
                    {p.field} · {p.status} · {p.role === "owner" ? "Chủ nhiệm" : "Thành viên"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}