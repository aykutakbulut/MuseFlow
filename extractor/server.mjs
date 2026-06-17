/**
 * MuseFlow Ses Çıkarım Servisi (Extractor)
 * ----------------------------------------
 * Bu servis, YouTube ses akışını çıkarıp istemciye proxy'ler. Vercel'in
 * datacenter IP'si YouTube tarafından bloklandığı için bu servis
 * BLOKLANMAMIŞ bir IP'de çalışmalıdır:
 *   - Oracle Cloud Always Free VM + Cloudflare WARP (WARP_PROXY ayarlı), veya
 *   - Kendi ev bilgisayarın (residential IP, WARP_PROXY boş).
 *
 * KRİTİK: hem çıkarım (player isteği) hem de ses baytlarının çekilmesi AYNI
 * IP'den yapılmalıdır (googlevideo URL'leri çıkış IP'sine kilitlidir). Bu
 * yüzden her iki fetch de aynı `pfetch` (gerekirse WARP proxy) üzerinden gider.
 */

import http from "node:http";
import { Readable } from "node:stream";
import { Innertube, Platform } from "youtubei.js";
import { BG } from "bgutils-js";
import { JSDOM } from "jsdom";
import { fetch as undiciFetch, ProxyAgent } from "undici";

// ── Yapılandırma ───────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 3000;
const WARP_PROXY = process.env.WARP_PROXY?.trim(); // örn. http://warp:1080
const TOKEN = process.env.EXTRACTOR_TOKEN?.trim(); // opsiyonel basit erişim anahtarı
const REQUEST_KEY = "O43z0dpjhgX20SCx4KAo"; // YouTube web BotGuard request key (sabit)
const CACHE_TTL_MS = 60 * 60 * 1000; // PoToken oturumu 1 saat cache'lenir
const CLIENTS = ["TV", "MWEB", "WEB"]; // PoToken ile çözülebilir URL veren client'lar

// Tüm YouTube trafiğini (gerekirse) WARP proxy üzerinden geçiren fetch.
//
// Önemli: youtubei.js, fetch'i global `Request` nesnesiyle çağırır. `undici`
// paketinin fetch'i (farklı instance) bu global Request'i tanımaz. Bu yüzden:
//   - Proxy YOKSA  → global fetch kullan (global Request ile uyumlu).
//   - Proxy VARSA  → Request'i url+init'e çevirip undici fetch + dispatcher ver.
const dispatcher = WARP_PROXY ? new ProxyAgent(WARP_PROXY) : null;

async function pfetch(input, init) {
  if (!dispatcher) {
    return globalThis.fetch(input, init);
  }
  if (typeof input === "string" || input instanceof URL) {
    return undiciFetch(input, { ...init, dispatcher });
  }
  // global Request → url + init normalizasyonu
  const req = input;
  const headers = {};
  req.headers.forEach((v, k) => {
    headers[k] = v;
  });
  const opts = { method: req.method, headers, dispatcher, ...init };
  if (req.method && !["GET", "HEAD"].includes(req.method.toUpperCase())) {
    opts.body = Buffer.from(await req.clone().arrayBuffer());
  }
  return undiciFetch(req.url, opts);
}

// ── PoToken üretimi ────────────────────────────────────────────────
let evaluatorInstalled = false;
function installEvaluator() {
  if (evaluatorInstalled) return;
  // youtubei.js v17 imza çözümü için JS evaluator bundle etmez; kendimiz veriyoruz.
  Platform.shim.eval = (data) => new Function(data.output)();
  evaluatorInstalled = true;
}

async function generatePoToken() {
  const tmp = await Innertube.create({ retrieve_player: false, fetch: pfetch });
  const visitorData = tmp.session.context.client.visitorData;
  if (!visitorData) throw new Error("visitor_data alınamadı");

  const dom = new JSDOM(
    '<!DOCTYPE html><html lang="en"><body></body></html>',
    { url: "https://www.youtube.com/" },
  );
  const g = globalThis;
  g.window = dom.window;
  g.document = dom.window.document;
  g.location = dom.window.location;
  g.origin = dom.window.origin;

  try {
    const bgConfig = {
      fetch: (i, o) => pfetch(i, o),
      globalObj: globalThis,
      identifier: visitorData,
      requestKey: REQUEST_KEY,
    };

    const challenge = await BG.Challenge.create(bgConfig);
    if (!challenge) throw new Error("BotGuard challenge alınamadı");

    const interpreterJs =
      challenge.interpreterJavascript
        .privateDoNotAccessOrElseSafeScriptWrappedValue;
    if (interpreterJs) {
      new Function(interpreterJs)();
    } else {
      throw new Error("BotGuard VM yüklenemedi");
    }

    const result = await BG.PoToken.generate({
      program: challenge.program,
      globalName: challenge.globalName,
      bgConfig,
    });
    if (!result.poToken) throw new Error("PoToken üretilemedi (boş)");

    return { poToken: result.poToken, visitorData };
  } finally {
    delete g.window;
    delete g.document;
    delete g.location;
    delete g.origin;
    dom.window.close();
  }
}

// ── Cache'li oturum ────────────────────────────────────────────────
let cached = null; // { yt, t }
let inFlight = null;

async function createSession() {
  installEvaluator();
  const { poToken, visitorData } = await generatePoToken();
  return Innertube.create({
    lang: "tr",
    location: "TR",
    retrieve_player: true,
    po_token: poToken,
    visitor_data: visitorData,
    fetch: pfetch,
  });
}

async function getSession() {
  if (cached && Date.now() - cached.t < CACHE_TTL_MS) return cached.yt;
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      const yt = await createSession();
      cached = { yt, t: Date.now() };
      return yt;
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}

function resetSession() {
  cached = null;
}

async function resolveAudioUrl(id) {
  const yt = await getSession();
  for (const client of CLIENTS) {
    try {
      const info = await yt.getBasicInfo(id, { client });
      const audio = info.streaming_data?.adaptive_formats?.filter((f) =>
        f.mime_type?.startsWith("audio/"),
      );
      if (!audio?.length) continue;
      const best = audio.sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0];
      const url = best.url ? best.url : await best.decipher(yt.session.player);
      if (url) return url;
    } catch (e) {
      console.warn(`[extractor] "${client}" başarısız (${id}):`, e.message);
    }
  }
  return null;
}

// ── HTTP sunucusu ──────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, "http://localhost");

  // CORS — istemci (Vercel uygulaması) farklı origin'den erişir
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Range");
  res.setHeader(
    "Access-Control-Expose-Headers",
    "Content-Length, Content-Range, Accept-Ranges",
  );

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (u.pathname === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    return res.end(JSON.stringify({ ok: true, warp: !!WARP_PROXY }));
  }

  const match = u.pathname.match(/^\/audio\/([a-zA-Z0-9_-]{6,20})$/);
  if (!match) {
    res.writeHead(404, { "content-type": "application/json" });
    return res.end(JSON.stringify({ error: "not found" }));
  }
  const id = match[1];

  if (TOKEN && u.searchParams.get("k") !== TOKEN) {
    res.writeHead(401, { "content-type": "application/json" });
    return res.end(JSON.stringify({ error: "unauthorized" }));
  }

  try {
    const audioUrl = await resolveAudioUrl(id);
    if (!audioUrl) {
      resetSession(); // oturum geçersiz kalmış olabilir
      res.writeHead(404, { "content-type": "application/json" });
      return res.end(JSON.stringify({ error: "Ses akışı bulunamadı." }));
    }

    const range = req.headers["range"];
    const upstream = await pfetch(audioUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        ...(range ? { Range: range } : {}),
      },
    });

    if (!upstream.ok && upstream.status !== 206) {
      console.error(`[extractor] upstream ${upstream.status} (${id})`);
      res.writeHead(502, { "content-type": "application/json" });
      return res.end(JSON.stringify({ error: "Ses akışı alınamadı." }));
    }

    const headers = { "accept-ranges": "bytes", "cache-control": "public, max-age=600" };
    headers["content-type"] = upstream.headers.get("content-type") ?? "audio/mp4";
    const cl = upstream.headers.get("content-length");
    if (cl) headers["content-length"] = cl;
    const cr = upstream.headers.get("content-range");
    if (cr) headers["content-range"] = cr;

    res.writeHead(upstream.status === 206 ? 206 : 200, headers);
    Readable.fromWeb(upstream.body).pipe(res);
  } catch (e) {
    resetSession();
    console.error(`[extractor] hata (${id}):`, e);
    res.writeHead(500, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "internal" }));
  }
});

server.listen(PORT, () => {
  console.log(
    `[extractor] :${PORT} dinleniyor — WARP proxy: ${WARP_PROXY || "(yok, doğrudan IP)"}, token: ${TOKEN ? "açık" : "kapalı"}`,
  );
});
