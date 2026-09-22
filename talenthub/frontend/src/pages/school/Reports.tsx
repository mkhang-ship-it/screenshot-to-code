import { useEffect, useState } from "react";
import { Award, Download, FileSpreadsheet, FileText, Users } from "lucide-react";
import { get } from "../../api/client";
import { Card, ErrorBox, Loading, PageHeader } from "../../components/ui";

interface ReportRow {
  id: number;
  full_name: string;
  class_name: string;
  grade: number;
  talent_score: number;
  experience_hours: number;
}

function toCsv(rows: ReportRow[]): string {
  const header = "STT,Ho ten,Lop,Khoi,Diem nang luc,Gio trai nghiem";
  const lines = rows.map((r, i) =>
    [i + 1, r.full_name, r.class_name, r.grade, r.talent_score, r.experience_hours].join(",")
  );
  return "\ufeff" + [header, ...lines].join("\n");
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [data, setData] = useState<ReportRow[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    get<ReportRow[]>("/school/reports").then(setData).catch((e) => setError(String((e as Error).message || e)));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  const today = new Date().toLocaleDateString("vi-VN");
  const grades = [...new Set(data.map((r) => r.grade))].sort();
  const top10 = [...data].sort((a, b) => b.talent_score - a.talent_score).slice(0, 10);

  const presets: { icon: React.ReactNode; iconBg: string; title: string; rows: ReportRow[]; file: string }[] = [
    {
      icon: <Users size={20} className="text-white" />,
      iconBg: "bg-violet-600",
      title: "Báo cáo năng lực toàn trường",
      rows: data,
      file: "bao-cao-nang-luc-toan-truong",
    },
    ...grades.map((g) => ({
      icon: <FileSpreadsheet size={20} className="text-white" />,
      iconBg: "bg-orange-500",
      title: `Phân tích năng khiếu khối ${g}`,
      rows: data.filter((r) => r.grade === g),
      file: `bao-cao-khoi-${g}`,
    })),
    {
      icon: <Award size={20} className="text-white" />,
      iconBg: "bg-emerald-600",
      title: "Top 10 học sinh tiêu biểu",
      rows: top10,
      file: "bao-cao-top-10",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Báo cáo"
        subtitle="Tải về các báo cáo định kỳ và tổng kết nhanh chóng, dễ dàng (slide 26)."
      />

      <div className="space-y-4">
        {presets.map((p) => (
          <Card key={p.title}>
            <div className="flex items-center gap-4 flex-wrap">
              <div className={`h-11 w-11 rounded-full ${p.iconBg} flex items-center justify-center shrink-0`}>
                {p.icon}
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="font-semibold text-slate-900">{p.title}</div>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>{today}</span>
                  <span>•</span>
                  <span className="font-medium text-slate-500">CSV</span>
                  <span>•</span>
                  <span className="font-medium text-slate-500">JSON</span>
                  <span>•</span>
                  <span>{p.rows.length} học sinh</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => download(new Blob([JSON.stringify(p.rows, null, 2)], { type: "application/json" }), `${p.file}.json`)}
                  className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                >
                  <Download size={14} /> JSON
                </button>
                <button
                  onClick={() => download(new Blob([toCsv(p.rows)], { type: "text/csv;charset=utf-8" }), `${p.file}.csv`)}
                  className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 font-medium"
                >
                  <Download size={14} /> Tải về
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 text-xs text-slate-400 flex items-center gap-1.5">
        <FileText size={13} />
        Dữ liệu lấy từ API /school/reports — xuất CSV (Excel đọc được, UTF-8 BOM) hoặc JSON.
      </div>
    </div>
  );
}
