import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rare-barracuda-606.convex.cloud",
      },
      {
        protocol: "https",
        hostname: "image-cdn-ak.spotifycdn.com",
      },
      {
        protocol: "https",
        hostname: "image-cdn-fa.spotifycdn.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "cdn-images.dzcdn.net",
      },
      {
        protocol: "https",
        hostname: "is1-ssl.mzstatic.com",
      },
      {
        protocol: "https",
        hostname: "resources.tidal.com",
      },
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: data: https://clerk.linkio.app.br https://*.clerk.accounts.dev https://*.clerk.services https://challenges.cloudflare.com",
              "script-src-elem 'self' 'unsafe-inline' blob: data: https://clerk.linkio.app.br https://*.clerk.accounts.dev https://*.clerk.services https://challenges.cloudflare.com",
              "script-src-attr 'unsafe-inline'",
              "worker-src 'self' blob: data: https://*.clerk.accounts.dev https://*.clerk.services",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://clerk.linkio.app.br https://*.clerk.accounts.dev https://*.clerk.services https://*.convex.cloud wss://*.convex.cloud https://api.github.com",
              "frame-src 'self' https://clerk.linkio.app.br https://*.clerk.accounts.dev https://*.clerk.services https://challenges.cloudflare.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
