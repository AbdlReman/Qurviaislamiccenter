import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/quran-courses/hifz-quran-online-for-kids-adults-quran-memorization-course",
        destination: "/quran-courses/hifz-quran-online-quran-memorization",
        permanent: false,
      },
      {
        source: "/arabic-language-course",
        destination: "/quran-courses/arabic-language-course",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
