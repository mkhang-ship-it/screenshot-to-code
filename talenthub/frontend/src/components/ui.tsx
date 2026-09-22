import { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  icon,
  color = "text-blue-600",
}: {
  label: string;
  value: ReactNode;
  delta?: string;
  icon?: ReactNode;
  color?: string;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-500">{label}</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
          {delta && (
            <div className="mt-1 text-xs font-medium text-emerald-600">{delta}</div>
          )}
        </div>
        {icon && (
          <div className={`h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center ${color}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Loading({ label = "Đang tải..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
      {label}
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 p-4 text-sm">
      {message}
    </div>
  );
}

export function useFetch<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  // hook helper — để gọn, ta dùng inline trong từng page thay vì hook riêng.
  void fn;
  void deps;
  return null;
}