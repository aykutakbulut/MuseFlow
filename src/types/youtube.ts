/**
 * YouTube Data API v3 — Paylaşılan TypeScript tipleri.
 * Hem API route'larında hem de client bileşenlerde kullanılır.
 */

// ── Ortak ──────────────────────────────────────────────────────────────────

export interface YouTubeThumbnail {
  url: string;
  width?: number;
  height?: number;
}

export interface YouTubeThumbnails {
  default?: YouTubeThumbnail;
  medium?: YouTubeThumbnail;
  high?: YouTubeThumbnail;
  standard?: YouTubeThumbnail;
  maxres?: YouTubeThumbnail;
}

// ── Search ─────────────────────────────────────────────────────────────────

export interface YouTubeSearchSnippet {
  title: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  description?: string;
  thumbnails: YouTubeThumbnails;
  liveBroadcastContent?: string;
}

export interface YouTubeSearchResultId {
  kind: string;
  videoId: string;
}

export interface YouTubeSearchResultItem {
  kind: string;
  etag: string;
  id: YouTubeSearchResultId;
  snippet: YouTubeSearchSnippet;
}

export interface YouTubeSearchResponse {
  kind?: string;
  etag?: string;
  nextPageToken?: string;
  regionCode?: string;
  pageInfo?: {
    totalResults: number;
    resultsPerPage: number;
  };
  items?: YouTubeSearchResultItem[];
  /** Hata durumunda YouTube bu alanı doldurur */
  error?: YouTubeApiError;
}

// ── Videos ─────────────────────────────────────────────────────────────────

export interface YouTubeVideoSnippet {
  title: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  description: string;
  thumbnails: YouTubeThumbnails;
  tags?: string[];
  categoryId?: string;
}

export interface YouTubeVideoContentDetails {
  /** ISO 8601 format: PT3M45S */
  duration: string;
  dimension?: string;
  definition?: string;
  caption?: string;
  licensedContent?: boolean;
}

export interface YouTubeVideoStatistics {
  viewCount?: string;
  likeCount?: string;
  dislikeCount?: string;
  favoriteCount?: string;
  commentCount?: string;
}

export interface YouTubeVideoItem {
  kind: string;
  etag: string;
  id: string;
  snippet: YouTubeVideoSnippet;
  contentDetails?: YouTubeVideoContentDetails;
  statistics?: YouTubeVideoStatistics;
}

export interface YouTubeVideoResponse {
  kind?: string;
  etag?: string;
  pageInfo?: {
    totalResults: number;
    resultsPerPage: number;
  };
  items?: YouTubeVideoItem[];
  error?: YouTubeApiError;
}

// ── Error ──────────────────────────────────────────────────────────────────

export interface YouTubeApiError {
  code: number;
  message: string;
  status?: string;
  errors?: Array<{
    message: string;
    domain: string;
    reason: string;
  }>;
}
