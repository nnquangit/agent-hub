/** @type {import('next').NextConfig} */
const nextConfig = {
  // prod builds to "build" (npm pack keeps non-dot folders);
  // dev uses its own ".next" so it never clobbers the packaged production build
  distDir: process.env.NODE_ENV === "development" ? ".next" : "build",
};

export default nextConfig;
