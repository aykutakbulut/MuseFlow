import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  getStreamingSession,
  resetStreamingSession,
} from "@/lib/potoken";

type InnerTubeClient = "TV" | "MWEB" | "WEB";

// youtubei.js Node.js runtime gerektirir (Edge'de çalışmaz)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// PoToken üretimi + ses akışı proxy'si zaman alabilir
export const maxDuration = 60;

/**
 * Denenecek client'lar (öncelik sırasıyla). PoToken ile birlikte:
 *   - TV: çözülebilir (decipher) URL döndürür — birincil seçim, doğrulandı.
 *   - MWEB: yedek.
 *   - WEB: artık SABR kullandığı için direkt URL vermez, son çare.
 */
const CLIENT_PRIORITY: InnerTubeClient[] = ["TV", "MWEB", "WEB"];

type ClientDiagnostic = {
  client: InnerTubeClient;
  playability?: string;
  reason?: string;
  audioFormatCount?: number;
  fetchStatus?: number;
  error?: string;
};

async function resolveAudioUrl(
  id: string,
): Promise<{ url: string | null; diagnostics: ClientDiagnostic[] }> {
  const diagnostics: ClientDiagnostic[] = [];
  const innertube = await getStreamingSession();

  for (const client of CLIENT_PRIORITY) {
    const diag: ClientDiagnostic = { client };
    try {
      const info = await innertube.getBasicInfo(id, { client });

      diag.playability = info.playability_status?.status;
      diag.reason = info.playability_status?.reason ?? undefined;

      const audioFormats = info.streaming_data?.adaptive_formats?.filter(
        (f) => f.mime_type?.startsWith("audio/"),
      );

      diag.audioFormatCount = audioFormats?.length ?? 0;

      if (!audioFormats || audioFormats.length === 0) {
        diagnostics.push(diag);
        continue;
      }

      // En yüksek kaliteli ses formatını seç
      const bestAudio = audioFormats.sort(
        (a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0),
      )[0]!;

      const audioUrl = bestAudio.url
        ? bestAudio.url
        : await bestAudio.decipher(innertube.session.player);

      if (audioUrl) {
        return { url: audioUrl, diagnostics };
      }
      diag.error = "decipher boş URL döndürdü";
    } catch (err) {
      diag.error = err instanceof Error ? err.message : String(err);
    }
    diagnostics.push(diag);
  }

  console.warn(
    `[Audio API] Teşhis — id: "${id}":`,
    JSON.stringify(diagnostics),
  );
  return { url: null, diagnostics };
}

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
      `[Audio API] Rate limit aşıldı — IP: ${ip} | istek: ${rateResult.count} | retry-after: ${retryAfterSec}s`,
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

  if (!id || !/^[a-zA-Z0-9_-]{6,20}$/.test(id)) {
    return NextResponse.json(
      { error: "Geçersiz video ID." },
      { status: 400 },
    );
  }

  try {
    const { url: audioUrl } = await resolveAudioUrl(id);

    if (!audioUrl) {
      // Oturum geçersiz kalmış olabilir, bir sonraki istek için sıfırla
      resetStreamingSession();
      return NextResponse.json(
        { error: "Bu video için ses akışı bulunamadı." },
        { status: 404 },
      );
    }

    // İstemciden gelen Range header'ını proxy et (seek desteği için)
    const rangeHeader = request.headers.get("range");
    const fetchHeaders: Record<string, string> = {
      // googlevideo CDN, IOS istemcisinden alınan URL'lerde eşleşen
      // User-Agent bekler; aksi halde 403 dönebilir.
      "User-Agent":
        "com.google.ios.youtube/19.45.4 (iPhone16,2; U; CPU iOS 18_1_0 like Mac OS X;)",
    };
    if (rangeHeader) {
      fetchHeaders["Range"] = rangeHeader;
    }

    // YouTube'dan ses verisini al ve istemciye proxy olarak aktar
    const audioResponse = await fetch(audioUrl, {
      headers: fetchHeaders,
    });

    if (!audioResponse.ok && audioResponse.status !== 206) {
      console.error(
        `[Audio API] YouTube stream hatası — HTTP ${audioResponse.status} | id: "${id}"`,
      );
      return NextResponse.json(
        { error: "Ses akışı alınamadı." },
        { status: 502 },
      );
    }

    // Response header'larını oluştur
    const responseHeaders = new Headers();

    const contentType =
      audioResponse.headers.get("content-type") ?? "audio/mp4";
    responseHeaders.set("Content-Type", contentType);

    const contentLength = audioResponse.headers.get("content-length");
    if (contentLength) {
      responseHeaders.set("Content-Length", contentLength);
    }

    const contentRange = audioResponse.headers.get("content-range");
    if (contentRange) {
      responseHeaders.set("Content-Range", contentRange);
    }

    // Accept-Ranges ekle (seek desteği sinyali)
    responseHeaders.set("Accept-Ranges", "bytes");

    // Cache: 10 dakika
    responseHeaders.set(
      "Cache-Control",
      "public, max-age=600, stale-while-revalidate=120",
    );

    // CORS
    // responseHeaders.set("Access-Control-Allow-Origin", "*");

    return new Response(audioResponse.body, {
      status: audioResponse.status === 206 ? 206 : 200,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error(
      "[Audio API] Beklenmeyen hata:",
      err,
      `| id: "${id}"`,
    );

    // Innertube instance'ı sıfırla — belki eski oturum geçersiz kalmıştır
    resetStreamingSession();

    return NextResponse.json(
      {
        error: "Ses akışı alınırken beklenmeyen bir hata oluştu.",
        retryable: true,
      },
      { status: 500 },
    );
  }
}
