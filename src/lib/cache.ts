/**
 * Basit in-memory TTL cache.
 * Aynı sorgu tekrar geldiğinde YouTube API'ye gitmeden cache'den yanıt döner.
 * Not: Sunucu yeniden başlatıldığında sıfırlanır; production için Redis kullanılmalı.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/** Cache varsayılan TTL: 5 dakika */
const DEFAULT_TTL_MS = 5 * 60 * 1000;

/** Maksimum cache boyutu (entry sayısı) */
const MAX_ENTRIES = 500;

export class TtlCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private readonly ttlMs: number;
  private readonly maxEntries: number;

  constructor(ttlMs = DEFAULT_TTL_MS, maxEntries = MAX_ENTRIES) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
  }

  /**
   * Cache'den değer okur. Süresi dolmuşsa undefined döner ve girdisini siler.
   */
  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Cache'e değer yazar. Kapasite aşıldıysa en eski girdiyi siler (FIFO).
   */
  set(key: string, value: T): void {
    // Kapasite kontrolü: en eski girdiyi çıkar
    if (this.store.size >= this.maxEntries && !this.store.has(key)) {
      const firstKey = this.store.keys().next().value;
      if (firstKey !== undefined) {
        this.store.delete(firstKey);
      }
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  /**
   * Belirli bir anahtarı siler.
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Süresi dolmuş tüm girdileri temizler.
   */
  prune(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  /** Kaçıncı entry olduğunu döner */
  get size(): number {
    return this.store.size;
  }
}

/**
 * Arama sonuçları için global cache instance'ı.
 * TTL: 5 dakika, max: 500 sorgu
 */
export const searchCache = new TtlCache<unknown>(DEFAULT_TTL_MS, MAX_ENTRIES);
