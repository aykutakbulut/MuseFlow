import { NextRequest, NextResponse } from "next/server";
import { TtlCache } from "@/lib/cache";
import { checkRateLimit } from "@/lib/rate-limit";
import type { YouTubeVideoResponse } from "@/types/youtube";

const YT_VIDEOS_API_URL = "https://www.googleapis.com/youtube/v3/videos";

/** Video detayları için ayrı cache (10 dakika TTL, max 200 video) */
const videoCache = new TtlCache<unknown>(10 * 60 * 1000, 200);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // ── Rate Limiting ──────────────────────────────────────────────
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const rateResult = checkRateLimit(ip);

  if (rateResult.limited) {
    const retryAfterSec = Math.ceil(rateResult.retryAfterMs / 1000);
    console.warn(
      `[Video API] Rate limit aşıldı — IP: ${ip} | istek: ${rateResult.count} | retry-after: ${retryAfterSec}s`,
    );
    return NextResponse.json(
      {
        error: `Çok fazla istek gönderildi. Lütfen ${retryAfterSec} saniye sonra tekrar deneyin.`,
        code: "RATE_LIMITED",
        retryable: true,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
        },
      },
    );
  }

  if (!id || id.trim().length === 0) {
    return NextResponse.json(
      { error: "Video ID gerekli.", code: "MISSING_ID", retryable: false },
      { status: 400 },
    );
  }

  // Basit video ID format kontrolü (sadece alfanümerik + _ + -)
  if (!/^[a-zA-Z0-9_-]{6,20}$/.test(id)) {
    return NextResponse.json(
      {
        error: "Geçersiz video ID formatı.",
        code: "INVALID_ID",
        retryable: false,
      },
      { status: 400 },
    );
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey || apiKey.trim().length < 10) {
    console.error("[Video API] YOUTUBE_API_KEY eksik veya geçersiz.");
    return NextResponse.json(
      {
        error: "YouTube API anahtarı yapılandırılmamış.",
        code: "MISSING_API_KEY",
        retryable: false,
      },
      { status: 500 },
    );
  }

  // Cache kontrolü
  const cacheKey = `video:${id}`;
  const cached = videoCache.get(cacheKey);

  if (cached !== undefined) {
    return NextResponse.json(cached, {
      headers: {
        "X-Cache": "HIT",
        "Cache-Control": "public, max-age=600, stale-while-revalidate=120",
      },
    });
  }

  // YouTube Data API — videos endpoint
  const url = new URL(YT_VIDEOS_API_URL);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("id", id);
  url.searchParams.set(
    "part",
    "snippet,contentDetails,statistics",
  );

  try {
    const res = await fetch(url.toString());

    if (!res.ok) {
      let ytError: unknown = null;
      try {
        ytError = await res.json();
      } catch {
        ytError = await res.text().catch(() => "(yanıt okunamadı)");
      }

      console.error(
        `[Video API] YouTube API hatası — HTTP ${res.status}:`,
        JSON.stringify(ytError),
        `| id: "${id}"`,
        `| timestamp: ${new Date().toISOString()}`,
      );

      let clientStatus = 502;
      let clientCode = "YOUTUBE_ERROR";
      let clientMessage = "YouTube API isteği başarısız oldu.";
      let retryable = true;

      if (res.status === 403) {
        clientCode = "QUOTA_EXCEEDED";
        clientMessage = "YouTube API kotası dolmuş. Lütfen daha sonra tekrar deneyin.";
        retryable = false;
      } else if (res.status === 404) {
        clientStatus = 404;
        clientCode = "VIDEO_NOT_FOUND";
        clientMessage = "Video bulunamadı.";
        retryable = false;
      }

      return NextResponse.json(
        { error: clientMessage, code: clientCode, retryable },
        { status: clientStatus },
      );
    }

    const data = await res.json() as YouTubeVideoResponse;

    if (!data || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json(
        {
          error: "Video bulunamadı veya erişilemiyor.",
          code: "VIDEO_NOT_FOUND",
          retryable: false,
        },
        { status: 404 },
      );
    }

    const videoItem = data.items[0];

    // İhtiyaç duyulan alanları dönüştür ve düzenle
    const video = {
      id: videoItem.id as string,
      title: (videoItem.snippet?.title as string) ?? "",
      description: (videoItem.snippet?.description as string) ?? "",
      channel: (videoItem.snippet?.channelTitle as string) ?? "",
      channelId: (videoItem.snippet?.channelId as string) ?? "",
      publishedAt: (videoItem.snippet?.publishedAt as string) ?? "",
      thumbnail:
        (videoItem.snippet?.thumbnails?.maxres?.url as string) ??
        (videoItem.snippet?.thumbnails?.high?.url as string) ??
        (videoItem.snippet?.thumbnails?.medium?.url as string) ??
        "",
      duration: (videoItem.contentDetails?.duration as string) ?? "", // ISO 8601 format: PT3M45S
      viewCount: (videoItem.statistics?.viewCount as string) ?? "0",
      likeCount: (videoItem.statistics?.likeCount as string) ?? "0",
      tags: (videoItem.snippet?.tags as string[]) ?? [],
    };

    // Cache'e yaz
    videoCache.set(cacheKey, video);

    return NextResponse.json(video, {
      headers: {
        "X-Cache": "MISS",
        "Cache-Control": "public, max-age=600, stale-while-revalidate=120",
      },
    });
  } catch (err) {
    console.error(
      "[Video API] Beklenmeyen hata:",
      err,
      `| id: "${id}"`,
      `| timestamp: ${new Date().toISOString()}`,
    );
    return NextResponse.json(
      {
        error: "Video detayları alınırken beklenmeyen bir hata oluştu.",
        code: "INTERNAL_ERROR",
        retryable: true,
      },
      { status: 500 },
    );
  }
}
