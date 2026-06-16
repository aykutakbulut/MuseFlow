# Müzik Platformu Yeni Tasarım Planı (newDesign.md)

## Vizyon ve Tasarım Felsefesi
Bu proje, Spotify'ın sade, şık ve minimal kullanıcı arayüzü ile YouTube Music'in dinamik, içeriğe dayalı (ses/video geçişi) özelliklerini birleştiren modern bir müzik platformudur.  
Tüm geliştirme süreci **"Mobile-First" (Mobil Öncelikli)** kuralına sıkı sıkıya bağlı kalınarak ilerletilecek, Tailwind CSS kullanılarak büyük ekranlar için (`md:`, `lg:` class'ları ile) responsive olarak uyarlanacaktır.

## Layout ve Yerleşim Farkları
- **Mobil Görünüm (< 768px):**  
  - Ana navigasyon ekranın en altında bir **`MobileBottomNav`** olarak yer alır.  
  - **`MiniPlayer`**, alt navigasyon çubuğunun hemen üzerinde yüzer şekilde ve kesintisiz çalışır.  
  - Sol sidebar gizlenir.

- **Masaüstü ve Tablet Görünümü (>= 768px):**  
  - Sol tarafta sabit bir **`DesktopSidebar`** bulunur.  
  - `MobileBottomNav` gizlenir.  
  - `MiniPlayer`, ekranın en alt kısmına tüm genişliğiyle yayılır veya sağ alt köşede zenginleştirilmiş bir modüle dönüşür.

## Renk Paleti ve Tipografi
- **Tema:** Dark Mode (Koyu Tema) öncelikli tasarım. Arka planda `bg-neutral-950` veya tamamen siyah tonlar ağırlıkta olacak.
- **Vurgular (Accent):** Platformun ruhunu yansıtacak neon bir yeşil, mor veya şarkı kapağına göre dinamik olarak değişebilen gradient vurgular.
- **Tipografi:** Modern, temiz ve okunaklı bir Sans-Serif font (Tailwind varsayılan Inter/Roboto tarzı).
- **İkonlar:** Lucide React kullanılarak zarif ve hafif ikonlar tercih edilecek.

---

## Geliştirme Fazları (Yol Haritası)

### Faz 1: Temel Mimari ve Tasarım Sisteminin Kurulması
- Projedeki mevcut yapıların gözden geçirilip gereksiz dosyaların temizlenmesi.
- `tailwind.config.ts` veya `globals.css` içerisine koyu tema renk paleti, tipografi kuralları ve custom utility sınıflarının eklenmesi.
- Component klasör yapısının mantıksal ayrımı (örneğin: `ui`, `layout`, `player`, `cards`).
- **Girdi:** Next.js + Tailwind ortamı.
- **Çıktı:** Renk ve tipografi sisteminin çalışır hale gelmesi.

### Faz 2: Mobile-First Layout ve Temel Navigasyon
- **`MobileBottomNav` Component'i:** (Ana Sayfa, Keşfet, Kitaplık) butonlarını içeren mobil alt barın yapılması.
- **`DesktopSidebar` Component'i:** Masaüstü görünümlerde (`md:flex`) ortaya çıkacak yan navigasyonun tasarlanması.
- **`MainLayout`:** Tüm sayfaları saracak ana layout iskeletinin oluşturulması.

### Faz 3: Dinamik Müzik Çalar (Player & MiniPlayer)
- **`MiniPlayer`:** Spotify tarzı, mobilde alt barın hemen üstünde kesintisiz çalışan mini bar.
- **`FullPlayer` (Tam Ekran Modu):** MiniPlayer'a tıklandığında aşağıdan yukarı doğru açılan (veya modalla genişleyen) detaylı ekran.
- **`Audio/Video Toggle`:** FullPlayer içerisinde YouTube Music tarzında tek tıkla "Sadece Ses" ve "Klip (Video)" görünümü arası geçişi sağlayacak olan düğmenin (toggle) ve video alanının eklenmesi.

### Faz 4: Ana Sayfa ve Yatay Keşfet Listeleri
- **`MoodHeader`:** Ana sayfada kullanıcının anlık ruh haline veya günün saatine (İyi Günler, İyi Akşamlar vb.) uyum sağlayan karşılama bölümü.
- **`HorizontalList` ve `MediaCard` Component'leri:** Parmakla (veya mouse ile) yatay olarak kaydırılabilir, albüm/şarkı/çalma listesi sunan modern kart yapıları.
- Ana sayfanın (Home) sahte (mock) verilerle baştan sona doldurulması.

### Faz 5: İnce Ayarlar, Animasyonlar ve Son Kontroller
- Sayfa ve component geçişlerine (örn. MiniPlayer'dan FullPlayer'a geçerken) pürüzsüz animasyonlar (CSS transitions veya Framer Motion) eklenmesi.
- Tasarımın tüm cihaz boyutlarında (Mobile, Tablet, Desktop) pürüzsüz çalıştığının test edilmesi.
- "Mobile-first" tasarım harikası hissiyatını güçlendirecek micro-interaction'ların (hover efektleri, basılma geri bildirimleri) tamamlanması.

---

> **Not:** Her faz tamamlandığında proje klasöründeki `newDesignMemory.md` dosyası yaratılıp/güncellenecek, nelerin yapıldığı ve projenin o anki durumu detaylıca kaydedilecektir. Sonraki faza ancak bu kayıt işlemi bittikten ve onay alındıktan sonra geçilecektir.
