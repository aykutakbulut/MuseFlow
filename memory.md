# MuseFlow — Uygulama Geçmişi (memory.md)

> Bu dosya, PLAN-teknik.md'deki her fazın uygulanmasını takip eder.
> Tarih: 16 Haziran 2026

---

## ✅ FAZ 1 — Kritik Altyapı Düzeltmeleri

**Tamamlanma tarihi:** 16 Haziran 2026  
**Hedef:** Uygulamanın temel fonksiyonları çalışsın — arama yapılabilsin, sonuçlar gelsin, şarkı çalınsın.

---

### 1.1 YouTube API Arama Düzeltmesi ✅

**Dosya:** `src/app/api/search/route.ts`

**Yapılan değişiklikler:**
- [x] YouTube API hata yanıtı `console.error` ile detaylı loglanıyor (HTTP status kodu, hata gövdesi, query ve timestamp dahil)
- [x] YouTube API'den dönen HTTP status'a göre client'a anlamlı hata mesajı iletiliyor:
  - `403` → `QUOTA_EXCEEDED` (kota dolmuş)
  - `400` → `INVALID_REQUEST` (geçersiz istek)
  - `429` → `RATE_LIMITED` (çok fazla istek)
  - Diğer → `YOUTUBE_ERROR`
- [x] API key uzunluk kontrolü eklendi — `apiKey.trim().length < 10` ise `MISSING_API_KEY` hatası döner
- [x] `videoCategoryId=10` parametresi eklendi (sadece müzik videoları getirilir)
- [x] API yanıtı validate ediliyor — `data.items` array değilse `UNEXPECTED_RESPONSE` hatası döner
- [x] Tüm hata yanıtları yapılandırılmış formatta: `{ error: string, code: string, retryable: boolean }`
- [x] Try-catch içinde beklenmeyen hatalar da detaylı loglanıyor

**Önceki durum:** Hata yutuluyordu, client'a sadece "hata oluştu" gidiyordu, API key sadece varlık kontrolü yapılıyordu, müzik filtresi yoktu.

---

### 1.2 next.config.ts Yapılandırma ✅

**Dosya:** `next.config.ts`

**Yapılan değişiklikler:**
- [x] `reactStrictMode: true` eklendi
- [x] `images.remotePatterns` ile YouTube thumbnail domain'leri tanımlandı:
  - `https://i.ytimg.com/**`
  - `https://img.youtube.com/**`

**Önceki durum:** Config tamamen boştu, YouTube thumbnail'leri için domain tanımı yoktu.

---

### 1.3 SEO & Metadata Düzeltmeleri ✅

**Dosya:** `src/app/layout.tsx`

**Yapılan değişiklikler:**
- [x] `metadata.title` → `"MuseFlow — Müzik Keşfet ve Dinle"`
- [x] `metadata.description` → Türkçe, açıklayıcı metin
- [x] `<html lang="en">` → `<html lang="tr">` (uygulama dili Türkçe)
- [x] Open Graph metadata eklendi (`og:title`, `og:description`, `og:type`, `og:locale`, `og:site_name`)
- [x] Twitter Card metadata eklendi (`summary_large_image`)
- [x] `robots: { index: true, follow: true }` eklendi

**Önceki durum:** "Create Next App" default başlık/açıklama, `lang="en"` iken uygulama Türkçeydi, OG/Twitter meta yoktu.

---

### 1.4 Font Güvenilirliği ✅

**Dosya:** `src/app/layout.tsx`

**Yapılan değişiklikler:**
- [x] `Geist` font'una `display: 'swap'` eklendi (font yüklenemezse sistem fontu gösterilir, FOUT önlenir)
- [x] `Geist` için fallback font listesi: `['system-ui', 'arial', 'sans-serif']`
- [x] `Geist_Mono` için `display: 'swap'` eklendi
- [x] `Geist_Mono` için fallback: `['ui-monospace', 'monospace']`

**Önceki durum:** Font yükleme başarısız olursa görsel bozukluk yaşanıyordu, fallback tanımlı değildi.

---

## Mevcut TypeScript Hataları (Faz 1 kapsamı dışı)

`src/components/BottomPlayerBar.tsx` dosyasında 2 adet TS2322 hatası mevcut:
- `onChange` handler'ı `onMouseDown`/`onTouchEnd` prop'larına atanmış, tip uyumsuzluğu var
- **Bu hata Faz 3 (BottomPlayerBar Performans İyileştirmesi) kapsamında düzeltilecek**

---

---

## ✅ FAZ 2 — Backend & API Güçlendirme

**Tamamlanma tarihi:** 16 Haziran 2026  
**Hedef:** API güvenli, performanslı ve güvenilir hale gelsin.

---

### 2.1 API Rate Limiting ✅

**Yeni dosya:** `src/lib/rate-limit.ts`

**Yapılan değişiklikler:**
- [x] IP başına dakikada max 30 istek sınırı koyan in-memory rate limiter yazıldı
- [x] 60 saniyelik kayan pencere (sliding window) mantığı ile çalışır
- [x] Rate limit aşıldığında `429` status ve `Retry-After` header ile yanıt döner
- [x] Her 10 dakikada bir eski girdiler temizlenir (bellek sızıntısı önleme)
- [x] `route.ts`'e entegre edildi; IP `x-forwarded-for` / `x-real-ip` header'larından okunuyor
- [x] Client debounce süresi `400ms → 500ms` olarak güncellendi (`page.tsx`)

---

### 2.2 API Response Caching ✅

**Yeni dosya:** `src/lib/cache.ts`

**Yapılan değişiklikler:**
- [x] Generic `TtlCache<T>` sınıfı yazıldı (TTL + max entry desteği)
- [x] Arama sonuçları için `searchCache` instance'ı: **5 dakika TTL, max 500 sorgu**
- [x] `get()` — TTL süresi dolmuşsa otomatik silme
- [x] `set()` — Kapasite aşıldığında FIFO ile en eski girdi siliniyor
- [x] `prune()` — Manuel temizleme metodu
- [x] `route.ts`'e entegre: aynı sorgu 5 dakika içinde tekrar gelirse YouTube API'ye gidilmiyor
- [x] `X-Cache: HIT/MISS` header'ı eklendi (debug için)
- [x] `Cache-Control: public, max-age=300, stale-while-revalidate=60` header'ı eklendi

---

### 2.3 Input Sanitizasyon ✅

**Dosya:** `src/app/api/search/route.ts`

**Yapılan değişiklikler:**
- [x] Query string maksimum uzunluk limiti: **200 karakter**
- [x] Whitespace trim + çoklu whitespace normalize edildi (`\s+` → tek boşluk)
- [x] Güvensiz karakterler filtrelendi: `< > " ' \` \`\`
- [x] `sanitizeQuery()` utility fonksiyonu oluşturuldu

---

### 2.4 Error Handling İyileştirmesi ✅

**Dosya:** `src/app/api/search/route.ts`

**Yapılan değişiklikler:**
- [x] Tüm log satırlarına IP adresi eklendi
- [x] Yapılandırılmış hata formatı `{ error, code, retryable }` zaten Faz 1'de yapılmıştı; Faz 2'de rate limit ve cache hataları da aynı formata eklendi
- [x] `Request` → `NextRequest` tipine yükseltildi (header okuma için)

---

### 2.5 Yeni API Endpoint: Video Detay ✅

**Yeni dosya:** `src/app/api/video/[id]/route.ts`

**Yapılan değişiklikler:**
- [x] YouTube Data API `videos` endpoint'i ile `snippet + contentDetails + statistics` getiriliyor
- [x] Dönüş alanları: `id, title, description, channel, channelId, publishedAt, thumbnail, duration (ISO 8601), viewCount, likeCount, tags`
- [x] Ayrı `TtlCache` instance'ı: **10 dakika TTL, max 200 video**
- [x] `X-Cache` ve `Cache-Control` header'ları eklendi
- [x] Video ID format validasyonu (`/^[a-zA-Z0-9_-]{6,20}$/`)
- [x] Tüm hata durumları yapılandırılmış formatta döndürülüyor (404, 403, 502 vb.)

---

## Mevcut TypeScript Hataları

✅ **Faz 3 sonrası sıfır TypeScript hatası.**  
BottomPlayerBar'daki onMouseUp/onTouchEnd tip uyumsuzluğu Faz 3'te düzeltildi.

---

## ✅ FAZ 3 — State Management & Player Altyapısı

**Tamamlanma tarihi:** 16 Haziran 2026  
**Hedef:** Player tam fonksiyonel olsun — queue, next/prev, shuffle desteklensin.

---

### 3.1 PlayerContext Yeniden Yapılandırma ✅

**Dosya:** `src/components/PlayerContext.tsx`

**Yapılan değişiklikler:**
- [x] `useMemo` → `useReducer` + `useCallback` mimarisine geçildi (stabil referanslar, gereksiz re-render yok)
- [x] `playerReducer` ile tüm state geçişleri merkezi ve öngörülebilir hale geldi
- [x] `queue: PlayerTrack[]` state eklendi
- [x] `queueIndex: number` state eklendi (-1 = queue dışı)
- [x] `isShuffle: boolean` state eklendi
- [x] `addToQueue(track)` — zaten queue'daysa tekrar eklemez
- [x] `clearQueue()` — queue'yu ve index'i sıfırlar
- [x] `playNext()` — sıradaki şarkıya geçer; shuffle açıksa rastgele, döngü açıksa başa döner
- [x] `playPrev()` — 3 saniyeden fazla oynandıysa başa sarar, değilse önceki şarkıya geçer
- [x] `playPlaylist(tracks)` — tüm playlist'i queue'ya yükler ve ilk şarkıyla başlar
- [x] `playAtIndex(index)` — queue'da belirli bir şarkıyı çalar

**Önceki durum:** Sadece `current` track vardı, queue/shuffle/next/prev yoktu. `useMemo([state])` nedeniyle her render'da tüm consumer'lar yeniden render ediliyordu.

---

### 3.2 LibraryContext İyileştirmesi ✅

**Dosya:** `src/components/LibraryContext.tsx`

**Yapılan değişiklikler:**
- [x] `useMemo` → `useReducer` + `useCallback` mimarisine geçildi
- [x] `deletePlaylist(playlistId)` eklendi
- [x] `renamePlaylist(playlistId, newName)` eklendi
- [x] `removeFromPlaylist(playlistId, trackId)` eklendi
- [x] `reorderPlaylist(playlistId, fromIndex, toIndex)` eklendi (drag-drop için hazır)
- [x] `favorites: string[]` state eklendi
- [x] `toggleFavorite(trackId)` eklendi
- [x] `isFavorite(trackId)` helper fonksiyonu eklendi
- [x] `recentlyPlayed: PlayerTrack[]` state eklendi (max 50, en yeni başta)
- [x] `addToRecentlyPlayed(track)` eklendi — zaten varsa öne taşır
- [x] Storage key `music_library_v1 → music_library_v2` (yeni alanlar için uyumluluk)
- [x] Eski format için güvenli merge: eksik alanlar boş array/object ile doldurulur

**Önceki durum:** Sadece createPlaylist, addToPlaylist, toggleDownload vardı. Silme/düzenleme/favoriler/son dinlenenler yoktu.

---

### 3.3 Hydration Mismatch Düzeltmesi ✅

**Dosya:** `src/components/LibraryContext.tsx`

**Yapılan değişiklikler:**
- [x] `isHydrated: boolean` state eklendi (başlangıçta `false`)
- [x] localStorage yüklemesi tamamlandıktan sonra `setIsHydrated(true)` çağrılıyor
- [x] localStorage'a kaydetme sadece `isHydrated === true` iken yapılıyor (ilk render'da yazmıyor)
- [x] `isHydrated` context'e expose edildi — consumer'lar loading state gösterebilir
- [x] Bozuk localStorage verisi varsa temizleniyor (`removeItem`) ve `isHydrated` yine de `true` setleniyor

**Önceki durum:** Sunucu boş state ile render eder, client localStorage'dan yüklerdi → hydration flash riski.

---

### 3.4 BottomPlayerBar Performans İyileştirmesi ✅

**Dosya:** `src/components/BottomPlayerBar.tsx`

**Yapılan değişiklikler:**
- [x] `requestAnimationFrame` (60 fps) → `setInterval(250ms)` (4 fps) ile zaman güncellemesi
- [x] `useRef` ile `currentTimeRef`, `durationRef`, `seekingRef` — state güncellenmeden önce threshold kontrolü (0.4s eşiği)
- [x] Threshold kontrolü: sadece anlamlı fark varsa `setTime` / `setDuration` çağrılıyor → ~95% daha az re-render
- [x] **Önceki** şarkı butonu eklendi (`playPrev`)
- [x] **Sonraki** şarkı butonu eklendi (`playNext`)
- [x] **Shuffle** toggle butonu eklendi (`setShuffle`)
- [x] Butonlar queue yokken `disabled` oluyor (opacity azalır)
- [x] Queue'daki pozisyon göstergesi: "Sıra: 2 / 10"
- [x] `handleEnded` — queue varsa `playNext()` çağırıyor, yoksa loop/dur mantığı korunuyor
- [x] `onMouseUp` / `onTouchEnd` için `React.MouseEvent | React.TouchEvent` union tipi → **TS2322 hatası giderildi** ✅
- [x] `YouTubeEvent<any>` → `YouTubeEvent<number>` tipine düzeltildi
- [x] Layout yeniden düzenlendi: thumbnail+bilgi sol, kontroller merkez, ses sağ

**Önceki durum:** rAF ile 60 re-render/saniye, önceki/sonraki/shuffle yok, TS tip hataları, `onMouseUp`'a yanlış event handler bağlı.

---

## ⏳ Bekleyen Fazlar (Güncel)

Tüm planlanan teknik iyileştirme fazları (1-6) tamamlandı! 🎉

---

## ✅ FAZ 6 — Test & Güvenilirlik

**Tamamlanma tarihi:** 16 Haziran 2026  
**Hedef:** Temel akışlar test edilmiş olsun, regression riski azalsın.

---

### 6.1 Test Altyapısı Kurulumu ✅

**Yapılan değişiklikler:**
- [x] Gerekli paketler kuruldu (`vitest`, `jsdom`, `@testing-library/react`, vb.)
- [x] `vitest.config.ts` ve `vitest-setup.ts` eklendi (React / JSDOM konfigürasyonu)
- [x] `package.json` dosyasına `"test"` ve `"test:watch"` scriptleri eklendi.

### 6.2 & 6.3 & 6.4 Test Senaryoları ✅

Aşağıdaki birim ve API testleri başarıyla yazıldı ve çalıştırıldı (15 Testin 15'i Başarılı):

- **[x] `src/lib/rate-limit.test.ts` (3 Test)**:
  - İstek sınırını aşmayan IP adresine izin veriyor.
  - Sınırı aşan IP adresine (`limited: true`) blokluyor.
  - TTL/Zaman penceresi dolduğunda limit sıfırlanıyor.

- **[x] `src/lib/cache.test.ts` (3 Test)**:
  - Veri belleğe yazılıyor ve okunuyor.
  - TTL bitince (süre aşımında) veriler expire oluyor.
  - `maxEntries` (FIFO) kuralına tam olarak uyuluyor (fazlalık olan en eski girdi atılıyor).

- **[x] `src/app/api/search/route.test.ts` (3 Test)**:
  - API Anahtarı eksik/yanlışsa `500` HTTP status'ü dönüyor.
  - Çok kısa query isteklerinde hızlıca `200` ve `{ items: [] }` dönüyor.
  - Normal aramalarda YouTube fetch atılıp `200` statüsü ile items dönüyor.

- **[x] `src/components/LibraryContext.test.tsx` (3 Test)**:
  - Context başlangıçta boş başlatılıyor.
  - Listeye Playlist eklenebiliyor ve silinebiliyor.
  - Şarkılar Favorilere eklenebiliyor (toggle edilebiliyor).

- **[x] `src/components/PlayerContext.test.tsx` (3 Test)**:
  - Context boş queue ile başlıyor.
  - `setTrack` ile şarkı çalmaya başlayıp `isPlaying` değişebiliyor.
  - Queue'ya (sıraya) yeni şarkı eklenebiliyor ve `playNext` çağrıldığında queue üzerinden oynatılıyor.

---

## ✅ FAZ 5 — TypeScript, Performans & Kod Kalitesi

**Tamamlanma tarihi:** 16 Haziran 2026  
**Hedef:** Kod tabanı temiz, type-safe ve performanslı olsun.

---

### 5.1 TypeScript Strict Typing ✅

**Yeni dosya:** `src/types/youtube.ts`

**Yapılan değişiklikler:**
- [x] `YouTubeThumbnail`, `YouTubeThumbnails` — ortak thumbnail tipleri
- [x] `YouTubeSearchResultItem`, `YouTubeSearchResponse` — `/search` endpoint tipleri
- [x] `YouTubeVideoItem`, `YouTubeVideoResponse` — `/videos` endpoint tipleri
- [x] `YouTubeVideoContentDetails` (ISO 8601 duration), `YouTubeVideoStatistics` (viewCount, likeCount)
- [x] `YouTubeApiError` — hata yanıt tipi
- [x] `src/app/api/search/route.ts` — `as YouTubeSearchResponse` ile typed
- [x] `src/app/api/video/[id]/route.ts` — `as YouTubeVideoResponse` ile typed
- [x] `src/app/page.tsx` — `YouTubeSearchResponse` import edilerek kullanıldı
- [x] `src/app/track/[id]/page.tsx` — YouTube tipi ile ilgili arama typed
- [x] Tüm `any` kullanımları temizlendi ✅

---

### 5.2 Performans Optimizasyonları ✅

**Yapılan değişiklikler:**
- [x] `TrackCard.tsx` — `<img>` → Next.js `<Image fill sizes="...">` (webp/avif otomatik dönüşüm, lazy loading)
- [x] `TrackCard` — `React.memo` ile sarıldı (arama sonucu listesi gereksiz re-render almıyor)
- [x] `Sidebar` — `React.memo` ile sarıldı
- [x] `SearchBar` — `React.memo` ile sarıldı
- [x] `next.config.ts` — `formats: ['image/avif', 'image/webp']`, `imageSizes`, `deviceSizes`, `minimumCacheTTL: 3600` eklendi
- [x] `page.tsx` parçalandı: `Sidebar`, `SearchBar`, `TrackCard` ayrı dosyalara taşındı

---

### 5.3 Kod Organizasyonu ✅

**Yeni dizinler & dosyalar:**

| Dosya | Açıklama |
|-------|----------|
| `src/types/youtube.ts` | YouTube API tipleri |
| `src/types/` | Shared tip dizini |
| `src/hooks/useDebounce.ts` | Generic debounce hook |
| `src/hooks/` | Custom hook'lar dizini |
| `src/components/Sidebar.tsx` | Sidebar navigasyon bileşeni |
| `src/components/SearchBar.tsx` | Arama girişi bileşeni |
| `src/components/TrackCard.tsx` | Şarkı kartı bileşeni (memo'd) |

**page.tsx boyutu:** ~490 satır → **~250 satır** (%49 küçüldü)

- [x] `page.tsx`'ten `useDebounce` hook'u çıkarıldı — `useEffect + setTimeout` yerine `useDebounce` kullanılıyor
- [x] `lib/` dizini zaten Faz 2'de oluşturulmuştu (`rate-limit.ts`, `cache.ts`)
- [x] Inline `TrackCard` fonksiyon bileşeni → `src/components/TrackCard.tsx`
- [x] Sidebar JSX + helper fonksiyon → `src/components/Sidebar.tsx`
- [x] Arama header JSX → `src/components/SearchBar.tsx`
- [x] `ActiveTab` tipi `Sidebar.tsx`'e taşındı ve re-export edildi

---

### 5.4 Error Boundary ✅

**Yeni dosya:** `src/components/ErrorBoundary.tsx`

**Yapılan değişiklikler:**
- [x] React class `ErrorBoundary` bileşeni yazıldı
- [x] `componentDidCatch` — hata, componentStack ve timestamp ile `console.error` logluyor
- [x] Fallback UI: hata ikonu, Türkçe mesaj, **Yeniden Dene** + **Sayfayı Yenile** butonları
- [x] `handleReset()` — state sıfırlayarak yeniden denemeye izin veriyor
- [x] `src/app/layout.tsx`'e entegre edildi — tüm uygulama ErrorBoundary ile sarıldı
- [x] Custom `fallback` prop desteği mevcut

---

## TypeScript Durum Özeti (Faz 5 Sonu)

✅ **0 TypeScript hatası** — tüm fazlar boyunca temiz derleme korunuyor.


---

## ✅ FAZ 4 — Navigasyon & Sayfa Yapısı

**Tamamlanma tarihi:** 16 Haziran 2026  
**Hedef:** Tüm navigasyon çalışsın, track detay sayfası olsun, mobil navigasyon çalışsın.

---

### 4.1 Sidebar Navigasyon Fonksiyonelliği ✅

**Dosya:** `src/app/page.tsx`

**Yapılan değişiklikler:**
- [x] `activeTab: "kesfet" | "akisim" | "son-dinlenenler" | "favoriler"` state eklendi
- [x] Her sidebar butonuna click handler bağlandı
- [x] Aktif tab sidebar'da görsel olarak vurgulanıyor (bg + ring + yeşil nokta)
- [x] **Keşfet** sekmesi: mevcut arama arayüzü
- [x] **Akışım** sekmesi: playlist grid → tıklayınca PlaylistDetail
- [x] **Son Dinlenenler** sekmesi: `recentlyPlayed` listesi (TrackRow)
- [x] **Favoriler** sekmesi: `favoriteTracks` listesi (TrackMap üzerinden)
- [x] `handlePlay` artık `addToRecentlyPlayed` çağırıyor
- [x] `selectedPlaylistId` state ile playlist içi navigasyon
- [x] Badge'ler: playlist sayısı, son dinlenenler sayısı, favori sayısı

---

### 4.2 Track Detay Sayfası ✅

**Yeni dosya:** `src/app/track/[id]/page.tsx`

**Yapılan değişiklikler:**
- [x] `/api/video/[id]` endpoint'inden video detayları çekiliyor
- [x] Gösterilen bilgiler: başlık, kanal, thumbnail (tam boy), süre, görüntülenme, beğeni
- [x] `parseDuration(iso)` — ISO 8601 formatını `3:45` / `1:02:15` formatına çeviriyor
- [x] `formatCount(n)` — `1234567 → 1.2M`, `4500 → 4.5B` formatında
- [x] Eylem butonları: **Çal**, **Sıraya Ekle**, **♥ Favorilere Ekle**, **♪ Listeye Ekle**, **↓ İndir**
- [x] Thumbnail hover'ında büyük oynat butonu overlay
- [x] İlgili şarkılar: başlığa göre `/api/search` ile aranıyor, mevcut video filtreleniyor, 8 sonuç
- [x] İlgili şarkı kartları `/track/[id]` linkli (Next.js `<Link>`)
- [x] Playlist seçici modal
- [x] Loading skeleton + hata durumu
- [x] `useRouter().back()` ile geri butonu

---

### 4.3 Mobil Navigasyon ✅

**Yeni dosya:** `src/components/MobileNav.tsx`

**Yapılan değişiklikler:**
- [x] Fixed bottom tab bar oluşturuldu (`lg:hidden` ile sadece mobilde görünür)
- [x] 4 tab: Keşfet (🔍), Akışım (♪), Geçmiş (🕐), Favoriler (♥)
- [x] Aktif tab: yeşil renk + üst border göstergesi
- [x] Gradient gölge üstte (içerikle geçiş)
- [x] `BottomPlayerBar` mobilde `bottom-16 lg:bottom-0` yapıldı (MobileNav ile çakışmaz)
- [x] `page.tsx` main: `pb-48 lg:pb-24` ile hem MobileNav hem PlayerBar için yeterli boşluk

---

### 4.4 Playlist Detay Görünümü ✅

**Yeni dosya:** `src/components/PlaylistDetail.tsx`

**Yapılan değişiklikler:**
- [x] Playlist adını inline düzenleme (tıkla → input, blur/Enter'da kaydet)
- [x] Silme butonu + onay dialog (modal overlay)
- [x] Track listesi: numara, thumbnail, başlık, kanal
- [x] Per-track aksiyonlar: ↑↓ sıralama, ▶ Çal, ♥ Favori, + Sıraya Ekle, × Kaldır
- [x] **Tümünü Çal** butonu (`playPlaylist`)
- [x] **Karıştır ve Çal** butonu (shuffle array → `playPlaylist`)
- [x] `trackMap` üzerinden tam track bilgisi çözümleme
- [x] Sıra sayacı gösterimi

---

### 4.5 Şarkıyı Listeye Ekleme UX ✅

**Dosya:** `src/app/page.tsx`

**Yapılan değişiklikler:**
- [x] Her TrackCard'a **♥ Favori**, **+ Listeye Ekle**, **↓ İndir** butonları eklendi
- [x] "Listeye Ekle" butonu modal açıyor
- [x] Modal: mevcut playlist listesi gösteriliyor, tıklayınca ekleniyor
- [x] Modal: **"Yeni liste oluştur ve ekle"** — yeni isim girilip Oluştur'a basılınca `createPlaylist` çağrılıyor
- [x] TrackCard thumbnail'i artık `/track/[id]` linkli (Detay)
- [x] `addToPlaylist` artık tam `PlayerTrack` alıyor → `trackMap`'e de kaydoluyor

---

## LibraryContext Ek Güncelleme (Faz 4 Kapsamında)

- [x] `trackMap: Record<string, PlayerTrack>` state eklendi
- [x] `addToPlaylist(playlistId, track: PlayerTrack)` — artık ID değil tam track alıyor
- [x] `toggleFavorite(trackId, track?)` — track verilirse trackMap'e kaydoluyor
- [x] `TOGGLE_DOWNLOAD` ve `ADD_TO_RECENTLY_PLAYED` da trackMap'i güncelliyor
- [x] Storage key v2 korundu (trackMap yeni alan, merge ile uyumluluk)
- [x] TS kontrolü: **0 hata** ✅

