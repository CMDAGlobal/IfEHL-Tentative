/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    }
  },
  // Ensure we're using stable Node.js runtime
  transpilePackages: ["@neondatabase/serverless"],
  // Add environment variables that should be accessible
  env: {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL
  }
}

export default nextConfig
