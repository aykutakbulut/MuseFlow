import { NextRequest, NextResponse } from "next/server";
import { Innertube } from "youtubei.js";
import { checkRateLimit } from "@/lib/rate-limit";

type InnerTubeClient = "IOS" | "ANDROID" | "WEB";

// youtubei.js Node.js runtime gerektirir (Edge'de çalışmaz)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Ses akışını proxy ederken zaman aşımına düşmemek için
export const maxDuration = 60;

// Innertube singleton — her request'te yeniden oluşturmayı önler
let innertubeInstance: Innertube | null = null;

async function getInnertube(): Promise<Innertube> {
  if (!innertubeInstance) {
    // Oturum cookie'si — Vercel gibi datacenter IP'lerinde YouTube'un
    // "Sign in to confirm you're not a bot" blokunu aşmak için gerekli.
    // Giriş yapılmış bir YouTube hesabının cookie'si YOUTUBE_COOKIE env
    // değişkeninde tutulur.
    const cookie = process.env.YOUTUBE_COOKIE?.trim();

    innertubeInstance = await Innertube.create({
      lang: "tr",
      location: "TR",
      // Player'ı önceden çöz — decipher için gerekli
      retrieve_player: true,
      ...(cookie ? { cookie } : {}),
    });
  }
  return innertubeInstance;
}

/**
 * Birden fazla istemci tipini deneyerek ses formatını çözer.
 * Vercel gibi datacenter IP'lerinde varsayılan WEB istemcisi YouTube'un
 * bot korumasına (PoToken) takılır ve streaming_data boş döner.
 * IOS / ANDROID istemcileri PoToken gerektirmez ve genelde
 * deşifre gerektirmeyen direkt URL'ler döner.
 */
const CLIENT_PRIORITY: InnerTubeClient[] = ["IOS", "ANDROID", "WEB"];

async function resolveAudioUrl(
  innertube: Innertube,
  id: string,
): Promise<string | null> {
  for (const client of CLIENT_PRIORITY) {
    try {
      const info = await innertube.getBasicInfo(id, { client });

      const audioFormats = info.streaming_data?.adaptive_formats?.filter(
        (f) => f.mime_type?.startsWith("audio/"),
      );

      if (!audioFormats || audioFormats.length === 0) {
        console.warn(
          `[Audio API] "${client}" istemcisi ses formatı döndürmedi — id: "${id}"`,
        );
        continue;
      }

      // En yüksek kaliteli ses formatını seç
      const bestAudio = audioFormats.sort(
        (a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0),
      )[0]!;

      // IOS/ANDROID formatları genelde direkt url içerir;
      // decipher her iki durumu da (cipher / direkt) ele alır.
      const audioUrl = bestAudio.url
        ? bestAudio.url
        : await bestAudio.decipher(innertube.session.player);

      if (audioUrl) {
        return audioUrl;
      }
    } catch (err) {
      console.warn(
        `[Audio API] "${client}" istemcisi başarısız — id: "${id}":`,
        err instanceof Error ? err.message : err,
      );
      // Sonraki istemciyi dene
    }
  }
  return null;
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
    const audioUrl = await resolveAudioUrl(innertube, id);

    if (!audioUrl) {
      console.error(
        `[Audio API] Hiçbir istemci ses akışı döndüremedi — id: "${id}"` +
          (process.env.YOUTUBE_COOKIE
            ? " (YOUTUBE_COOKIE mevcut — cookie geçersiz/expire olmuş olabilir)"
            : " (YOUTUBE_COOKIE TANIMLI DEĞİL — datacenter IP bloku muhtemel sebep)"),
      );
      // Oturum geçersiz kalmış olabilir, bir sonraki istek için sıfırla
      innertubeInstance = null;
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
