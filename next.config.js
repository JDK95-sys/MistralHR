/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output as standalone for Azure App Service Docker deployment
  output: "standalone",

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
    serverActions: true,
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
