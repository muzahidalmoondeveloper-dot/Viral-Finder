"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardHeader from "@/components/dashboard-header";
import SearchForm from "@/components/search-form";
import TitleInsightsPanel from "@/components/title-insights-panel";
import ResultsTable from "@/components/results-table";
import ExportButtons from "@/components/export-buttons";
import { DEFAULT_MAX_RESULTS, SORT_OPTIONS } from "@/lib/constants";
import { generateTitleInsights } from "@/lib/title-insights";
import { exportResultsToCSV, exportResultsToXLSX } from "@/lib/export-data";

const HISTORY_KEY = "yt-viral-finder-history";
const HISTORY_LIMIT = 8;

const defaultFilters = {
  topic: "",
  contentType: "videos",
  maxResults: DEFAULT_MAX_RESULTS,
  sortBy: SORT_OPTIONS.VIRAL,
  startDate: "",
  endDate: ""
};

export default function HomePage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [results, setResults] = useState([]);
  const [visibleResults, setVisibleResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const insights = useMemo(
    () => generateTitleInsights(visibleResults.length ? visibleResults : results, filters.topic),
    [filters.topic, results, visibleResults]
  );

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(HISTORY_KEY);

      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        setHistory(parsed.slice(0, HISTORY_LIMIT));
      }
    } catch {
      setHistory([]);
    }
  }, []);

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const saveHistory = (nextEntry) => {
    setHistory((current) => {
      const merged = [
        nextEntry,
        ...current.filter((item) => JSON.stringify(item) !== JSON.stringify(nextEntry))
      ].slice(0, HISTORY_LIMIT);

      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(merged));
      return merged;
    });
  };

  const runSearch = async (override) => {
    const payload = {
      ...filters,
      ...override,
      maxResults: Number(override?.maxResults ?? filters.maxResults)
    };

    if (!payload.topic.trim()) {
      setError("Please enter a topic keyword.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Search failed.");
      }

      const nextResults = data.results || [];
      setResults(nextResults);
      setVisibleResults(nextResults);
      setMessage(
        nextResults.length
          ? `Found ${nextResults.length} result${nextResults.length > 1 ? "s" : ""}.`
          : "No results matched your filters. Try a broader topic."
      );

      saveHistory({
        topic: payload.topic,
        contentType: payload.contentType,
        maxResults: payload.maxResults,
        sortBy: payload.sortBy,
        startDate: payload.startDate,
        endDate: payload.endDate
      });
    } catch (requestError) {
      setResults([]);
      setVisibleResults([]);
      setError(requestError.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const useHistoryEntry = (entry) => {
    setFilters(entry);
    runSearch(entry);
  };

  const exportCsv = () => {
    try {
      exportResultsToCSV(visibleResults);
      setMessage("CSV exported successfully.");
      setError("");
    } catch (exportError) {
      setError(exportError.message);
    }
  };

  const exportXlsx = () => {
    try {
      exportResultsToXLSX(visibleResults);
      setMessage("XLSX exported successfully.");
      setError("");
    } catch (exportError) {
      setError(exportError.message);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col gap-5 p-4 pb-12 sm:gap-6 sm:p-6 lg:p-8">
      <DashboardHeader />

      <SearchForm
        values={filters}
        loading={loading}
        history={history}
        onChange={updateFilter}
        onSubmit={runSearch}
        onUseHistory={useHistoryEntry}
      />

      {message ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}

      <TitleInsightsPanel insights={insights} topic={filters.topic} hasResults={results.length > 0} />

      <section className="glass-card p-5 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900">Search Results</h2>
            <p className="text-sm text-slate-600">
              Sort inside the table by clicking any sortable column.
            </p>
          </div>
          <ExportButtons
            disabled={loading || visibleResults.length === 0}
            onExportCSV={exportCsv}
            onExportXLSX={exportXlsx}
          />
        </div>

        <ResultsTable
          results={results}
          loading={loading}
          error={error}
          onVisibleResultsChange={setVisibleResults}
          sortBy={filters.sortBy}
        />
      </section>
    </main>
  );
}
