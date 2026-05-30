/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['3e80-211-107-49-37.ngrok-free.app'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
