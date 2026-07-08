/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    // Same-origin proxy to the backend: makes the httpOnly refresh cookie
    // first-party and removes all CORS concerns. API_PROXY_URL is server-only.
    // NEXT_PUBLIC_API_URL is now the RELATIVE path (/api/v1) and must NOT be
    // used here — the rewrite would loop onto itself.
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.API_PROXY_URL || "http://localhost:8000/api/v1"}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
