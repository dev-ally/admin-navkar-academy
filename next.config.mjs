/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // domains: ["navkar-academy.vercel.app"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "navkar-academy.vercel.app",
      },
    ],
  },
};

export default nextConfig;
