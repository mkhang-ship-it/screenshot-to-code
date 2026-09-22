import { useEffect, useState } from "react";
import { CheckCircle2, History, QrCode, ScanLine } from "lucide-react";
import { get, post } from "../../api/client";
import { Card, ErrorBox, Loading, PageHeader } from "../../components/ui";

interface CheckinResult {
  ok: boolean;
  message: string;
  registration_id: number;
  hours: number;
  chk_total: number | null;
}

interface CheckinItem {
  id: number;
  activity: string;
  qr_code: string;
  hours_added: number;
  checked_in_at: string;
}

export default function Checkin() {
  const [qr, setQr] = useState("");
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [history, setHistory] = useState<CheckinItem[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadHistory = () => {
    get<CheckinItem[]>("/student/checkins")
      .then(setHistory)
      .catch(() => setHistory([]));
  };

  useEffect(loadHistory, []);

  const doCheckin = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await post<CheckinResult>(
        `/student/checkin?qr_code=${encodeURIComponent(qr || "DEMO-QR")}`,
        {}
      );
      setResult(res);
      setQr("");
      loadHistory();
    } catch (e) {
      setError(String((e as Error).message || e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Check-in hoạt động"
        subtitle="Quét mã QR tại buổi sinh hoạt để tự động cộng giờ trải nghiệm — thật nhanh, không cần giấy tờ (slide 14)."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <QrCode size={28} />
            </div>
            <h2 className="font-semibold text-slate-900">Quét mã QR</h2>
            <p className="mt-1 text-sm text-slate-500 max-w-sm">
              Dùng camera quét mã QR do giáo viên hiển thị tại buổi sinh hoạt câu lạc bộ / sân chơi.
            </p>

            {/* Mock scanner khung */}
            <div className="mt-5 w-56 h-56 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/40 flex items-center justify-center">
              <ScanLine size={40} className="text-blue-300" />
            </div>

            <input
              value={qr}
              onChange={(e) => setQr(e.target.value)}
              placeholder="Nhập mã QR (demo: bỏ trống rồi bấm)"
              className="mt-5 w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-400"
            />
            <button
              onClick={doCheckin}
              disabled={busy}
              className="mt-3 w-full text-sm py-2.5 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} />
              {busy ? "Đang xác nhận..." : "Check-in ngay"}
            </button>
          </div>
        </Card>

        <div className="space-y-4">
          {error && <ErrorBox message={error} />}
          {result && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                <CheckCircle2 size={18} />
                {result.message}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-white p-3">
                  <div className="text-slate-400 text-xs">Giờ của buổi hôm nay</div>
                  <div className="font-bold text-slate-900">{result.hours}h</div>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <div className="text-slate-400 text-xs">Tổng giờ trải nghiệm</div>
                  <div className="font-bold text-slate-900">{result.chk_total ?? "—"}h</div>
                </div>
              </div>
            </div>
          )}

          <Card>
            <h3 className="font-semibold text-slate-900 mb-2">Cách hoạt động</h3>
            <ol className="space-y-2 text-sm text-slate-600 list-decimal list-inside">
              <li>Giáo viên hiển thị mã QR trên màn hình tại buổi sinh hoạt.</li>
              <li>Học sinh quét mã bằng camera / nhập mã thủ công.</li>
              <li>Hệ thống tự động cộng giờ trải nghiệm vào hồ sơ.</li>
              <li>Giờ tích lũy quy đổi thành huy hiệu Explorer → Innovator → Expert → Master.</li>
            </ol>
          </Card>

          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100">
            <h3 className="font-semibold text-amber-800 mb-1">⚡ Mẹo</h3>
            <p className="text-sm text-amber-700">
              Tham gia đủ 10 buổi/năm và tích lũy 10+ giờ sẽ tự động mở khóa huy hiệu Explorer.
            </p>
          </Card>

          {/* Lịch sử check-in — slide 14 */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <History size={18} className="text-slate-500" />
              <h3 className="font-semibold text-slate-900">Lịch sử check-in</h3>
            </div>
            {!history ? (
              <Loading />
            ) : history.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có lượt check-in nào.</p>
            ) : (
              <ul className="space-y-2 max-h-72 overflow-y-auto">
                {history.map((h) => (
                  <li
                    key={h.id}
                    className="flex items-center justify-between gap-2 text-sm rounded-xl bg-slate-50 px-3 py-2"
                  >
                    <div>
                      <div className="font-medium text-slate-800">{h.activity}</div>
                      <div className="text-xs text-slate-400">
                        {h.checked_in_at} · +{h.hours_added}h
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                      ✓
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}