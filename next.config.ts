import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["lucide-react"],
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
  ...(isGithubPages ? {
    output: "export",
    basePath: "/ViTudy",
    images: {
      unoptimized: true,
    },
  } : {}),
};

export default nextConfig;
