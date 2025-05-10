import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    PRISMA_GENERATE_DATAPROXY: "false",
  },
  output: "standalone",
  outputFileTracing: true,
};

export default nextConfig;
