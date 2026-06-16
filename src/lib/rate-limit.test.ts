import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { checkRateLimit } from "./rate-limit";

describe("rate-limit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should allow requests under the limit", () => {
    const ip = "1.2.3.4";
    for (let i = 0; i < 30; i++) {
      expect(checkRateLimit(ip).limited).toBe(false);
    }
  });

  it("should block requests over the limit", () => {
    const ip = "5.6.7.8";
    for (let i = 0; i < 30; i++) {
      checkRateLimit(ip);
    }
    expect(checkRateLimit(ip).limited).toBe(true);
  });

  it("should reset after window expires", () => {
    const ip = "9.10.11.12";
    for (let i = 0; i < 30; i++) {
      checkRateLimit(ip);
    }
    expect(checkRateLimit(ip).limited).toBe(true);

    // Fast forward 61 seconds
    vi.advanceTimersByTime(61 * 1000);

    expect(checkRateLimit(ip).limited).toBe(false);
  });
});
