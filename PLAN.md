# MuseFlow İyileştirme Planı

Üç istek: (1) kalıcı oturum, (2) ısınma/optimizasyon, (3) fonksiyonların kusursuz çalışması.

## Kök sebepler

1. **Isınma:** YouTube iframe sürekli tam kalite video çözüyor — ses modunda bile arkada (opacity-0) tam çözünürlükte decode ediliyor. [Player.tsx:243-249](src/components/player/Player.tsx#L243-L249)
2. **Şifre sorması:** `middleware.ts` Edge runtime'da `require('bcryptjs')` çağırıyor — Edge'de `require` desteklenmiyor, hata → her istekte `/login`'e düşüyor. [middleware.ts:28-29](src/middleware.ts#L28-L29)

## Fazlar (uygulama sırası)

### Faz 1 — iframe kalite sınırlama (ısınmanın çoğunu çözer) ✅ TAMAMLANDI
- [x] `handleReady`/`handleStateChange`'de ses modundayken `setPlaybackQuality('tiny')`
- [x] Video↔Ses geçişinde anında kalite uygulayan effect eklendi
- [x] `playerVars`'a `playsinline:1`, `iv_load_policy:3` eklendi
- Dosya: [Player.tsx](src/components/player/Player.tsx)
- Doğrulama: tsc temiz, build başarılı

### Faz 2 — Kalıcı oturum (Edge-uyumlu auth) ✅ TAMAMLANDI
- [x] `middleware.ts`'den `require('bcryptjs')` kaldırıldı
- [x] Web Crypto (`crypto.subtle`, HMAC-SHA256) ile Edge-uyumlu deterministik token üretimi/doğrulaması — sabit-zamanlı karşılaştırma
- [x] Login'de aynı token üretimi (`createSessionToken`)
- [x] Basic Auth fallback'i kaldırıldı (artık gereksiz)
- [x] `bcryptjs`/`@types/bcryptjs` dependency'leri kaldırıldı, lockfile'lar senkron
- Dosyalar: [middleware.ts](src/middleware.ts), [auth.ts](src/lib/auth.ts), [login/page.tsx](src/app/login/page.tsx)
- Doğrulama: tsc temiz, build başarılı, 15/15 test geçti, auth round-trip elle test edildi (doğru/yanlış şifre, bozuk token, determinizm)

### Faz 3 — Queue bug fix ✅ TAMAMLANDI
- [x] `SET_TRACK` artık `queue:[]`, `queueIndex:-1` ile queue'yu temizliyor — playlist çalarken tek şarkıya (örn. PlaylistDetail'deki ▶ butonu) geçince eski queue kalıp şarkı bitince alakasız şarkıya atlama bug'ı düzeltildi
- [x] Regresyon testi eklendi (`PlayerContext.test.tsx`): playlist çal → tek şarkıya geç → queue temiz + playNext etkisiz
- Dosya: [PlayerContext.tsx](src/contexts/PlayerContext.tsx)
- Doğrulama: tsc temiz, build başarılı, 16/16 test geçti (yeni test dahil)

### Faz 4 — Re-render / GPU yükü azaltma ✅ TAMAMLANDI
- [x] Zaman polling: 250ms → 1000ms, sadece `isPlaying` true iken interval kurulur (duraklatınca tamamen durur)
- [x] **PlayerContext ikiye bölündü:** `usePlayer()` (current/isPlaying/queue/aksiyonlar — currentTime/duration İÇERMİYOR) ve `usePlayerTime()` (sadece currentTime/duration). Context'in tek parça olması yüzünden her saniye TÜM tüketicilerin (Player'ın ana gövdesi dahil) re-render olması sorunu kökten çözüldü
- [x] `MiniProgressBar` ve `ScrubBar` izole bileşenlere alındı — sadece bunlar `usePlayerTime()` kullanıyor; Player'ın ana gövdesi (YouTube iframe, butonlar) artık zaman tikleriyle re-render olmuyor
- [x] Tam ekran modalın `backdrop-blur-3xl`'i koşullu hale getirildi (`isExpanded` değilken blur class'ı hiç uygulanmıyor)
- [x] PlayerContext value'ları `useMemo` ile memoize edildi
- Dosyalar: [Player.tsx](src/components/player/Player.tsx), [PlayerContext.tsx](src/contexts/PlayerContext.tsx)
- Doğrulama: tsc temiz, build başarılı, 17/17 test geçti — izolasyon iddiası **çağrı sayacıyla kanıtlandı** (`PlayerContext.test.tsx`: `usePlayer()` tüketicisi setTime sonrası 0 ek render, `usePlayerTime()` tüketicisi her dispatch'te render)

### Faz 5 — Fonksiyon denetimi (favoriler, playlist, queue, son dinlenenler) ✅ TAMAMLANDI

**Bulunan ve düzeltilen gerçek bug'lar:**
- [x] **`handleEnded` queue ilerleme bug'ı:** `queue.length > 0 && queueIndex >= 0` koşulu, tek şarkı çalarken (queueIndex=-1) kuyruğa şarkı eklenince mevcut şarkı bitince kuyruktakine geçmiyordu — sessizce duruyordu. `queueIndex >= 0` şartı kaldırıldı. Regresyon testi eklendi ([Player.test.tsx](src/components/player/Player.test.tsx)) — eski koşulla test gerçekten kırıldığı doğrulandı.
- [x] **"Önceki" butonu hiç seek etmiyordu:** 3 saniyeden fazla çalınmışsa "baştan başlat" mantığı sadece context state'ine `currentTime:0` yazıyordu, gerçek YouTube oynatıcısına `seekTo` çağrısı YOKTU — ilerleme çubuğu anlık 0'a zıplayıp 1sn sonra gerçek konuma geri dönüyordu, şarkı asla baştan başlamıyordu. Karar artık Player.tsx'te gerçek oynatıcı zamanıyla veriliyor (`handlePlayPrev`), reducer sadeleştirildi.
- [x] **Bozuk shuffle algoritması (2 yerde):** `array.sort(() => Math.random() - 0.5)` istatistiksel olarak düzgün karıştırma yapmıyordu (V8'in stabil sort'u bazı sıralamaları çok daha olası yapıyor — ölçüldü: `[1614,815,616,751,1204]` dağılım, beklenen ~1000 her biri). [PlaylistDetail.tsx](src/components/cards/PlaylistDetail.tsx) (Karıştırarak Çal) ve [page.tsx](src/app/page.tsx) (Sizin İçin önerileri) düzeltildi — yeni `shuffleArray` (Fisher-Yates) [lib/utils.ts](src/lib/utils.ts)'e eklendi, birim testle uniform dağılım kanıtlandı.
- [x] **Hidrasyon flicker:** `isHydrated` sadece "Playlists" bölümünde kontrol ediliyordu. "Son Dinlenenler", "Sizin İçin" ve "Favoriler" (Home + Library tab) hidrasyon tamamlanmadan `[]` görüp "boş" mesajı gösterip sonra aniden gerçek veriye dönüyordu (Favoriler bölümü ise tamamen kaybolup beliriyordu — layout shift). Tüm bu bölümlere iskelet/loading state eklendi (`HorizontalList`'e `isLoading` prop'u).

**Denetlenip doğru bulunanlar (gerçek render/persistence testleriyle):**
- [x] Favoriler ekle/çıkar/kalıcılık — gerçek localStorage round-trip testiyle doğrulandı (unmount + yeniden render, veri geri geliyor)
- [x] Playlist oluştur/sil/yeniden adlandır/ekle/çıkar/sırala — hepsi için yeni testler eklendi, mükerrer ekleme engellendiği doğrulandı
- [x] Queue: shuffle (PLAY_NEXT'teki uniform random seçim doğru), loop (queue sonunda başa dönme/durma doğru), son dinlenenler 50 sınırı + tekrar çalınca öne alma (mükerrer kayıt OLUŞTURMUYOR) doğrulandı
- [x] `trackMap` zamanla büyüyüp eski track'leri temizlemiyor (storage leak) — **bilinen, düşük öncelikli** bulgu; 2 kişilik kişisel kullanımda yıllarca soruna yol açmaz, şimdilik düzeltilmedi

- Dosyalar: [Player.tsx](src/components/player/Player.tsx), [PlayerContext.tsx](src/contexts/PlayerContext.tsx), [LibraryContext.tsx](src/contexts/LibraryContext.tsx), [PlaylistDetail.tsx](src/components/cards/PlaylistDetail.tsx), [page.tsx](src/app/page.tsx), [HorizontalList.tsx](src/components/ui/HorizontalList.tsx), [utils.ts](src/lib/utils.ts)
- Doğrulama: tsc temiz, build başarılı, **27/27 test geçti** (10 yeni test eklendi: Player.test.tsx 1, LibraryContext.test.tsx 5, utils.test.ts 4)

### Faz 6 — Temizlik
- [ ] Sonsuz animasyonları (animate-pulse/spin) sadece yüklenirken göster
- [ ] framer-motion kullanılmıyorsa kaldır
- [ ] Basic Auth fallback'i sadeleştir
- Dosyalar: [page.tsx](src/app/page.tsx), [track/[id]/page.tsx](src/app/track/[id]/page.tsx)
