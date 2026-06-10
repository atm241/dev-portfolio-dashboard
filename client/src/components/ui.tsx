import type { ReactNode } from 'react';

export function Card({ title, children, action }: { title?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-xl border border-edge bg-card p-5">
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-dim">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg bg-surface px-4 py-3">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-ink-dim">{label}</div>
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-8">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-edge border-t-accent" />
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return <p className="rounded-lg bg-red-950/50 px-4 py-3 text-sm text-red-300">{message}</p>;
}

export function timeAgo(iso: string | number): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 3600) return `${Math.max(1, Math.floor(seconds / 60))}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
