import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Fisher-Yates ile düzgün (uniform) rastgele karıştırma.
 * `array.sort(() => Math.random() - 0.5)` kalıbı kullanılmaz — stabil sort
 * algoritmaları (V8'in TimSort'u dahil) bu komparatörle düzgün dağılım
 * üretmez, bazı sıralamalar diğerlerinden çok daha olası çıkar.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
