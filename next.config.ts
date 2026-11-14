import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: [
          {
            loader: "@tailwindcss/turbopack",
            options: {
              // Default base is the project root, so the CSS loader watches
              // .next (including the dev log rewritten on every request) and
              // Turbopack restarts the page in a loop.
              base: path.join(process.cwd(), "src"),
            },
          },
        ],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
