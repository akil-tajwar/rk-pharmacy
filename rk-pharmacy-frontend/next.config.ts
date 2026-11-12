// import type { NextConfig } from 'next'

// const nextConfig: NextConfig = {
  
//   reactStrictMode: true,
//   images: {
//     domains: [
//       'localhost',
//       'benignfashion.com',
//     ],
//   },
// }

// export default nextConfig

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**', // all files in uploads folder
      },
      {
        protocol: 'https',
        hostname: 'benignfashion.com',
        pathname: '/uploads/**', // allow all paths on production domain
      },
    ],
  },
}

export default nextConfig

