export const WATCH_METRIC_UNAVAILABLE = "Not available from public YouTube API";

export const CONTENT_TYPE = {
  SHORTS: "shorts",
  VIDEOS: "videos"
};

export const SORT_OPTIONS = {
  VIRAL: "viral",
  VIEWS: "views",
  NEWEST: "newest",
  ENGAGEMENT: "engagement"
};

export const MAX_ALLOWED_RESULTS = 500;
export const DEFAULT_MAX_RESULTS = 25;

export const API_ERROR_MESSAGES = {
  MISSING_TOPIC: "Please enter a topic keyword.",
  INVALID_CONTENT_TYPE: "Content type must be Shorts or Videos.",
  INVALID_SORT_BY: "Sort option is invalid.",
  INVALID_MAX_RESULTS: `Max results must be between 1 and ${MAX_ALLOWED_RESULTS}.`,
  MISSING_API_KEY:
    "Missing YOUTUBE_API_KEY. Add it to your environment to run real searches.",
  QUOTA_EXCEEDED:
    "YouTube API quota exceeded for today. Please try again later or use another API key."
};
