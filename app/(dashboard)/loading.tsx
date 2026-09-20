export default function DashboardLoading() {
  return (
    <div aria-busy="true" aria-live="polite" className="animate-pulse">
      <span className="sr-only">Loading dashboard</span>
      <div className="h-3 w-24 rounded bg-slate-200" />
      <div className="mt-4 h-9 w-64 max-w-full rounded bg-slate-200" />
      <div className="mt-8 h-48 rounded-2xl border border-slate-200 bg-white" />
    </div>
  );
}
