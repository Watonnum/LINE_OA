import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['*.ngrok-free.dev', '*.ngrok.io', 'localhost:3000'],
};

export default nextConfig;
