const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
})

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  
  // Performance optimizations
  reactStrictMode: true,              
  swcMinify: true,                    
  compress: true,                     
  optimizeFonts: true,            
  productionBrowserSourceMaps: false, 
  
  // Remove console logs trong production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // Giữ lại error và warn
    } : false,
  },
  
  devIndicators: {
    buildActivity: false,
  },
  
  // Turbopack config
  turbopack: {},
}

module.exports = withBundleAnalyzer(withPWA(nextConfig))
