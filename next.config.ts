import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { tsconfigPath: "tsconfig.build.json" },
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
