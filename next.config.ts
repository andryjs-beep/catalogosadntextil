import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración de imágenes para Cloudinary
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },

  // Configuración experimental
  experimental: {
    // Habilitar Server Actions
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // Variables de entorno públicas
  env: {
    NEXT_PUBLIC_BASE_DOMAIN: process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost:3000',
  },
};

export default nextConfig;
