import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const password = process.env.APP_PASSWORD;

  // Şifre tanımlanmamışsa koruma devre dışı kalır
  if (!password) {
    return NextResponse.next();
  }

  // Eğer zaten login sayfasındaysa devam et
  if (req.nextUrl.pathname === "/login") {
    return NextResponse.next();
  }

  const authCookie = req.cookies.get("museflow_auth");

  // Cookie varsa ve doğruysa devam et
  if (authCookie && authCookie.value === password) {
    return NextResponse.next();
  }

  // Geriye uyumluluk için Basic Auth kontrolü
  const basicAuth = req.headers.get("authorization");
  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    if (authValue) {
      const [, pwd] = atob(authValue).split(":");
      if (pwd === password) {
        return NextResponse.next();
      }
    }
  }

  // Cookie veya Basic Auth yoksa/yanlışsa login sayfasına yönlendir
  const loginUrl = new URL("/login", req.url);
  return NextResponse.redirect(loginUrl);
}

// Middleware'in çalışacağı yolları belirliyoruz (statik dosyaları ve api'yi hariç tut)
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|manifest.json|sw.js|icon.png|icon-.*|apple-icon-.*).*)",
  ],
};
