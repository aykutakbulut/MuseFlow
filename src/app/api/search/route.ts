import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { searchCache } from "@/lib/cache";
import type { YouTubeSearchResponse } from "@/types/youtube";

const YT_API_URL = "https://www.googleapis.com/youtube/v3/search";

/** Kabul edilen maksimum query uzunluğu */
const MAX_QUERY_LENGTH = 200;

/** Özel karakterleri temizleyen regex (XSS / injection koruması) */
const UNSAFE_CHARS_RE = /[<>"'`\\]/g;

/**
 * Query string sanitizasyonu:
 * - Trim
 * - Max uzunluk kısaltma
 * - Güvensiz karakterleri kaldırma
 * - Çoklu whitespace normalize etme
 */
function sanitizeQuery(raw: string): string {
  return raw
    .trim()
    .slice(0, MAX_QUERY_LENGTH)
    .replace(UNSAFE_CHARS_RE, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET(request: NextRequest) {
  // ── Rate Limiting ──────────────────────────────────────────────
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const rateResult = checkRateLimit(ip);

  if (rateResult.limited) {
    const retryAfterSec = Math.ceil(rateResult.retryAfterMs / 1000);
    console.warn(
      `[Search API] Rate limit aşıldı — IP: ${ip} | istek: ${rateResult.count} | retry-after: ${retryAfterSec}s`,
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

  // ── Input Sanitizasyon ─────────────────────────────────────────
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("q") ?? "";
  const query = sanitizeQuery(rawQuery);

  if (!query || query.length < 2) {
    return NextResponse.json({ items: [] });
  }

  // ── API Key Kontrolü ───────────────────────────────────────────
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey || apiKey.trim().length < 10) {
    console.error("[Search API] YOUTUBE_API_KEY eksik veya geçersiz görünüyor.");
    return NextResponse.json(
      {
        error:
          "YOUTUBE_API_KEY .env.local dosyasında tanımlanmadı veya geçersiz. Lütfen geçerli bir YouTube Data API anahtarı ekleyin.",
        code: "MISSING_API_KEY",
        retryable: false,
      },
      { status: 500 },
    );
  }

  // ── Cache Kontrolü ─────────────────────────────────────────────
  const cacheKey = `search:${query.toLowerCase()}`;
  const cached = searchCache.get(cacheKey);

  if (cached !== undefined) {
    return NextResponse.json(cached, {
      headers: {
        "X-Cache": "HIT",
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
      },
    });
  }

  // ── YouTube API İsteği ─────────────────────────────────────────
  const url = new URL(YT_API_URL);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("q", query);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "4");
  url.searchParams.set("videoCategoryId", "10"); // Sadece müzik videoları

  try {
    const res = await fetch(url.toString());

    if (!res.ok) {
      // YouTube API'nin döndürdüğü gerçek hata mesajını oku ve logla
      let ytError: unknown = null;
      try {
        ytError = await res.json();
      } catch {
        ytError = await res.text().catch(() => "(yanıt okunamadı)");
      }

      console.error(
        `[Search API] YouTube API hatası — HTTP ${res.status}:`,
        JSON.stringify(ytError),
        `| query: "${query}"`,
        `| IP: ${ip}`,
        `| timestamp: ${new Date().toISOString()}`,
      );

      // YouTube hata koduna göre farklı HTTP status dön
      let clientStatus = 502;
      let clientCode = "YOUTUBE_ERROR";
      let clientMessage = "YouTube API isteği başarısız oldu.";
      let retryable = true;

      if (res.status === 403) {
        clientStatus = 502;
        clientCode = "QUOTA_EXCEEDED";
        clientMessage =
          "YouTube API kotası dolmuş veya erişim reddedildi. Lütfen daha sonra tekrar deneyin.";
        retryable = false;
      } else if (res.status === 400) {
        clientStatus = 400;
        clientCode = "INVALID_REQUEST";
        clientMessage = "Geçersiz arama isteği.";
        retryable = false;
      } else if (res.status === 429) {
        clientStatus = 429;
        clientCode = "RATE_LIMITED";
        clientMessage = "Çok fazla istek gönderildi. Lütfen biraz bekleyin.";
        retryable = true;
      }

      return NextResponse.json(
        { error: clientMessage, code: clientCode, retryable },
        { status: clientStatus },
      );
    }

    const data = await res.json() as YouTubeSearchResponse;

    // items array'ini validate et
    if (!data || !Array.isArray(data.items)) {
      console.error(
        "[Search API] YouTube API beklenmeyen yanıt formatı:",
        JSON.stringify(data),
      );
      return NextResponse.json(
        {
          error: "YouTube API beklenmeyen bir yanıt döndürdü.",
          code: "UNEXPECTED_RESPONSE",
          retryable: true,
        },
        { status: 502 },
      );
    }

    // Cache'e yaz
    searchCache.set(cacheKey, data);

    return NextResponse.json(data, {
      headers: {
        "X-Cache": "MISS",
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    console.error(
      "[Search API] Beklenmeyen hata:",
      err,
      `| query: "${query}"`,
      `| IP: ${ip}`,
      `| timestamp: ${new Date().toISOString()}`,
    );
    return NextResponse.json(
      {
        error: "YouTube API istekleri sırasında beklenmeyen bir hata oluştu.",
        code: "INTERNAL_ERROR",
        retryable: true,
      },
      { status: 500 },
    );
  }
}
