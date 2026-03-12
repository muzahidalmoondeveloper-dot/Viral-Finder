export function formatNumber(value) {
  const numeric = Number(value || 0);
  return new Intl.NumberFormat("en-US").format(numeric);
}

export function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}
