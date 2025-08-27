import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Medicine backend
      {
        source: "/api/medicine/:path*",
        destination: "https://dsh-1.onrender.com/:path*",
      },
      // Symptoms backend (maps to /api/predict/:path* on Render)
      {
        source: "/api/symptoms/:path*",
        destination: "https://dsh-2.onrender.com/api/predict/:path*",
      },
      // Prescription backend
      {
        source: "/api/prescription/:path*",
        destination: "https://dsh-t97y.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;
