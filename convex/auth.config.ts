const authConfig = {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: data: https://*.clerk.accounts.dev https://*.clerk.services https://challenges.cloudflare.com",
              "script-src-elem 'self' 'unsafe-inline' blob: data: https://*.clerk.accounts.dev https://*.clerk.services https://challenges.cloudflare.com",
              "script-src-attr 'unsafe-inline'",
              "worker-src 'self' blob: data: https://*.clerk.accounts.dev https://*.clerk.services",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.services https://*.convex.cloud https://api.github.com",
              "frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.services https://challenges.cloudflare.com",
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

export default authConfig;
