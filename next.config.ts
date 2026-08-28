import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root. Without this, Turbopack walks up the tree, finds an
  // unrelated package-lock.json outside the repo and infers the wrong root.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
};

export default nextConfig;
