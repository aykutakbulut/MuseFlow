import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hashPassword } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const hasError = resolvedSearchParams.error === "1";

  async function login(formData: FormData) {
    "use server";
    const password = formData.get("password") as string;
    const correctPassword = process.env.APP_PASSWORD;

    if (password === correctPassword) {
      const hashedPassword = await hashPassword(password);
      
      const cookieStore = await cookies();
      cookieStore.set("museflow_auth", hashedPassword, {
        maxAge: 60 * 60 * 24 * 365, // 1 yıl geçerli
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      redirect("/");
    } else {
      redirect("/login?error=1");
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl bg-surface p-8 shadow-2xl border border-white/10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">MuseFlow</h1>
          <p className="text-muted">Lütfen devam etmek için şifreyi girin.</p>
        </div>
        
        {hasError && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-400">
            Hatalı şifre girdiniz. Lütfen tekrar deneyin.
          </div>
        )}
        
        <form action={login} className="space-y-6">
          <div>
            <input
              type="password"
              name="password"
              placeholder="Şifre"
              required
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-primary px-4 py-3 font-bold text-black hover:bg-primary-hover transition-colors"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}
