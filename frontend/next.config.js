/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'iuiuuxyobsnuykfgkunl.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // In case they have other supabase instances or general images
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      }
    ],
  },
  webpack: (config, context) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
}
module.exports = nextConfig
