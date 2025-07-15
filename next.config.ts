import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Edge Runtime 호환성 개선
  serverExternalPackages: ['bcryptjs'],

  // 웹팩 설정 - 클라이언트 사이드 polyfill 제거
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
