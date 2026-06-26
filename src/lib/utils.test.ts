import { describe, it, expect } from "vitest";
import { shuffleArray } from "./utils";

describe("shuffleArray", () => {
  it("does not mutate the original array", () => {
    const original = [1, 2, 3, 4, 5];
    const copy = [...original];
    shuffleArray(original);
    expect(original).toEqual(copy);
  });

  it("returns an array with the same elements (same multiset)", () => {
    const original = [1, 2, 3, 4, 5];
    const result = shuffleArray(original);
    expect([...result].sort()).toEqual([...original].sort());
    expect(result).toHaveLength(original.length);
  });

  it("produces a roughly uniform distribution of positions (not biased like sort-based shuffle)", () => {
    // 0'ın son pozisyonda (index 4) ne sıklıkla bittiğini say.
    // sort(() => Math.random() - 0.5) ile bu dağılım ciddi şekilde sapardı;
    // doğru Fisher-Yates'te her pozisyon ~%20 olasılıkla gelmeli (5 eleman).
    const positions = [0, 0, 0, 0, 0];
    const runs = 5000;
    for (let i = 0; i < runs; i++) {
      const result = shuffleArray([0, 1, 2, 3, 4]);
      const idx = result.indexOf(0);
      positions[idx]! += 1;
    }
    // Her pozisyon ~1000 (5000/5) civarında olmalı; geniş bir tolerans (±300)
    // ile gerçek uniform dağılımı doğruluyoruz, flaky olmasın diye sıkı değil.
    for (const count of positions) {
      expect(count).toBeGreaterThan(700);
      expect(count).toBeLessThan(1300);
    }
  });

  it("handles empty and single-element arrays without errors", () => {
    expect(shuffleArray([])).toEqual([]);
    expect(shuffleArray([42])).toEqual([42]);
  });
});
