import { Innertube, Platform } from "youtubei.js";
import { BG } from "bgutils-js";
import { JSDOM } from "jsdom";

/**
 * YouTube'un "Bot olmadığınızı doğrulayın" (LOGIN_REQUIRED) blokunu aşmak için
 * bir Proof-of-Origin Token (PoToken) üretir ve PoToken ile yapılandırılmış,
 * ses akışı çıkarmaya hazır bir Innertube oturumu sağlar.
 *
 * Datacenter IP'lerinde (Vercel) bot kontrolünü geçmenin tek güvenilir yolu
 * budur. PoToken üretimi pahalıdır (BotGuard challenge + VM), bu yüzden hem
 * token hem de Innertube oturumu cache'lenir.
 */

// YouTube web istemcisinin BotGuard request key'i (sabit, herkese açık)
const REQUEST_KEY = "O43z0dpjhgX20SCx4KAo";

// PoToken cache süresi — token'ın TTL'si genelde birkaç saattir.
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 saat

type CachedSession = {
  innertube: Innertube;
  createdAt: number;
};

let cached: CachedSession | null = null;
let inFlight: Promise<Innertube> | null = null;
let evaluatorInstalled = false;

/**
 * youtubei.js v17 Node platformu imza (signature) çözümü için bir JS evaluator
 * bundle ETMEZ — kendi evaluator'ımızı sağlamamız gerekir.
 *
 * `data.output`, gövdesi `return process(...)` ile biten bir JS kod parçasıdır;
 * çalıştırıldığında `{ sig, n }` döndürür.
 */
function installEvaluator() {
  if (evaluatorInstalled) return;
  Platform.shim.eval = (data: { output: string }) => {
    return new Function(data.output)();
  };
  evaluatorInstalled = true;
}

async function generatePoToken(): Promise<{
  poToken: string;
  visitorData: string;
}> {
  // 1) visitor_data elde etmek için geçici bir Innertube oturumu
  const tmp = await Innertube.create({ retrieve_player: false });
  const visitorData = tmp.session.context.client.visitorData;

  if (!visitorData) {
    throw new Error("visitor_data alınamadı");
  }

  // 2) BotGuard VM'inin ihtiyaç duyduğu tarayıcı global'lerini jsdom ile sağla
  const dom = new JSDOM(
    '<!DOCTYPE html><html lang="en"><body></body></html>',
    { url: "https://www.youtube.com/" },
  );

  const g = globalThis as unknown as Record<string, unknown>;
  g.window = dom.window;
  g.document = dom.window.document;
  g.location = dom.window.location;
  g.origin = dom.window.origin;

  try {
    const bgConfig = {
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        fetch(input, init),
      globalObj: globalThis as unknown as Record<string, unknown>,
      identifier: visitorData,
      requestKey: REQUEST_KEY,
    };

    // 3) BotGuard challenge'ı al
    const challenge = await BG.Challenge.create(bgConfig);
    if (!challenge) {
      throw new Error("BotGuard challenge alınamadı");
    }

    // 4) Challenge yorumlayıcı (interpreter) JS'ini VM'e yükle
    const interpreterJs =
      challenge.interpreterJavascript
        .privateDoNotAccessOrElseSafeScriptWrappedValue;

    if (interpreterJs) {
      new Function(interpreterJs)();
    } else {
      throw new Error("BotGuard VM yüklenemedi");
    }

    // 5) PoToken üret
    const result = await BG.PoToken.generate({
      program: challenge.program,
      globalName: challenge.globalName,
      bgConfig,
    });

    if (!result.poToken) {
      throw new Error("PoToken üretilemedi (boş)");
    }

    return { poToken: result.poToken, visitorData };
  } finally {
    // jsdom global'lerini temizle — youtubei.js'in tarayıcı moduna geçip
    // decipher'ı bozmasını önler
    delete g.window;
    delete g.document;
    delete g.location;
    delete g.origin;
    dom.window.close();
  }
}

async function createSession(): Promise<Innertube> {
  installEvaluator();
  const { poToken, visitorData } = await generatePoToken();

  return Innertube.create({
    lang: "tr",
    location: "TR",
    retrieve_player: true,
    po_token: poToken,
    visitor_data: visitorData,
  });
}

/**
 * PoToken ile yapılandırılmış, cache'li bir Innertube oturumu döndürür.
 * Eşzamanlı istekler tek bir üretim işlemini paylaşır.
 */
export async function getStreamingSession(): Promise<Innertube> {
  if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
    return cached.innertube;
  }

  if (inFlight) {
    return inFlight;
  }

  inFlight = (async () => {
    try {
      const innertube = await createSession();
      cached = { innertube, createdAt: Date.now() };
      return innertube;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

/** Cache'i temizler — oturum geçersiz kaldığında çağrılır. */
export function resetStreamingSession() {
  cached = null;
}
