const isGitHubPages = process.env.GITHUB_PAGES === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: isGitHubPages,
  },
  ...(isGitHubPages
    ? {
        output: "export",
        basePath: "/props",
        assetPrefix: "/props/",
        images: {
          unoptimized: true,
        },
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
