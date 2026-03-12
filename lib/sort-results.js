export function sortResults(results, sortBy) {
  const sorted = [...results];

  switch (sortBy) {
    case "views":
      return sorted.sort((a, b) => b.viewCount - a.viewCount);
    case "newest":
      return sorted.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    case "engagement":
      return sorted.sort((a, b) => b.engagementScore - a.engagementScore);
    case "viral":
    default:
      return sorted.sort((a, b) => b.viralScore - a.viralScore);
  }
}
