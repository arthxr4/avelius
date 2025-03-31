/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      serverActions: true,
    },
    transpilePackages: ["@clerk/nextjs"],
  };
  
  module.exports = nextConfig;
  