/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // Rewriting to an external URL for API proxying
        source: "/api/:path*",
        destination: `http://localhost:5001/:path*`, // TODO: have dev and production urls
      },
    ];
  },
};

export default nextConfig;
