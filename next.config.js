/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output is only needed for Docker/Azure App Service.
  // Vercel manages its own output format, so we skip it there.
  ...(process.env.VERCEL ? {} : { output: "standalone" }),

  // Allow Azure AD profile images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.microsoft.com",
      },
      {
        protocol: "https",
        hostname: "*.windows.net",
      },
    ],
  },

  // Strict mode for better dev experience
  reactStrictMode: true,

  // Custom headers for security
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async redirects() {
    return [
      // Browsers always request /favicon.ico; redirect to the SVG variant
      // to avoid a 404 in the browser console.
      {
        source: "/favicon.ico",
        destination: "/favicon.svg",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
