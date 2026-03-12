# YouTube Viral Title Finder

A full-stack Next.js dashboard that helps creators and researchers discover high-performing YouTube titles and URLs by topic.

## Features

- Topic-based YouTube search via YouTube Data API v3
- Content-type filtering (`Shorts` inferred vs `Videos`)
- Viral ranking using transparent public metrics only
- Sort options: Viral Score, Views, Newest, Most Engaged
- Responsive dashboard UI built with Tailwind CSS
- Results table with clickable titles, thumbnails, and copy-link actions
- Export visible results to CSV and XLSX
- AI-friendly Title Insights panel:
  - recurring title patterns
  - common hooks
  - power words
  - likely high-performing title structures
- Search history stored in browser local storage

## Tech Stack

- Next.js (App Router)
- React
- Tailwind CSS
- Next.js API Routes (`POST /api/search`)
- SheetJS (`xlsx`) for CSV/XLSX export

## Project Structure

```text
app/
  api/search/route.js      # Backend API logic
  globals.css              # Tailwind + app theme
  layout.js
  page.js                  # Main dashboard page
components/
  dashboard-header.js
  export-buttons.js
  results-table.js
  search-form.js
  title-insights-panel.js
lib/
  constants.js
  content-type.js
  duration.js
  export-data.js
  formatters.js
  sort-results.js
  title-insights.js
  types.js
  viral-score.js
  youtube-client.js
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local env file:

```bash
cp .env.example .env.local
```

3. Add your API key to `.env.local`:

```env
YOUTUBE_API_KEY=your_youtube_data_api_v3_key
```

4. Run the app:

```bash
npm run dev
```

5. Open `http://localhost:3000`

## API Endpoint

### `POST /api/search`

Request body:

```json
{
  "topic": "ai automation",
  "contentType": "shorts",
  "maxResults": 25,
  "sortBy": "viral",
  "startDate": "2025-01-01",
  "endDate": "2026-01-01"
}
```

Response:

```json
{
  "results": [
    {
      "id": "...",
      "title": "...",
      "url": "...",
      "channelTitle": "...",
      "publishedAt": "...",
      "viewCount": 0,
      "likeCount": 0,
      "commentCount": 0,
      "duration": "00:45",
      "durationSeconds": 45,
      "thumbnailUrl": "...",
      "inferredContentType": "Short",
      "viralScore": 67.42,
      "engagementScore": 4.812,
      "watchTime": "Not available from public YouTube API",
      "watchHours": "Not available from public YouTube API"
    }
  ]
}
```

## Viral Score Logic

Public metrics only. No private analytics data is fabricated.

Formula (0-100):

- 45% normalized view count (`log10(views + 1)` scaled)
- 25% normalized engagement ratio (`(likes + comments) / views`)
- 20% recency score (exponential decay by age in days)
- 10% title-keyword relevance (topic token overlap)

Implemented in `lib/viral-score.js`.

## Shorts Detection Logic

Implemented in `lib/content-type.js`:

- Shorts if `durationSeconds <= 60`
- Additional heuristic: title/description includes `#shorts`
- Otherwise treated as standard `Video`

This is intentionally modular so heuristics can be refined later.

## Public YouTube API Limitations

The public YouTube Data API does **not** provide watch time/watch hours for arbitrary public videos.

Because of this, the app:

- Includes `Watch Time` and `Watch Hours` columns for clarity
- Sets both values to:

`Not available from public YouTube API`

- Exports the same value in CSV/XLSX

## Error Handling

The backend and UI handle:

- Empty topic input
- Invalid content type / sorting / max results
- Missing API key
- YouTube quota exceeded
- Empty responses and no results
- Missing statistics fields on some videos

## Notes

- The app fetches candidate videos, enriches stats, infers content type, computes viral score, then filters/sorts.
- The table supports column sorting and pagination.
- Export always uses the currently visible sorted dataset.
