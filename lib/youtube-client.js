import { API_ERROR_MESSAGES } from "@/lib/constants";

const API_BASE = "https://www.googleapis.com/youtube/v3";

function createApiError(message, status = 500, code = "API_ERROR") {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function buildUrl(path, params) {
  const url = new URL(`${API_BASE}/${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function youtubeRequest(path, params, apiKey) {
  const url = buildUrl(path, { ...params, key: apiKey });
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store"
  });

  const payload = await response.json();

  if (!response.ok) {
    const reason = payload?.error?.errors?.[0]?.reason;

    if (reason === "quotaExceeded") {
      throw createApiError(API_ERROR_MESSAGES.QUOTA_EXCEEDED, 429, "QUOTA_EXCEEDED");
    }

    if (reason === "keyInvalid") {
      throw createApiError("The YouTube API key is invalid.", 401, "INVALID_API_KEY");
    }

    throw createApiError(
      payload?.error?.message || "YouTube API request failed.",
      response.status,
      "YOUTUBE_API_ERROR"
    );
  }

  return payload;
}

export async function searchVideoCandidates({
  topic,
  candidateCount,
  publishedAfter,
  publishedBefore,
  apiKey
}) {
  if (!apiKey) {
    throw createApiError(API_ERROR_MESSAGES.MISSING_API_KEY, 500, "MISSING_API_KEY");
  }

  const payload = await youtubeRequest(
    "search",
    {
      part: "snippet",
      type: "video",
      q: topic,
      maxResults: candidateCount,
      order: "relevance",
      publishedAfter,
      publishedBefore
    },
    apiKey
  );

  return payload?.items || [];
}

export async function fetchVideosByIds({ ids, apiKey }) {
  if (!ids?.length) {
    return [];
  }

  const chunks = [];

  for (let index = 0; index < ids.length; index += 50) {
    chunks.push(ids.slice(index, index + 50));
  }

  const aggregated = [];

  for (const chunk of chunks) {
    const payload = await youtubeRequest(
      "videos",
      {
        part: "snippet,contentDetails,statistics",
        id: chunk.join(","),
        maxResults: chunk.length
      },
      apiKey
    );

    if (payload?.items?.length) {
      aggregated.push(...payload.items);
    }
  }

  return aggregated;
}
