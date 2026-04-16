import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'WebGPU FFT',
  titleTemplate: ':title | WebGPU FFT Library',
  description: 'High-performance GPU-accelerated Fast Fourier Transform library for JavaScript/TypeScript',
  
  head: [
    ['meta', { name: 'theme-color', content: '#4f46e5' }],
    ['meta', { name: 'keywords', content: 'WebGPU, FFT, GPU, signal processing, image processing, JavaScript, TypeScript' }],
    ['meta', { name: 'author', content: 'WebGPU FFT Library Contributors' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: 'WebGPU FFT Library' }],
    ['meta', { property: 'og:description', content: 'High-performance GPU-accelerated FFT library' }],
    ['meta', { property: 'og:site_name', content: 'WebGPU FFT Library' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['link', { rel: 'icon', href: '/favicon.ico' }],
  ],

  cleanUrls: true,
  lastUpdated: true,
  
  sitemap: {
    hostname: 'https://lessup.github.io/gpu-fft/'
  },
  
  ignoreDeadLinks: true,

  themeConfig: {
    logo: { src: '/logo.svg', width: 24, height: 24 },
    siteTitle: 'WebGPU FFT',
    
    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'API', link: '/api/' },
      { text: 'Examples', link: '/examples/' },
      {
        text: 'v1.1.0',
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'Contributing', link: '/contributing' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          collapsed: false,
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Quick Start', link: '/guide/quick-start' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Browser Support', link: '/guide/browser-support' }
          ]
        },
        {
          text: 'Core Concepts',
          collapsed: false,
          items: [
            { text: 'FFT Basics', link: '/guide/fft-basics' },
            { text: 'Data Formats', link: '/guide/data-formats' },
            { text: 'GPU vs CPU', link: '/guide/gpu-vs-cpu' },
            { text: 'Error Handling', link: '/guide/error-handling' }
          ]
        },
        {
          text: 'Advanced',
          collapsed: true,
          items: [
            { text: 'Performance Tuning', link: '/guide/performance' },
            { text: 'Algorithm Details', link: '/guide/algorithm' },
            { text: 'WebGPU Internals', link: '/guide/webgpu-internals' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'FFTEngine', link: '/api/fft-engine' },
            { text: 'CPU FFT', link: '/api/cpu-fft' },
            { text: 'Spectrum Analyzer', link: '/api/spectrum-analyzer' },
            { text: 'Image Filter', link: '/api/image-filter' },
            { text: 'Window Functions', link: '/api/window-functions' },
            { text: 'Complex Utils', link: '/api/complex-utils' },
            { text: 'GPU Detection', link: '/api/gpu-detection' },
            { text: 'Error Handling', link: '/api/errors' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Basic FFT', link: '/examples/basic-fft' },
            { text: '2D FFT', link: '/examples/2d-fft' },
            { text: 'Spectrum Analyzer', link: '/examples/spectrum' },
            { text: 'Image Filtering', link: '/examples/image-filter' },
            { text: 'Feature Detection', link: '/examples/feature-detection' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/LessUp/gpu-fft' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/webgpu-fft' }
    ],

    search: {
      provider: 'local',
      options: {
        detailedView: true
      }
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-2026 WebGPU FFT Contributors'
    },

    outline: 'deep',
    
    editLink: {
      pattern: 'https://github.com/LessUp/gpu-fft/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    sidebarMenuLabel: 'Menu',
    returnToTopLabel: 'Return to top',
    darkModeSwitchLabel: 'Appearance',
    externalLinkIcon: true,
  },

  markdown: {
    lineNumbers: true
  },

  vite: {
    resolve: {
      alias: {
        '@': '/.vitepress'
      }
    },
    build: {
      chunkSizeWarningLimit: 1000
    }
  }
})
