import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { TtlCache } from "./cache";

describe("TtlCache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should store and retrieve values", () => {
    const cache = new TtlCache<string>(1000, 10);
    cache.set("key1", "value1");
    expect(cache.get("key1")).toBe("value1");
  });

  it("should expire values after TTL", () => {
    const cache = new TtlCache<string>(1000, 10);
    cache.set("key1", "value1");
    
    vi.advanceTimersByTime(1500);
    expect(cache.get("key1")).toBeUndefined();
  });

  it("should respect maxEntries limits (FIFO)", () => {
    const cache = new TtlCache<string>(1000, 2);
    cache.set("key1", "value1");
    cache.set("key2", "value2");
    cache.set("key3", "value3");

    expect(cache.get("key1")).toBeUndefined(); // First one should be evicted
    expect(cache.get("key2")).toBe("value2");
    expect(cache.get("key3")).toBe("value3");
  });
});
