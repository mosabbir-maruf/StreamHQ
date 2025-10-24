import withPWAInit from "@ducanh2912/next-pwa";
import { NextConfig } from "next/dist/server/config";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  // Disable service worker in development to prevent module loading issues
  disable: process.env.NODE_ENV === "development",
  reloadOnOnline: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true,
    clientsClaim: true,
    // Ensure proper MIME type handling
    navigateFallback: null,
    navigateFallbackDenylist: [
      /^\/_next\/static\/.*\.css$/,
      /^\/_next\/static\/chunks\/node_modules.*@heroui.*dom-animation.*\.js$/
    ],
    // Fix async generator issues by using proper transpilation
    mode: 'production',
    sourcemap: false,
    // Add error handling for failed module loads
    cleanupOutdatedCaches: true,
    // Fix async/await transpilation issues
    swDest: 'sw.js',
    // Ensure proper module resolution
    importScripts: [],
    // Use simpler caching strategies to avoid async generator issues
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-webfonts',
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 365 days
          },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'google-fonts-stylesheets',
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
        },
      },
      {
        urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-font-assets',
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
        },
      },
      {
        urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-image-assets',
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      {
        urlPattern: /\/_next\/static.+\.js$/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'next-static-js-assets',
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
        },
      },
      {
        urlPattern: /\/_next\/static.+\.css$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'next-static-css-assets',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
        },
      },
      {
        urlPattern: /\/_next\/image\?url=.+$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'next-image',
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
        },
      },
      {
        urlPattern: /\.(?:mp3|wav|ogg)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-audio-assets',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
        },
      },
      {
        urlPattern: /\.(?:mp4|webm)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-video-assets',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
        },
      },
      {
        urlPattern: /\.(?:js)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-js-assets',
          expiration: {
            maxEntries: 48,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
        },
      },
      {
        urlPattern: /\.(?:css|less)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-style-assets',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
        },
      },
      {
        urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'next-data',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
        },
      },
      {
        urlPattern: ({ request, url, sameOrigin }) => {
          return sameOrigin && url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/auth/callback');
        },
        handler: 'NetworkFirst',
        options: {
          cacheName: 'apis',
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 16,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
        },
      },
      {
        urlPattern: ({ request, url, sameOrigin }) => {
          return request.headers.get('RSC') === '1' && 
                 request.headers.get('Next-Router-Prefetch') === '1' && 
                 sameOrigin && 
                 !url.pathname.startsWith('/api/');
        },
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages-rsc-prefetch',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
        },
      },
      {
        urlPattern: ({ request, url, sameOrigin }) => {
          return request.headers.get('RSC') === '1' && 
                 sameOrigin && 
                 !url.pathname.startsWith('/api/');
        },
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages-rsc',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
        },
      },
      {
        urlPattern: ({ url, sameOrigin }) => {
          return sameOrigin && !url.pathname.startsWith('/api/');
        },
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
        },
      },
      {
        urlPattern: ({ sameOrigin }) => !sameOrigin,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'cross-origin',
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 60 * 60, // 1 hour
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore ESLint errors during build
  },
  // https://github.com/payloadcms/payload/issues/12550#issuecomment-2939070941
  turbopack: {
    resolveExtensions: [".mdx", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  experimental: {
    optimizePackageImports: [
      "@heroui/react", 
      "lucide-react", 
      "react-icons",
      "framer-motion",
      "react-share",
      "react-hook-form",
      "@mantine/hooks",
      "react-intersection-observer",
      "@tanstack/react-query",
      "@bprogress/next"
    ],
    // Optimize for better performance
    scrollRestoration: true,
    // Enable modern bundling
    esmExternals: true,
    // Optimize font loading
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**',
      },
      {
        protocol: 'https',
        hostname: 's4.anilist.co',
        port: '',
        pathname: '/file/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://*.cloudflare.com https://challenges.cloudflare.com/turnstile/; frame-src 'self' https://challenges.cloudflare.com https://*.cloudflare.com https://challenges.cloudflare.com/turnstile/; connect-src 'self' https://challenges.cloudflare.com https://*.cloudflare.com https://challenges.cloudflare.com/turnstile/; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https:; worker-src 'self' blob:; child-src 'self' blob:;",
  },
  // Add headers for proper MIME type handling
  async headers() {
    return [
      {
        source: '/_next/static/css/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/css; charset=utf-8',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/_next/static/js/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
  compress: true,
  poweredByHeader: false,
  // Enable static optimization for better performance
  output: 'standalone',
  compiler: {
    // Remove console logs in production while keeping error logs for debugging
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ['error']
    } : false,
  },
  // Enable static optimization
  trailingSlash: false,
  // Optimize server components
  serverExternalPackages: ['@supabase/supabase-js'],
  // Optimize bundle splitting
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
            priority: 5,
          },
          // Separate chunk for heavy libraries
          framerMotion: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'framer-motion',
            chunks: 'all',
            priority: 20,
          },
          // Separate chunk for UI libraries
          heroui: {
            test: /[\\/]node_modules[\\/]@heroui[\\/]/,
            name: 'heroui',
            chunks: 'all',
            priority: 15,
          },
        },
      };
    }
    
    // Optimize font loading to reduce preload warnings
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      use: {
        loader: 'file-loader',
        options: {
          name: '[name].[hash].[ext]',
          outputPath: 'static/fonts/',
          publicPath: '/_next/static/fonts/',
        },
      },
    });
    
    // Optimize font preloading by reducing unused font weights
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups.fonts = {
        test: /[\\/]node_modules[\\/]@next[\\/]font[\\/]/,
        name: 'fonts',
        chunks: 'all',
        priority: 30,
        enforce: true,
      };
    }
    
    // Disable automatic font preloading to prevent unused font warnings
    // Remove invalid optimizeCss from experiments
    
    return config;
  },
};

const pwa = withPWA(nextConfig);

export default pwa;
