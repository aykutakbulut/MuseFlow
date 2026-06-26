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

### Faz 2 — Kalıcı oturum (Edge-uyumlu auth)
- [ ] `middleware.ts`'den `require('bcryptjs')` kaldır
- [ ] Web Crypto (`crypto.subtle`, HMAC-SHA256) ile Edge-uyumlu token doğrulama
- [ ] Login'de aynı token üretimi
- [ ] Basic Auth fallback'i sadeleştir/kaldır
- Dosyalar: [middleware.ts](src/middleware.ts), [auth.ts](src/lib/auth.ts), [login/page.tsx](src/app/login/page.tsx)

### Faz 3 — Queue bug fix
- [ ] `SET_TRACK` action'ı queue'yu sıfırlamıyor → playlist çalarken tek şarkıya tıklayınca eski queue kalıyor, şarkı bitince alakasız şarkı çalıyor
- Dosya: [PlayerContext.tsx:63](src/contexts/PlayerContext.tsx#L63)

### Faz 4 — Re-render / GPU yükü azaltma
- [ ] Zaman polling: 250ms → 1000ms, sadece çalarken interval kur
- [ ] PlayerContext `value`'yu memoize et (her render'da yeniden oluşuyor)
- [ ] Progress bar'ı izole bileşene al
- [ ] backdrop-blur-3xl → daha hafif; modal sadece açıkken render
- Dosyalar: [Player.tsx](src/components/player/Player.tsx), [PlayerContext.tsx](src/contexts/PlayerContext.tsx)

### Faz 5 — Fonksiyon denetimi (favoriler, playlist, queue, son dinlenenler)
- [ ] Favoriler ekle/çıkar/kalıcılık
- [ ] Playlist oluştur/sil/yeniden adlandır/ekle/çıkar/sırala
- [ ] Queue: shuffle, loop, next/prev, playlist sonu davranışı
- [ ] Son dinlenenler: 50 sınırı, sıralama
- [ ] Hidrasyon/SSR flicker kontrolü
- Dosyalar: [LibraryContext.tsx](src/contexts/LibraryContext.tsx), [PlaylistDetail.tsx](src/components/cards/PlaylistDetail.tsx), [page.tsx](src/app/page.tsx)

### Faz 6 — Temizlik
- [ ] Sonsuz animasyonları (animate-pulse/spin) sadece yüklenirken göster
- [ ] framer-motion kullanılmıyorsa kaldır
- [ ] Basic Auth fallback'i sadeleştir
- Dosyalar: [page.tsx](src/app/page.tsx), [track/[id]/page.tsx](src/app/track/[id]/page.tsx)
