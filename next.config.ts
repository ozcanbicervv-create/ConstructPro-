import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations for Coolify deployment
  output: 'standalone',
  
  // TypeScript configuration - allow builds to continue with errors for rapid development
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ESLint configuration - ignore during builds for faster deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // External packages configuration
  serverExternalPackages: ['prisma', '@prisma/client'],
  
  // Image optimization for production
  images: {
    domains: ['localhost', 'constructpro.vovelet-tech.com'],
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Experimental features for React 19 compatibility and performance
  experimental: {
    reactCompiler: false,
    ppr: false,
    optimizeCss: true,
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      'framer-motion',
      'recharts',
      '@tanstack/react-query',
      '@tanstack/react-table',
    ],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Static file serving optimization
  trailingSlash: false,
  
  // Compression
  compress: true,
  
  // Power optimizations
  poweredByHeader: false,
  
  // Webpack optimization configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Production optimizations
    if (!dev) {
      // Bundle splitting optimization
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Vendor chunk for stable dependencies
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              reuseExistingChunk: true,
            },
            // UI components chunk
            ui: {
              test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
              name: 'ui-components',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Design system chunk
            designSystem: {
              test: /[\\/]src[\\/]components[\\/]design-system[\\/]/,
              name: 'design-system',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Common utilities chunk
            utils: {
              test: /[\\/]src[\\/](lib|utils|hooks)[\\/]/,
              name: 'utils',
              priority: 15,
              reuseExistingChunk: true,
            },
            // Large libraries
            charts: {
              test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
              name: 'charts',
              priority: 30,
              reuseExistingChunk: true,
            },
            motion: {
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              name: 'motion',
              priority: 30,
              reuseExistingChunk: true,
            },
            radix: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: 'radix-ui',
              priority: 25,
              reuseExistingChunk: true,
            },
          },
        },
        // Module concatenation for better tree shaking
        concatenateModules: true,
        // Minimize bundle size
        minimize: true,
        // Remove empty chunks
        removeEmptyChunks: true,
        // Merge duplicate chunks
        mergeDuplicateChunks: true,
      };

      // Tree shaking optimization
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;

      // Module resolution optimization
      config.resolve.alias = {
        ...config.resolve.alias,
        // Optimize lodash imports
        'lodash': 'lodash-es',
        // Optimize date-fns imports
        'date-fns': 'date-fns/esm',
      };
    }

    // SVG optimization
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgo: true,
            svgoConfig: {
              plugins: [
                {
                  name: 'preset-default',
                  params: {
                    overrides: {
                      removeViewBox: false,
                    },
                  },
                },
                'removeDimensions',
              ],
            },
          },
        },
      ],
    });

    // Bundle analyzer in development
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: isServer ? 8888 : 8889,
          openAnalyzer: true,
        })
      );
    }

    return config;
  },
  
  // Environment variables for production
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Enhanced security headers for production
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    
    return [
      {
        source: '/(.*)',
        headers: [
          // Basic security headers
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off',
          },
          {
            key: 'X-Download-Options',
            value: 'noopen',
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },
          // HSTS (only in production)
          ...(isDev ? [] : [{
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          }]),
          // Content Security Policy
          {
            key: isDev ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://cdn.socket.io" + (isDev ? " http://localhost:* ws://localhost:*" : ""),
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: https://images.unsplash.com https://avatars.githubusercontent.com",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://api.constructpro.com wss://constructpro.com https://vercel.live" + (isDev ? " http://localhost:* ws://localhost:* wss://localhost:*" : ""),
              "media-src 'self' data: blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; '),
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: [
              "camera=()",
              "microphone=()",
              "geolocation=(self)",
              "payment=()",
              "usb=()",
              "display-capture=()",
              "fullscreen=(self)",
              "web-share=(self)"
            ].join(', '),
          },
          // Cross-Origin policies
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-site',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          // API-specific security headers
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // CORS headers
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          // Static assets caching
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/uploads/(.*)',
        headers: [
          // File upload security
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Content-Disposition',
            value: 'attachment',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
  
  // Redirects for production
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
