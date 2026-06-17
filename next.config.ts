import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  reactStrictMode: true,
  serverExternalPackages: ["youtubei.js", "jsdom", "bgutils-js"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "yt3.ggpht.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "yt3.googleusercontent.com",
        pathname: "/**",
      },
    ],
    /** Otomatik olarak webp ve avif formatına dönüştür */
    formats: ["image/avif", "image/webp"],
    /** Thumbnail için optimize boyutlar */
    imageSizes: [64, 128, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    /** Minimize re-request */
    minimumCacheTTL: 3600,
  },
};

export default nextConfig;
