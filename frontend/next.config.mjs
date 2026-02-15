/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.kabum.com.br' },
      { protocol: 'https', hostname: '**.mercadolivre.com.br' },
      { protocol: 'https', hostname: '**.magazineluiza.com.br' },
      { protocol: 'https', hostname: '**.amazon.com.br' },
      { protocol: 'https', hostname: '**.casasbahia.com.br' },
      { protocol: 'https', hostname: '**.fastshop.com.br' },
      { protocol: 'https', hostname: '**.samsung.com.br' },
      { protocol: 'https', hostname: '**.apple.com' },
      { protocol: 'https', hostname: '**.lenovo.com' },
      { protocol: 'https', hostname: '**.dell.com' },
      { protocol: 'https', hostname: '**.terabyteshop.com.br' },
      { protocol: 'https', hostname: '**.pichau.com.br' },
    ],
  },
};

export default nextConfig;
