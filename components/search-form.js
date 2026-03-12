"use client";

import { CONTENT_TYPE, SORT_OPTIONS } from "@/lib/constants";

const SORT_LABELS = {
  [SORT_OPTIONS.VIRAL]: "Viral Score",
  [SORT_OPTIONS.VIEWS]: "Views",
  [SORT_OPTIONS.NEWEST]: "Newest",
  [SORT_OPTIONS.ENGAGEMENT]: "Most Engaged"
};

export default function SearchForm({
  values,
  loading,
  history,
  onChange,
  onSubmit,
  onUseHistory
}) {
  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    onChange(name, value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <section className="glass-card p-5 sm:p-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="xl:col-span-2">
            <label className="label" htmlFor="topic">
              Topic Keyword
            </label>
            <input
              id="topic"
              className="field"
              type="text"
              name="topic"
              placeholder="e.g. faceless YouTube automation"
              value={values.topic}
              onChange={handleFieldChange}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="contentType">
              Content Type
            </label>
            <select
              id="contentType"
              className="field"
              name="contentType"
              value={values.contentType}
              onChange={handleFieldChange}
            >
              <option value={CONTENT_TYPE.SHORTS}>Shorts</option>
              <option value={CONTENT_TYPE.VIDEOS}>Videos</option>
            </select>
          </div>

          <div>
            <label className="label" htmlFor="maxResults">
              Max Results
            </label>
            <input
              id="maxResults"
              className="field"
              type="number"
              min={1}
              max={50}
              name="maxResults"
              value={values.maxResults}
              onChange={handleFieldChange}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="label" htmlFor="sortBy">
              Sort By
            </label>
            <select
              id="sortBy"
              className="field"
              name="sortBy"
              value={values.sortBy}
              onChange={handleFieldChange}
            >
              {Object.entries(SORT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="startDate">
              Start Date (Optional)
            </label>
            <input
              id="startDate"
              className="field"
              type="date"
              name="startDate"
              value={values.startDate}
              onChange={handleFieldChange}
            />
          </div>

          <div>
            <label className="label" htmlFor="endDate">
              End Date (Optional)
            </label>
            <input
              id="endDate"
              className="field"
              type="date"
              name="endDate"
              value={values.endDate}
              onChange={handleFieldChange}
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Searching..." : "Search Viral Titles"}
            </button>
          </div>
        </div>

        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Watch time and watch hours are shown as &quot;Not available from public YouTube API&quot;
          because those metrics are not publicly exposed for arbitrary channels.
        </p>
      </form>

      {history.length > 0 ? (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Recent Searches
          </p>
          <div className="flex flex-wrap gap-2">
            {history.map((item, index) => (
              <button
                key={`${item.topic}-${index}`}
                className="chip hover:border-slate-300 hover:bg-slate-50"
                type="button"
                onClick={() => onUseHistory(item)}
              >
                {item.topic} · {item.contentType}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
