const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "that",
  "with",
  "this",
  "from",
  "your",
  "you",
  "are",
  "how",
  "what",
  "why",
  "when",
  "where",
  "will",
  "into",
  "about",
  "than",
  "have",
  "has",
  "after",
  "before",
  "been",
  "just",
  "only",
  "make",
  "made",
  "video"
]);

const POWER_WORDS = [
  "ultimate",
  "secret",
  "proven",
  "easy",
  "best",
  "fast",
  "powerful",
  "insane",
  "mistake",
  "hack",
  "genius",
  "simple",
  "boost",
  "viral",
  "avoid"
];

function takeTopEntries(countMap, limit = 5) {
  return [...countMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => `${label} (${count})`);
}

function detectPattern(title) {
  const value = title.toLowerCase();

  if (/^how to\b/.test(value)) {
    return "How to format";
  }
  if (/\b\d+\b/.test(value)) {
    return "Number-led title";
  }
  if (/\bvs\.?\b|\bversus\b/.test(value)) {
    return "Comparison (X vs Y)";
  }
  if (/\?$/.test(value.trim())) {
    return "Question hook";
  }
  if (/\bi tried\b|\bwe tried\b/.test(value)) {
    return "Experiment hook";
  }

  return "Outcome promise";
}

function detectHook(title) {
  const value = title.toLowerCase();

  if (/\bhow to\b/.test(value)) return "How-to";
  if (/\bwhy\b/.test(value)) return "Curiosity / Why";
  if (/\bmistake\b|\bwrong\b/.test(value)) return "Pain point";
  if (/\bsecret\b|\bhack\b/.test(value)) return "Secret / Hack";
  if (/\bfast\b|\bquick\b/.test(value)) return "Speed promise";
  if (/\b\d+\b/.test(value)) return "List / Number";
  return "Result-driven";
}

export function generateTitleInsights(results, topic) {
  if (!results.length) {
    return {
      recurringPatterns: [],
      commonHooks: [],
      commonPowerWords: [],
      titleIdeas: []
    };
  }

  const patternCounts = new Map();
  const hookCounts = new Map();
  const powerWordCounts = new Map();
  const tokenCounts = new Map();

  results.slice(0, 30).forEach((item) => {
    const title = item.title || "";
    const pattern = detectPattern(title);
    const hook = detectHook(title);

    patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
    hookCounts.set(hook, (hookCounts.get(hook) || 0) + 1);

    const lowerTitle = title.toLowerCase();

    POWER_WORDS.forEach((word) => {
      if (lowerTitle.includes(word)) {
        powerWordCounts.set(word, (powerWordCounts.get(word) || 0) + 1);
      }
    });

    lowerTitle
      .split(/[^a-z0-9]+/i)
      .filter((token) => token.length >= 4 && !STOP_WORDS.has(token))
      .forEach((token) => {
        tokenCounts.set(token, (tokenCounts.get(token) || 0) + 1);
      });
  });

  const topTokens = [...tokenCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([token]) => token);

  const topicSafe = topic?.trim() || "this topic";
  const tokenA = topTokens[0] || "strategy";
  const tokenB = topTokens[1] || "mistakes";
  const tokenC = topTokens[2] || "results";

  return {
    recurringPatterns: takeTopEntries(patternCounts, 4),
    commonHooks: takeTopEntries(hookCounts, 4),
    commonPowerWords: takeTopEntries(powerWordCounts, 6),
    titleIdeas: [
      `How to improve ${topicSafe} using ${tokenA}`,
      `7 ${topicSafe} ${tokenB} that kill growth`,
      `${topicSafe}: ${tokenA} vs ${tokenC} (what wins?)`,
      `I tested ${topicSafe} methods for 30 days - here are the ${tokenC}`
    ]
  };
}
