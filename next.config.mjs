/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'developer.tecmm.mx',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
