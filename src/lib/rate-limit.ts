/**
 * Basit in-memory rate limiter.
 * IP başına belirli bir zaman penceresi içinde maksimum istek sayısını sınırlar.
 * Not: Sunucu yeniden başlatıldığında sıfırlanır; production için Redis kullanılmalı.
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

// IP → { count, windowStart } haritası
const store = new Map<string, RateLimitEntry>();

// Her 10 dakikada bir eski girdileri temizle (bellek sızıntısını önle)
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const now = Date.now();
      for (const [ip, entry] of store.entries()) {
        if (now - entry.windowStart > WINDOW_MS * 2) {
          store.delete(ip);
        }
      }
    },
    10 * 60 * 1000,
  );
}

/** Zaman penceresi: 60 saniye */
const WINDOW_MS = 60 * 1000;

/** IP başına pencere içinde izin verilen maksimum istek */
const MAX_REQUESTS = 30;

export interface RateLimitResult {
  /** true ise istek reddedilmeli */
  limited: boolean;
  /** Mevcut penceredeki toplam istek sayısı */
  count: number;
  /** Pencere sıfırlanana kadar kalan ms */
  retryAfterMs: number;
}

/**
 * Verilen IP için rate limit kontrolü yapar ve sayacı artırır.
 * @param ip - İstemci IP adresi
 * @returns RateLimitResult
 */
export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    // Yeni pencere aç
    store.set(ip, { count: 1, windowStart: now });
    return { limited: false, count: 1, retryAfterMs: 0 };
  }

  entry.count += 1;

  if (entry.count > MAX_REQUESTS) {
    const retryAfterMs = WINDOW_MS - (now - entry.windowStart);
    return { limited: true, count: entry.count, retryAfterMs };
  }

  return { limited: false, count: entry.count, retryAfterMs: 0 };
}
