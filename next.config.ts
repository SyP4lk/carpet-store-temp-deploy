import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.ticimax.cloud",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "koenigcarpet.ru",
      },
    ],
    // Увеличиваем таймаут и TTL для кеширования
    minimumCacheTTL: 60,
    // Отключаем оптимизацию для внешних изображений на production
    // Это предотвратит ошибки "Cannot read properties of undefined (reading 'meta')"
    unoptimized: process.env.NODE_ENV === 'production' ? false : false,
    // Увеличиваем лимит размера изображений
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Формат изображений
    formats: ['image/webp'],
  },
  // Логирование для отладки
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
