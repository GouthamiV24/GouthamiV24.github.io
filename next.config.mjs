/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
