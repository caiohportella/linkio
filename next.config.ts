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
               "script-src 'self' 'unsafe-eval' 'unsafe-inline' https: blob: data: *.clerk.accounts.dev *.clerk.services challenges.cloudflare.com clerk.linkio.app.br",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              // Added Google's domains to connect-src
               "connect-src 'self' *.clerk.accounts.dev *.clerk.services *.convex.cloud https://api.github.com https://github.com accounts.google.com *.googleapis.com clerk.linkio.app.br",
              // Added Google's domain to frame-src
              "frame-src 'self' *.clerk.accounts.dev *.clerk.services challenges.cloudflare.com accounts.google.com",
              // Added Google's domain to form-action
              "form-action 'self' https://github.com accounts.google.com",
              "object-src 'none'",
              "base-uri 'self'",
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
