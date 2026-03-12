export default function TitleInsightsPanel({ insights, topic, hasResults }) {
  return (
    <section className="glass-card p-5 sm:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-900">Title Insights</h2>
          <p className="text-sm text-slate-600">
            AI-friendly pattern analysis from top viral matches{topic ? ` for "${topic}"` : ""}.
          </p>
        </div>
      </div>

      {!hasResults ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 py-3 text-sm text-slate-500">
          Search a topic to generate title patterns, hooks, power words, and inspiration ideas.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <InsightList title="Top Recurring Patterns" items={insights.recurringPatterns} />
          <InsightList title="Common Hooks" items={insights.commonHooks} />
          <InsightList title="Power Words" items={insights.commonPowerWords} />
          <InsightList title="Likely High-Performing Title Structures" items={insights.titleIdeas} />
        </div>
      )}
    </section>
  );
}

function InsightList({ title, items }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/90 p-4">
      <h3 className="mb-2 text-sm font-semibold text-slate-800">{title}</h3>
      {items?.length ? (
        <ul className="space-y-1 text-sm text-slate-600">
          {items.map((item) => (
            <li key={item} className="rounded-md bg-slate-50 px-2 py-1">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">No strong signal yet.</p>
      )}
    </div>
  );
}
