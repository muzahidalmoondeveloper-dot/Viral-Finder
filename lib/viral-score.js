function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function getKeywordRelevance(title = "", topic = "") {
  const topicTokens = topic
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter((token) => token.length > 2);

  if (topicTokens.length === 0) {
    return 0;
  }

  const lowerTitle = title.toLowerCase();
  const matched = topicTokens.filter((token) => lowerTitle.includes(token));

  return clamp(matched.length / topicTokens.length, 0, 1);
}

function getRecencyScore(publishedAt) {
  const publishedDate = new Date(publishedAt);

  if (Number.isNaN(publishedDate.getTime())) {
    return 0;
  }

  const daysOld = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
  return Math.exp(-daysOld / 180);
}

function getViewsScore(viewCount) {
  const views = Math.max(0, Number(viewCount) || 0);
  return clamp(Math.log10(views + 1) / 7, 0, 1);
}

function getEngagementScore({ viewCount, likeCount, commentCount }) {
  const views = Math.max(1, Number(viewCount) || 0);
  const likes = Math.max(0, Number(likeCount) || 0);
  const comments = Math.max(0, Number(commentCount) || 0);
  const engagementRate = (likes + comments) / views;

  const normalized = clamp(engagementRate / 0.12, 0, 1);
  return { normalized, engagementRate };
}

/**
 * Viral score formula (0-100):
 * - 45% normalized view count
 * - 25% normalized engagement ratio
 * - 20% recency decay weight
 * - 10% keyword relevance in title
 */
export function calculateViralScore(video, topic) {
  const viewsScore = getViewsScore(video.viewCount);
  const { normalized: engagementNormalized, engagementRate } = getEngagementScore(video);
  const recencyScore = getRecencyScore(video.publishedAt);
  const keywordScore = getKeywordRelevance(video.title, topic);

  const viralScore =
    (viewsScore * 0.45 +
      engagementNormalized * 0.25 +
      recencyScore * 0.2 +
      keywordScore * 0.1) *
    100;

  return {
    viralScore: round(viralScore),
    engagementScore: round(engagementRate * 100, 3),
    recencyScore: round(recencyScore, 4),
    keywordScore: round(keywordScore, 4),
    viewsScore: round(viewsScore, 4)
  };
}
