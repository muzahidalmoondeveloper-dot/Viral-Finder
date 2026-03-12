"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import Image from "next/image";
import { formatDate, formatNumber } from "@/lib/formatters";

const PAGE_SIZE = 10;

const COLUMNS = [
  { key: "thumbnailUrl", label: "Thumbnail", sortable: false },
  { key: "title", label: "Title", sortable: true },
  { key: "url", label: "Video URL", sortable: false },
  { key: "channelTitle", label: "Channel", sortable: true },
  { key: "publishedAt", label: "Publish Date", sortable: true },
  { key: "viewCount", label: "Views", sortable: true },
  { key: "likeCount", label: "Likes", sortable: true },
  { key: "commentCount", label: "Comments", sortable: true },
  { key: "durationSeconds", label: "Duration", sortable: true },
  { key: "inferredContentType", label: "Type", sortable: true },
  { key: "viralScore", label: "Viral Score", sortable: true },
  { key: "watchTime", label: "Watch Time", sortable: false },
  { key: "watchHours", label: "Watch Hours", sortable: false }
];

export default function ResultsTable({ results, loading, error, onVisibleResultsChange }) {
  const [sortConfig, setSortConfig] = useState({ key: "viralScore", direction: "desc" });
  const [page, setPage] = useState(1);
  const [copyMessage, setCopyMessage] = useState("");

  const sortedResults = useMemo(() => {
    const items = [...results];
    const { key, direction } = sortConfig;

    items.sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      if (key === "publishedAt") {
        const delta = new Date(aValue).getTime() - new Date(bValue).getTime();
        return direction === "asc" ? delta : -delta;
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      const compare = String(aValue || "").localeCompare(String(bValue || ""));
      return direction === "asc" ? compare : -compare;
    });

    return items;
  }, [results, sortConfig]);

  useEffect(() => {
    setPage(1);
  }, [results]);

  useEffect(() => {
    onVisibleResultsChange(sortedResults);
  }, [onVisibleResultsChange, sortedResults]);

  const totalPages = Math.max(1, Math.ceil(sortedResults.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedResults = sortedResults.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const toggleSort = (key) => {
    setSortConfig((current) => {
      if (current.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "desc" };
    });
  };

  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyMessage("Link copied.");
      setTimeout(() => setCopyMessage(""), 1600);
    } catch {
      setCopyMessage("Could not copy link.");
      setTimeout(() => setCopyMessage(""), 1800);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-44 items-center justify-center rounded-xl border border-slate-200 bg-white/70">
        <div className="text-sm font-medium text-slate-600">Loading viral results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
    );
  }

  if (!results.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-500">
        No results yet. Enter a topic and run a search.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-[1500px] divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {COLUMNS.map((column) => (
                <th key={column.key} className="px-3 py-3 text-left">
                  {column.sortable ? (
                    <button className="table-head-btn" type="button" onClick={() => toggleSort(column.key)}>
                      {column.label}
                      {sortConfig.key === column.key ? (
                        <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                      ) : null}
                    </button>
                  ) : (
                    <span className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      {column.label}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pagedResults.map((item) => (
              <tr key={item.id} className="align-top hover:bg-slate-50/70">
                <td className="px-3 py-3">
                  <Image
                    src={item.thumbnailUrl || "/placeholder-thumbnail.svg"}
                    alt={item.title}
                    className="h-14 w-24 rounded-md object-cover"
                    width={96}
                    height={56}
                  />
                </td>
                <td className="max-w-xs px-3 py-3">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="line-clamp-2 font-medium text-slate-800 hover:text-teal-700 hover:underline"
                    title={item.title}
                  >
                    {item.title}
                  </a>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-start gap-2">
                    <span className="max-w-[180px] truncate text-xs text-slate-600" title={item.url}>
                      {item.url}
                    </span>
                    <button
                      type="button"
                      className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                      onClick={() => copyUrl(item.url)}
                    >
                      Copy
                    </button>
                  </div>
                </td>
                <td className="px-3 py-3 text-slate-700">{item.channelTitle}</td>
                <td className="px-3 py-3 text-slate-700">{formatDate(item.publishedAt)}</td>
                <td className="px-3 py-3 text-slate-700">{formatNumber(item.viewCount)}</td>
                <td className="px-3 py-3 text-slate-700">{formatNumber(item.likeCount)}</td>
                <td className="px-3 py-3 text-slate-700">{formatNumber(item.commentCount)}</td>
                <td className="px-3 py-3 text-slate-700">{item.duration}</td>
                <td className="px-3 py-3">
                  <span
                    className={clsx(
                      "inline-flex rounded-full px-2 py-1 text-xs font-semibold",
                      item.inferredContentType === "Short"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-sky-100 text-sky-700"
                    )}
                  >
                    {item.inferredContentType}
                  </span>
                </td>
                <td className="px-3 py-3 font-semibold text-slate-900">{item.viralScore}</td>
                <td className="px-3 py-3 text-xs text-slate-500">{item.watchTime}</td>
                <td className="px-3 py-3 text-xs text-slate-500">{item.watchHours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          Showing {pagedResults.length} of {sortedResults.length} result(s)
          {copyMessage ? ` · ${copyMessage}` : ""}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={safePage <= 1}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-xs font-medium text-slate-600">
            Page {safePage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={safePage >= totalPages}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
