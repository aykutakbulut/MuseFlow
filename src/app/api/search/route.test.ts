import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";

// Mock the globals
global.fetch = vi.fn();

describe("GET /api/search", () => {
  it("should return 500 if API key is missing", async () => {
    // Override the process.env just for this test
    const originalEnv = process.env.YOUTUBE_API_KEY;
    process.env.YOUTUBE_API_KEY = "";

    const req = new NextRequest("http://localhost:3000/api/search?q=test");
    const res = await GET(req);

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.code).toBe("MISSING_API_KEY");

    // Restore env
    process.env.YOUTUBE_API_KEY = originalEnv;
  });

  it("should return 200 and empty items if query is empty or too short", async () => {
    const originalEnv = process.env.YOUTUBE_API_KEY;
    process.env.YOUTUBE_API_KEY = "FAKE_API_KEY_LONG_ENOUGH";

    const req = new NextRequest("http://localhost:3000/api/search?q=a"); // 1 char
    const res = await GET(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items).toEqual([]);

    process.env.YOUTUBE_API_KEY = originalEnv;
  });

  it("should call YouTube API and return items", async () => {
    const originalEnv = process.env.YOUTUBE_API_KEY;
    process.env.YOUTUBE_API_KEY = "FAKE_API_KEY_LONG_ENOUGH";

    // Mock successful fetch
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [{ id: { videoId: "123" }, snippet: { title: "Test" } }],
      }),
    } as Response);

    const req = new NextRequest("http://localhost:3000/api/search?q=test_query");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items).toBeDefined();
    expect(data.items[0].id.videoId).toBe("123");

    process.env.YOUTUBE_API_KEY = originalEnv;
  });
});
