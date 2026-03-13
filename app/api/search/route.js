import { NextResponse } from "next/server";
import {
  API_ERROR_MESSAGES,
  CONTENT_TYPE,
  DEFAULT_MAX_RESULTS,
  MAX_ALLOWED_RESULTS,
  SORT_OPTIONS,
  WATCH_METRIC_UNAVAILABLE
} from "@/lib/constants";
import { parseISODurationToSeconds, formatDurationFromSeconds } from "@/lib/duration";
import { inferContentType, matchesRequestedContentType } from "@/lib/content-type";
import { calculateViralScore } from "@/lib/viral-score";
import { sortResults } from "@/lib/sort-results";
import { fetchVideosByIds, searchVideoCandidates } from "@/lib/youtube-client";

function validatePayload(payload) {
  const topic = String(payload?.topic || "").trim();
  const contentType = String(payload?.contentType || CONTENT_TYPE.VIDEOS).toLowerCase();
  const sortBy = String(payload?.sortBy || SORT_OPTIONS.VIRAL).toLowerCase();
  const maxResults = Number.parseInt(String(payload?.maxResults || DEFAULT_MAX_RESULTS), 10);
  const startDate = payload?.startDate ? String(payload.startDate) : "";
  const endDate = payload?.endDate ? String(payload.endDate) : "";

  if (!topic) {
    throw new Error(API_ERROR_MESSAGES.MISSING_TOPIC);
  }

  if (![CONTENT_TYPE.SHORTS, CONTENT_TYPE.VIDEOS].includes(contentType)) {
    throw new Error(API_ERROR_MESSAGES.INVALID_CONTENT_TYPE);
  }

  if (!Object.values(SORT_OPTIONS).includes(sortBy)) {
    throw new Error(API_ERROR_MESSAGES.INVALID_SORT_BY);
  }

  if (Number.isNaN(maxResults) || maxResults < 1 || maxResults > MAX_ALLOWED_RESULTS) {
    throw new Error(API_ERROR_MESSAGES.INVALID_MAX_RESULTS);
  }

  if (startDate && Number.isNaN(new Date(startDate).getTime())) {
    throw new Error("Start date is invalid.");
  }

  if (endDate && Number.isNaN(new Date(endDate).getTime())) {
    throw new Error("End date is invalid.");
  }

  if (startDate && endDate && new Date(startDate).getTime() > new Date(endDate).getTime()) {
    throw new Error("Start date must be before end date.");
  }

  return {
    topic,
    contentType,
    sortBy,
    maxResults,
    startDate,
    endDate
  };
}

function toIsoDateTime(value, boundary) {
  if (!value) {
    return undefined;
  }

  return boundary === "start" ? `${value}T00:00:00Z` : `${value}T23:59:59Z`;
}

function normalizeVideo(video, topic) {
  const id = video.id;
  const snippet = video.snippet || {};
  const statistics = video.statistics || {};
  const contentDetails = video.contentDetails || {};

  const viewCount = Number.parseInt(statistics.viewCount || "0", 10) || 0;
  const likeCount = Number.parseInt(statistics.likeCount || "0", 10) || 0;
  const commentCount = Number.parseInt(statistics.commentCount || "0", 10) || 0;
  const durationSeconds = parseISODurationToSeconds(contentDetails.duration || "");

  const inferredContentType = inferContentType({
    durationSeconds,
    title: snippet.title,
    description: snippet.description
  });

  const { viralScore, engagementScore } = calculateViralScore(
    {
      title: snippet.title,
      viewCount,
      likeCount,
      commentCount,
      publishedAt: snippet.publishedAt
    },
    topic
  );

  return {
    id,
    title: snippet.title || "Untitled",
    url: `https://www.youtube.com/watch?v=${id}`,
    channelTitle: snippet.channelTitle || "Unknown Channel",
    publishedAt: snippet.publishedAt || "",
    viewCount,
    likeCount,
    commentCount,
    duration: formatDurationFromSeconds(durationSeconds),
    durationSeconds,
    thumbnailUrl:
      snippet?.thumbnails?.medium?.url ||
      snippet?.thumbnails?.high?.url ||
      snippet?.thumbnails?.default?.url ||
      "",
    inferredContentType,
    viralScore,
    engagementScore,
    watchTime: WATCH_METRIC_UNAVAILABLE,
    watchHours: WATCH_METRIC_UNAVAILABLE
  };
}

export async function POST(request) {
    try {
      const payload = await request.json();
      const { topic, contentType, sortBy, maxResults, startDate, endDate } = validatePayload(payload);

      const apiKey = process.env.YOUTUBE_API_KEY;

      if (!apiKey) {
        return NextResponse.json({ error: API_ERROR_MESSAGES.MISSING_API_KEY }, { status: 500 });
      }

      // Fetch candidates in batches until we have enough filtered results
      const MAX_PER_REQUEST = 50; // YouTube API limit
      const MAX_BATCHES = 20; // Safety limit to prevent excessive API calls
      let allNormalized = [];
      let nextPageToken = undefined;
      
      // Continue fetching until we have enough results or hit safety limits
      for (let batch = 0; batch < MAX_BATCHES && allNormalized.length < maxResults; batch++) {
        const searchResponse = await searchVideoCandidates({
          topic,
          candidateCount: MAX_PER_REQUEST,
          publishedAfter: toIsoDateTime(startDate, "start"),
          publishedBefore: toIsoDateTime(endDate, "end"),
          apiKey,
          pageToken: nextPageToken
        });

        // Handle the new return format: { items: [...], nextPageToken: "..." }
        if (!searchResponse || !searchResponse.items || searchResponse.items.length === 0) {
          // No more results available
          break;
        }

        const searchItems = searchResponse.items;

        // Extract video IDs
        const ids = searchItems
          .map((item) => item?.id?.videoId)
          .filter(Boolean);

        if (!ids.length) {
          continue;
        }

        // Fetch detailed video stats
        const videos = await fetchVideosByIds({ ids, apiKey });

        // Normalize and filter by content type
        const batchNormalized = videos
          .map((item) => normalizeVideo(item, topic))
          .filter((item) => matchesRequestedContentType(item.inferredContentType, contentType));

        allNormalized.push(...batchNormalized);
        
        // Update nextPageToken for pagination
        nextPageToken = searchResponse.nextPageToken;
        
        // If no next page token, we've reached the end of results
        if (!nextPageToken) {
          break;
        }
      }

      // Sort all normalized results
      const sorted = sortResults(allNormalized, sortBy);
      
      // Take exactly what was requested (or fewer if not enough available)
      const finalResults = sorted.slice(0, maxResults);

      return NextResponse.json({ results: finalResults }, { status: 200 });
    } catch (error) {
      const status = error.status || 400;
      return NextResponse.json({ error: error.message || "Search failed." }, { status });
    }
  }
