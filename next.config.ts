import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});
const nextConfig: NextConfig = {
  turbopack: {},
  reactStrictMode: true,
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

export default withPWA(nextConfig);
