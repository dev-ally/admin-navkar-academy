/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // domains: ["navkar-academy.vercel.app"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "navkar-academy.vercel.app",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
};

export default nextConfig;
