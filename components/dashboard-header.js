export default function DashboardHeader() {
  return (
    <header className="glass-card p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 inline-flex rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700">
            Content Research Dashboard
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Viral Youtube Finder
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
            Discover high-performing YouTube titles by topic, estimate viral potential from public
            metrics, and export your research workflow to CSV or XLSX.
          </p>
        </div>
      </div>
    </header>
  );
}
