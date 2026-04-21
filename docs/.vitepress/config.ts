import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'WebGPU FFT',
  titleTemplate: ':title | WebGPU FFT Library',
  description:
    'High-performance GPU-accelerated Fast Fourier Transform library for JavaScript/TypeScript',

  head: [
    ['meta', { name: 'theme-color', content: '#4f46e5' }],
    [
      'meta',
      {
        name: 'keywords',
        content:
          'WebGPU, FFT, GPU, signal processing, image processing, JavaScript, TypeScript, Fourier transform, spectrum analyzer, audio analysis',
      },
    ],
    ['meta', { name: 'author', content: 'WebGPU FFT Library Contributors' }],
    ['meta', { name: 'googlebot', content: 'index, follow' }],
    ['meta', { name: 'robots', content: 'index, follow' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: 'WebGPU FFT Library' }],
    [
      'meta',
      {
        property: 'og:description',
        content:
          'High-performance GPU-accelerated FFT library with WebGPU compute shaders. Supports 1D/2D FFT, frequency domain filtering, and real-time spectrum analysis.',
      },
    ],
    ['meta', { property: 'og:site_name', content: 'WebGPU FFT Library' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:site', content: '@webgpu_fft' }],
    ['meta', { name: 'twitter:title', content: 'WebGPU FFT Library' }],
    [
      'meta',
      {
        name: 'twitter:description',
        content: 'High-performance GPU-accelerated FFT library with WebGPU compute shaders',
      },
    ],
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    ['link', { rel: 'canonical', href: 'https://lessup.github.io/gpu-fft/' }],
    ['meta', { property: 'og:image', content: 'https://lessup.github.io/gpu-fft/og-image.png' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:image:alt', content: 'WebGPU FFT Library - GPU-Accelerated FFT' }],
    ['meta', { property: 'og:url', content: 'https://lessup.github.io/gpu-fft/' }],
    ['meta', { property: 'og:locale:alternate', content: 'zh_CN' }],
    ['meta', { name: 'twitter:image', content: 'https://lessup.github.io/gpu-fft/og-image.png' }],
    [
      'script',
      { type: 'application/ld+json' },
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareSourceCode',
        name: 'WebGPU FFT Library',
        description:
          'High-performance GPU-accelerated Fast Fourier Transform library for JavaScript/TypeScript',
        codeRepository: 'https://github.com/LessUp/gpu-fft',
        programmingLanguage: 'TypeScript',
        license: 'https://opensource.org/licenses/MIT',
        author: {
          '@type': 'Organization',
          name: 'WebGPU FFT Library Contributors',
        },
        keywords: 'WebGPU, FFT, GPU, signal processing, TypeScript',
        version: '1.1.0',
      }),
    ],
  ],

  locales: {
    root: {
      label: 'English',
      lang: 'en',
    },
    zh: {
      label: '简体中文',
      lang: 'zh',
      link: '/zh/',
      themeConfig: {
        nav: [
          { text: '设置', link: '/setup/quick-start' },
          { text: '教程', link: '/tutorials/introduction' },
          { text: '架构', link: '/architecture/overview' },
          { text: 'API', link: '/api/index' },
          {
            text: 'v1.1.0',
            items: [
              { text: '变更日志', link: '/changelog' },
              { text: '贡献指南', link: '/contributing' },
            ],
          },
        ],
      },
    },
  },

  cleanUrls: true,
  lastUpdated: true,

  sitemap: {
    hostname: 'https://lessup.github.io/gpu-fft/',
    transformItems(items) {
      return items.map((item) => {
        item.lastmod = new Date().toISOString();
        return item;
      });
    },
  },

  ignoreDeadLinks: true,

  srcExclude: ['**/specs/**/*.md'],

  metaChunk: true,

  themeConfig: {
    logo: { src: '/logo.svg', width: 24, height: 24 },
    siteTitle: 'WebGPU FFT',

    nav: [
      { text: 'Setup', link: '/setup/quick-start' },
      { text: 'Tutorials', link: '/tutorials/introduction' },
      { text: 'Architecture', link: '/architecture/overview' },
      { text: 'API', link: '/api/index' },
      {
        text: 'More',
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'Contributing', link: '/contributing' },
          { text: 'Quality Assessment', link: '/quality/assessment' },
        ],
      },
    ],

    sidebar: {
      '/setup/': [
        {
          text: 'Getting Started',
          collapsed: false,
          items: [
            { text: 'Quick Start', link: '/setup/quick-start' },
            { text: 'Browser Support', link: '/setup/browser-support' },
          ],
        },
      ],
      '/tutorials/': [
        {
          text: 'Tutorials',
          collapsed: false,
          items: [
            { text: 'Introduction', link: '/tutorials/introduction' },
            { text: '1D FFT', link: '/tutorials/1d-fft' },
            { text: '2D FFT', link: '/tutorials/2d-fft' },
            { text: 'Spectrum Analysis', link: '/tutorials/spectrum-analysis' },
            { text: 'Image Filtering', link: '/tutorials/image-filtering' },
          ],
        },
      ],
      '/architecture/': [
        {
          text: 'Architecture',
          items: [
            { text: 'Overview', link: '/architecture/overview' },
            { text: 'GPU Engine', link: '/architecture/gpu-engine' },
            { text: 'CPU Fallback', link: '/architecture/cpu-fallback' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/index' },
            { text: 'FFTEngine', link: '/api/fft-engine' },
            { text: 'CPU FFT', link: '/api/cpu-fft' },
            { text: 'Spectrum Analyzer', link: '/api/spectrum-analyzer' },
            { text: 'Image Filter', link: '/api/image-filter' },
            { text: 'Window Functions', link: '/api/window-functions' },
            { text: 'Complex Numbers', link: '/api/complex' },
            { text: 'GPU Detection', link: '/api/gpu-detect' },
            { text: 'Bit Reversal', link: '/api/bit-reversal' },
          ],
        },
      ],
      '/quality/': [
        {
          text: 'Quality',
          items: [{ text: 'Assessment', link: '/quality/assessment' }],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/LessUp/gpu-fft' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/webgpu-fft' },
    ],

    search: {
      provider: 'local',
      options: {
        detailedView: true,
      },
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-2026 WebGPU FFT Contributors',
    },

    outline: 'deep',

    editLink: {
      pattern: 'https://github.com/LessUp/gpu-fft/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    sidebarMenuLabel: 'Menu',
    returnToTopLabel: 'Return to top',
    darkModeSwitchLabel: 'Appearance',
    externalLinkIcon: true,
  },

  markdown: {
    lineNumbers: true,
  },

  vite: {
    resolve: {
      alias: {
        '@': '/.vitepress',
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
    },
  },
});
