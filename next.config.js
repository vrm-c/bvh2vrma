/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.vrm$/u,
      type: 'asset',
    })
    return config
  },
  compiler:{
    removeConsole: process.env.NODE_ENV === 'production'
  }
}

module.exports = nextConfig
