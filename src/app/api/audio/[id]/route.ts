import { NextRequest, NextResponse } from "next/server";
import { Innertube } from "youtubei.js";
import { checkRateLimit } from "@/lib/rate-limit";

// Innertube singleton — her request'te yeniden oluşturmayı önler
let innertubeInstance: Innertube | null = null;

async function getInnertube(): Promise<Innertube> {
  if (!innertubeInstance) {
    innertubeInstance = await Innertube.create({
      lang: "tr",
      location: "TR",
    });
  }
  return innertubeInstance;
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
    const innertube = await getInnertube();
    const info = await innertube.getBasicInfo(id);

    // Ses formatlarını filtrele
    const audioFormats = info.streaming_data?.adaptive_formats?.filter(
      (f) => f.mime_type?.startsWith("audio/"),
    );

    if (!audioFormats || audioFormats.length === 0) {
      return NextResponse.json(
        { error: "Bu video için ses akışı bulunamadı." },
        { status: 404 },
      );
    }

    // En yüksek kaliteli ses formatını seç
    const bestAudio = audioFormats.sort(
      (a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0),
    )[0]!;

    // Deciphered URL al
    const audioUrl = await bestAudio.decipher(innertube.session.player);

    if (!audioUrl) {
      return NextResponse.json(
        { error: "Ses akışı URL'i çözülemedi." },
        { status: 500 },
      );
    }

    // İstemciden gelen Range header'ını proxy et (seek desteği için)
    const rangeHeader = request.headers.get("range");
    const fetchHeaders: Record<string, string> = {};
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
    innertubeInstance = null;

    return NextResponse.json(
      {
        error: "Ses akışı alınırken beklenmeyen bir hata oluştu.",
        retryable: true,
      },
      { status: 500 },
    );
  }
}
