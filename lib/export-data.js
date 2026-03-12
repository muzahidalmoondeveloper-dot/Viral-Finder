import * as XLSX from "xlsx";

const FILE_PREFIX = "youtube-viral-title-finder";

function toRows(results) {
  return results.map((item) => ({
    Title: item.title,
    Link: item.url,
    "Channel Name": item.channelTitle,
    "Publish Date": item.publishedAt,
    Views: item.viewCount,
    Likes: item.likeCount,
    Comments: item.commentCount,
    Duration: item.duration,
    "Content Type": item.inferredContentType,
    "Viral Score": item.viralScore,
    "Watch Time": item.watchTime,
    "Watch Hours": item.watchHours
  }));
}

function buildWorkbook(rows) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
  return workbook;
}

export function exportResultsToCSV(results) {
  if (!results.length) {
    throw new Error("No data to export.");
  }

  const rows = toRows(results);
  const workbook = buildWorkbook(rows);
  XLSX.writeFile(workbook, `${FILE_PREFIX}.csv`, { bookType: "csv" });
}

export function exportResultsToXLSX(results) {
  if (!results.length) {
    throw new Error("No data to export.");
  }

  const rows = toRows(results);
  const workbook = buildWorkbook(rows);
  XLSX.writeFile(workbook, `${FILE_PREFIX}.xlsx`, { bookType: "xlsx" });
}
