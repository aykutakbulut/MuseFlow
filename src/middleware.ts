import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const password = process.env.APP_PASSWORD;

  // Şifre tanımlanmamışsa koruma devre dışı kalır
  if (!password) {
    return NextResponse.next();
  }

  const basicAuth = req.headers.get("authorization");

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    if (authValue) {
      // Basic Auth değeri Base64 kodlanmış "username:password" formatındadır
      const [user, pwd] = atob(authValue).split(":");
      
      // Kullanıcı adını önemsemeden sadece şifreyi kontrol ediyoruz
      if (pwd === password) {
        return NextResponse.next();
      }
    }
  }

  // Şifre yanlış veya girilmediyse giriş penceresini göster
  return new NextResponse("Yetkisiz Erişim", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="MuseFlow Güvenli Alan"',
    },
  });
}

// Middleware'in çalışacağı yolları belirliyoruz (statik dosyaları hariç tut)
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|manifest.json|sw.js|icon.png|icon-.*|apple-icon-.*).*)",
  ],
};
