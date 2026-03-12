"use client";

export default function ExportButtons({ disabled, onExportCSV, onExportXLSX }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onExportCSV}
        disabled={disabled}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Export CSV
      </button>
      <button
        type="button"
        onClick={onExportXLSX}
        disabled={disabled}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Export XLSX
      </button>
    </div>
  );
}
