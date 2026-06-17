# MuseFlow Extractor — Kurulum Rehberi

Bu servis YouTube ses akışını çıkarıp uygulamana sunar. **Neden gerekli?**
YouTube, Vercel'in datacenter IP'sini "bot" sayıp blokluyor — cookie ve PoToken
ile bile aşılamıyor (kanıtlandı). Çözüm: ses çıkarımını **bloklanmamış bir IP'de**
çalıştırmak. Bu servis tam olarak bunu yapar.

İki engeli birden çözer:
1. **Bot kontrolü** → WARP IP'si (veya residential IP) bloklu değil.
2. **googlevideo URL'si çıkış IP'sine kilitli** → çıkarım + ses proxy'si aynı IP'den yapılır.

---

## Seçenek A: Oracle Cloud Always Free + WARP (7/24, önerilen)

**Tamamen ücretsiz, sonsuza dek, bilgisayarın kapalıyken bile çalışır.**

### 1. Oracle Cloud hesabı + VM oluştur
1. https://www.oracle.com/cloud/free/ → ücretsiz hesap aç (kart doğrulaması ister ama ücret almaz).
2. **Compute → Instances → Create Instance**:
   - Image: **Ubuntu 22.04**
   - Shape: **Ampere (ARM) — VM.Standard.A1.Flex** (Always Free), örn. 1 OCPU / 6 GB RAM yeter.
   - SSH key ekle (kendi anahtarın veya oluşturduğun).
3. Oluştuktan sonra **public IP**'yi not et (örn. `140.238.1.2`).

### 2. Ağ portlarını aç
**a) Oracle Security List** (VCN → Subnet → Security List → Add Ingress Rules):
   - `0.0.0.0/0` TCP **80** ve TCP **443** (Caddy/HTTPS için).

**b) VM içinde firewall** (SSH ile bağlandıktan sonra):
```bash
sudo iptables -I INPUT 1 -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 1 -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save     # kalıcı yap (yoksa: sudo apt install iptables-persistent)
```

### 3. Docker kur
```bash
sudo apt update && sudo apt install -y docker.io docker-compose-plugin git
sudo usermod -aG docker $USER && newgrp docker
```

### 4. Bu klasörü VM'e kopyala
```bash
# kendi makinende, repo kökünde:
scp -r extractor ubuntu@<VM_IP>:~/extractor
# (veya repoyu VM'de git clone edip extractor klasörüne gir)
cd ~/extractor
```

### 5. Ayarla ve başlat
```bash
cp .env.example .env
nano .env
#   DOMAIN=<VM_IP>.sslip.io        ← public IP'yi yaz (örn. 140.238.1.2.sslip.io)
#   EXTRACTOR_TOKEN=<uzun-rastgele-string>   ← `openssl rand -hex 16` ile üret

docker compose up -d --build
```

### 6. Çalıştığını doğrula
```bash
curl -s https://<VM_IP>.sslip.io/health
# → {"ok":true,"warp":true}   beklenir (warp:true ÖNEMLİ)
```
WARP IP'sinin gerçekten bloklanmamış olduğunu test et:
```bash
curl -s "https://<VM_IP>.sslip.io/audio/ftm1hiXgYsA?k=<TOKEN>" -o /dev/null -w "%{http_code}\n"
# → 200 ya da 206 görmelisin (404 ise loglara bak: docker compose logs extractor)
```

> İlk istek PoToken üretimi yüzünden birkaç saniye sürer; sonra 1 saat hızlıdır.

### 7. Vercel'e bağla
Vercel → Settings → Environment Variables:
- `NEXT_PUBLIC_EXTRACTOR_URL` = `https://<VM_IP>.sslip.io`
- `NEXT_PUBLIC_EXTRACTOR_TOKEN` = (`.env`'deki `EXTRACTOR_TOKEN` ile **aynı**)

Sonra **Redeploy** et. Bitti — uygulama artık sesi buradan çekecek.

---

## Seçenek B: Kendi PC / Raspberry Pi (residential IP, WARP'sız)

Residential IP zaten bloklanmadığı için WARP'a gerek yok.

```bash
cd extractor
npm install
EXTRACTOR_TOKEN=<uzun-rastgele> node server.mjs   # :3000 dinler, WARP yok
```
İnternete açmak için (HTTPS şart, çünkü Vercel https):
```bash
# Cloudflare Tunnel (ücretsiz):
cloudflared tunnel --url http://localhost:3000
# verdiği https://....trycloudflare.com adresini NEXT_PUBLIC_EXTRACTOR_URL yap
```
> Quick tunnel URL'si her yeniden başlatmada değişir; kalıcı adres için Cloudflare'de
> isimli tunnel (bir alan adıyla) kur. PC açık olduğu sürece çalışır.

---

## Bakım / Sorun Giderme

| Komut | Açıklama |
|---|---|
| `docker compose logs -f extractor` | Çıkarım loglarını izle |
| `docker compose logs -f warp` | WARP bağlantı durumu |
| `docker compose restart extractor` | Servisi yeniden başlat |
| `docker compose down && docker compose up -d --build` | Tam yeniden kurulum |

- **`warp:false` görünüyorsa**: `WARP_PROXY` env geçmemiş; compose'u kontrol et.
- **404 + loglarda LOGIN_REQUIRED**: WARP IP'si de bloklanmış olabilir (nadiren). `docker compose restart warp` ile yeni WARP IP'si al, tekrar dene.
- **HTTPS sertifikası alınamıyor**: 80/443 portları dışarı açık mı? `docker compose logs caddy`.
- **sslip.io çözmüyorsa** alternatif: `<IP>.nip.io` dene (`.env`'de DOMAIN'i değiştir).

## Güvenlik notu
`EXTRACTOR_TOKEN` istemciye gömülü olduğu için tam gizli değildir; sadece gelişigüzel
kötüye kullanımı zorlaştırır. Daha sıkı koruma istersen Caddy'ye IP allowlist veya
Cloudflare Access ekleyebilirsin.
