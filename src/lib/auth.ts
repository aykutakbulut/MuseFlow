// Oturum cookie'si için Edge Runtime uyumlu, Web Crypto tabanlı imzalama.
// (bcryptjs Edge'de `require()` ile çalışmıyordu — middleware her istekte
// hata alıp /login'e yönlendiriyordu. Web Crypto hem Edge hem Node'da nativedir.)

const TOKEN_PAYLOAD = "museflow-session-v1";

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(TOKEN_PAYLOAD),
  );
  return bufferToHex(signature);
}

/** Şifreden, oturum cookie'sinde saklanacak deterministik token üretir. */
export async function createSessionToken(password: string): Promise<string> {
  return hmac(password);
}

/** Cookie'deki token'ın doğru şifreden üretildiğini sabit-zamanlı karşılaştırmayla doğrular. */
export async function verifySessionToken(
  token: string,
  password: string,
): Promise<boolean> {
  const expected = await hmac(password);
  if (token.length !== expected.length) return false;

  let mismatch = 0;
  for (let i = 0; i < token.length; i++) {
    mismatch |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}
