export function isLikelyShort({ durationSeconds = 0, title = "", description = "" }) {
  if (durationSeconds > 0 && durationSeconds <= 60) {
    return true;
  }

  const text = `${title} ${description}`.toLowerCase();

  if (/#shorts\b/.test(text)) {
    return true;
  }

  return false;
}

export function inferContentType(video) {
  return isLikelyShort(video) ? "Short" : "Video";
}

export function matchesRequestedContentType(inferredContentType, requestedContentType) {
  if (requestedContentType === "shorts") {
    return inferredContentType === "Short";
  }

  return inferredContentType === "Video";
}
