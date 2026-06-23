/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  basePath: '/PDD-Testing',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
