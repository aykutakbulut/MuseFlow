# MuseFlow 🎵

MuseFlow, YouTube altyapısını kullanan, Spotify kalitesinde ve modern bir arayüze sahip açık kaynaklı bir müzik dinleme platformudur. Tamamen **Progressive Web App (PWA)** desteklidir; telefonunuza bir mobil uygulama gibi kurabilir, favorilerinizi ve çalma listelerinizi oluşturabilirsiniz.

## 🌟 Özellikler
- **Sınırsız Müzik:** YouTube'daki tüm şarkılara ve müzik videolarına anında erişim.
- **Kendi API Key'in (BYOK):** Sistem kendi `.env` dosyanızdaki YouTube API Key'i ile çalışır. Bu sayede hiçbir sınır ve kota derdi olmadan kendi uygulamanızı kullanırsınız.
- **PWA (Mobil Uygulama Desteği):** Telefonunuzda veya masaüstünüzde Chrome/Safari üzerinden uygulamayı ana ekrana ekleyerek, yerel bir uygulama (native app) gibi kullanabilirsiniz.
- **Gelişmiş Kitaplık:** Beğendiğiniz şarkıları favorilere ekleyin, kendi çalma listelerinizi oluşturun.

---

## 🚀 Kurulum (Kendi Sunucunda Çalıştır)

Projeyi kendi bilgisayarında veya Vercel gibi bir platformda çalıştırmak için aşağıdaki adımları sırasıyla takip etmen yeterli. Yeni başlayan bir yazılımcı olsan bile bu adımlarla kolayca kurulum yapabilirsin!

### Adım 1: YouTube API Key Almak
Uygulamanın arama yapabilmesi için sana özel bir YouTube Data API Key'e ihtiyacı var. Bu işlem tamamen ücretsizdir.

1. [Google Cloud Console](https://console.cloud.google.com/) adresine git ve Google hesabınla giriş yap.
2. Üst menüden **Select a project** (Proje seç) kısmına tıklayıp **New Project** (Yeni Proje) oluştur.
3. Projeni oluşturduktan sonra soldaki menüden **APIs & Services > Library** kısmına gir.
4. Arama kutusuna `YouTube Data API v3` yaz, tıkla ve **Enable** (Etkinleştir) butonuna bas.
5. Etkinleştirdikten sonra sol menüden **APIs & Services > Credentials** (Kimlik Bilgileri) sekmesine gel.
6. Üstten **Create Credentials > API Key** seçeneğine tıkla.
7. Ekranda beliren karmaşık şifre senin `YOUTUBE_API_KEY` değerindir. Kopyala ve kimseye verme!

### Adım 2: Projeyi Bilgisayarına İndir ve Kur

Bilgisayarında [Node.js](https://nodejs.org/) (veya pnpm) yüklü olmalıdır.

1. Projeyi bilgisayarına indir veya git ile klonla:
   ```bash
   git clone https://github.com/KULLANICI_ADIN/museflow.git
   cd museflow
   ```

2. Proje klasörünün içine `.env.local` adında yeni bir dosya oluştur ve içine az önce aldığın API anahtarını şu şekilde yapıştır:
   ```env
   YOUTUBE_API_KEY="AIzaSyB-xxxxxxxxxxxxxxxxxxxx"
   APP_PASSWORD="benim-gizli-sifrem"
   ```
   *(Not: `APP_PASSWORD` uygulamanıza dışarıdan erişimi engellemek için kullanılır. Siteye giren herkesin bu şifreyi girmesi gerekir. Boş bırakırsanız şifre koruması devre dışı kalır.)*

3. Gerekli paketleri/kütüphaneleri yükle:
   ```bash
   pnpm install
   # veya 'npm install' kullanabilirsin
   ```

4. Uygulamayı başlat:
   ```bash
   pnpm dev
   # veya 'npm run dev' kullanabilirsin
   ```

5. Tarayıcında `http://localhost:3000` adresine giderek kendi müzik uygulamanın keyfini çıkar! 🎉

### Adım 3: İnternette Yayınlama (Vercel vb.)

Eğer projeyi sadece bilgisayarında değil, internette herkesin girebileceği bir site olarak yayınlamak istersen en kolay yöntem [Vercel](https://vercel.com/)'dir.

1. Projeni kendi Github hesabına repo olarak yükle.
2. Vercel'e giriş yap ve **Add New > Project** seçeneğine tıkla.
3. Github hesaplarındaki `museflow` reponu bulup **Import** butonuna bas.
4. Gelen kurulum ekranında **Environment Variables** (Ortam Değişkenleri) bölümünü aç.
5. Name kısmına `YOUTUBE_API_KEY` yaz, Value kısmına ise Google'dan kopyaladığın o şifreyi yapıştır. Ardından aynı şekilde `APP_PASSWORD` adında bir değişken daha ekle ve uygulamanı korumak istediğin giriş şifreni yaz.
6. **Deploy** butonuna bas. Birkaç dakika içinde uygulaman internette yayında olacak! Artık siteye girenler senin belirlediğin `APP_PASSWORD` şifresiyle giriş yapabilecek. (Kullanıcı adı bölümüne herhangi bir şey yazılabilir).

---

*Geliştiriciler için not: Proje Next.js (App Router), Tailwind CSS, Framer Motion ve next-pwa kullanılarak geliştirilmiştir. Tüm veriler şimdilik tarayıcının LocalStorage'ında tutulmaktadır.*

<br/>
<br/>

---

# MuseFlow 🎵 (English)

MuseFlow is an open-source music streaming platform that uses the YouTube infrastructure, featuring Spotify-level quality and a modern interface. It is fully **Progressive Web App (PWA)** supported; you can install it on your phone like a native mobile app, and create your own favorites and playlists.

## 🌟 Features
- **Unlimited Music:** Instant access to all songs and music videos on YouTube.
- **Bring Your Own Key (BYOK):** The system works with your own YouTube API Key stored in your `.env` file. This allows you to use your app without any limits or quota issues.
- **PWA (Mobile App Support):** By adding the app to your home screen via Chrome/Safari on your phone or desktop, you can use it just like a native app.
- **Advanced Library:** Add your favorite songs and create your own custom playlists.

---

## 🚀 Installation (Run on your own server)

Follow the steps below to run the project on your own computer or on a platform like Vercel. Even if you are a beginner developer, you can easily install it with these steps!

### Step 1: Get a YouTube API Key
The application needs a personal YouTube Data API Key to perform searches. This process is completely free.

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and log in with your Google account.
2. Click on **Select a project** from the top menu and create a **New Project**.
3. After creating your project, go to **APIs & Services > Library** from the left menu.
4. Type `YouTube Data API v3` in the search box, click on it, and press the **Enable** button.
5. Once enabled, go to the **APIs & Services > Credentials** tab from the left menu.
6. Click on **Create Credentials > API Key** from the top.
7. The complex password that appears on the screen is your `YOUTUBE_API_KEY`. Copy it and keep it secret!

### Step 2: Download and Install the Project

You must have [Node.js](https://nodejs.org/) (or pnpm) installed on your computer.

1. Download the project to your computer or clone it with git:
   ```bash
   git clone https://github.com/YOUR_USERNAME/museflow.git
   cd museflow
   ```

2. Create a new file named `.env.local` in the project folder and paste the API key you just got like this:
   ```env
   YOUTUBE_API_KEY="AIzaSyB-xxxxxxxxxxxxxxxxxxxx"
   APP_PASSWORD="my-secret-password"
   ```
   *(Note: `APP_PASSWORD` is used to restrict access to your app. Anyone visiting the site must enter this password. If left blank, password protection is disabled.)*

3. Install the required packages/libraries:
   ```bash
   pnpm install
   # or you can use 'npm install'
   ```

4. Start the application:
   ```bash
   pnpm dev
   # or you can use 'npm run dev'
   ```

5. Go to `http://localhost:3000` in your browser and enjoy your own music app! 🎉

### Step 3: Deploying to the Internet (Vercel etc.)

If you want to publish the project as a website accessible to everyone on the internet, rather than just on your computer, the easiest method is [Vercel](https://vercel.com/).

1. Upload your project as a repo to your own Github account.
2. Log in to Vercel and click on **Add New > Project**.
3. Find your `museflow` repo from your Github accounts and click the **Import** button.
4. On the setup screen, open the **Environment Variables** section.
5. Type `YOUTUBE_API_KEY` in the Name field, and paste the password you copied from Google into the Value field. Add another variable named `APP_PASSWORD` and set it to the password you want to use to protect your app.
6. Click the **Deploy** button. Your application will be live on the internet in a few minutes! Now, visitors can log in using the `APP_PASSWORD` you set. (The username field can be filled with anything).

---

*Note for developers: The project is developed using Next.js (App Router), Tailwind CSS, Framer Motion, and next-pwa. All data is currently stored in the browser's LocalStorage.*
