import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';
import llmstxt from 'vitepress-plugin-llms';

const rawBase = process.env.VITEPRESS_BASE;
const base = rawBase
  ? rawBase.startsWith('/')
    ? rawBase.endsWith('/')
      ? rawBase
      : `${rawBase}/`
    : `/${rawBase}/`
  : '/';

const siteUrl = 'https://lessup.github.io/gpu-fft/';

export default withMermaid(
  defineConfig({
    base,
    title: 'WebGPU FFT',
    titleTemplate: ':title | WebGPU FFT',
    description: 'Technical whitepaper and architecture guide for a browser-native WebGPU FFT core',

    head: [
      ['meta', { name: 'theme-color', content: '#5d8f00' }],
      [
        'meta',
        {
          name: 'keywords',
          content:
            'WebGPU, FFT, GPU compute, signal processing, TypeScript, WGSL, real-input FFT, architecture',
        },
      ],
      ['meta', { name: 'author', content: 'WebGPU FFT Contributors' }],
      ['meta', { name: 'robots', content: 'index, follow' }],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:site_name', content: 'WebGPU FFT' }],
      ['meta', { property: 'og:title', content: 'WebGPU FFT' }],
      [
        'meta',
        {
          property: 'og:description',
          content:
            'A technical whitepaper for a browser-native WebGPU FFT core with explicit CPU-only utility boundaries.',
        },
      ],
      ['meta', { property: 'og:image', content: `${siteUrl}hero.svg` }],
      ['meta', { property: 'og:url', content: siteUrl }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:title', content: 'WebGPU FFT' }],
      [
        'meta',
        {
          name: 'twitter:description',
          content:
            'Whitepaper-style documentation for a browser-native WebGPU FFT core with CPU-only analysis utilities.',
        },
      ],
      ['meta', { name: 'twitter:image', content: `${siteUrl}hero.svg` }],
      ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
      ['link', { rel: 'canonical', href: siteUrl }],
      [
        'script',
        { type: 'application/ld+json' },
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'WebGPU FFT',
          description:
            'Technical whitepaper and architecture guide for a browser-native WebGPU FFT core',
          codeRepository: 'https://github.com/LessUp/gpu-fft',
          programmingLanguage: 'TypeScript',
          runtimePlatform: 'WebGPU',
          license: 'https://opensource.org/licenses/MIT',
          keywords: [
            'WebGPU',
            'FFT',
            'WGSL',
            'signal processing',
            'browser-native GPU compute',
          ],
        }),
      ],
    ],

    cleanUrls: true,
    lastUpdated: true,
    srcExclude: ['**/specs/**/*.md', 'superpowers/**'],

    sitemap: {
      hostname: siteUrl,
    },

    locales: {
      zh: {
        label: '简体中文',
        lang: 'zh-CN',
        link: '/zh/',
        title: 'WebGPU FFT',
        description: '面向架构评估与项目导读的 WebGPU FFT 技术白皮书',
        themeConfig: {
          nav: [
            { text: '指南', link: '/zh/guides/getting-started', activeMatch: '/zh/guides/' },
            { text: '导读', link: '/zh/academy/reading-map', activeMatch: '/zh/academy/' },
            { text: '架构', link: '/zh/architecture/overview', activeMatch: '/zh/architecture/' },
            { text: '证据', link: '/zh/showcase/benchmarks', activeMatch: '/zh/showcase/' },
            { text: '参考', link: '/reference/index', activeMatch: '/reference/' },
            { text: '游乐场', link: '/playground/index', activeMatch: '/playground/' },
          ],
          sidebar: {
            '/zh/guides/': [
              {
                text: '指南',
                items: [
                  { text: '起步导读', link: '/zh/guides/getting-started' },
                  { text: '快速开始', link: '/zh/setup/quick-start' },
                  { text: 'Browser Support (EN)', link: '/setup/browser-support' },
                  { text: 'AI Tooling (EN)', link: '/setup/ai-tooling' },
                ],
              },
            ],
            '/zh/academy/': [
              {
                text: '导读',
                items: [
                  { text: '阅读地图', link: '/zh/academy/reading-map' },
                  { text: '教程入口 (EN)', link: '/tutorials/introduction' },
                  { text: 'API 参考 (EN)', link: '/api/index' },
                  { text: '参考中心 (EN)', link: '/reference/index' },
                ],
              },
            ],
            '/zh/architecture/': [
              {
                text: '架构',
                items: [{ text: '总览', link: '/zh/architecture/overview' }],
              },
            ],
            '/zh/showcase/': [
              {
                text: '证据',
                items: [
                  { text: '性能基准', link: '/zh/showcase/benchmarks' },
                  { text: '架构决策', link: '/zh/showcase/decisions' },
                ],
              },
            ],
          },
          editLink: {
            pattern: 'https://github.com/LessUp/gpu-fft/edit/master/docs/:path',
            text: '在 GitHub 上编辑此页',
          },
          docFooter: {
            prev: '上一页',
            next: '下一页',
          },
          outlineTitle: '本页目录',
          returnToTopLabel: '回到顶部',
          sidebarMenuLabel: '目录',
          darkModeSwitchLabel: '外观',
        },
      },
      en: {
        label: 'English',
        lang: 'en-US',
        link: '/en/',
        title: 'WebGPU FFT',
        description: 'Technical whitepaper and architecture guide for a browser-native WebGPU FFT core',
        themeConfig: {
          nav: [
            { text: 'Guides', link: '/en/guides/getting-started', activeMatch: '/en/guides/' },
            { text: 'Academy', link: '/en/academy/reading-map', activeMatch: '/en/academy/' },
            { text: 'Architecture', link: '/architecture/overview', activeMatch: '/architecture/' },
            { text: 'Evidence', link: '/showcase/benchmarks', activeMatch: '/showcase/' },
            { text: 'Reference', link: '/reference/index', activeMatch: '/reference/' },
            { text: 'Playground', link: '/playground/index', activeMatch: '/playground/' },
          ],
          sidebar: {
            '/en/guides/': [
              {
                text: 'Guides',
                items: [
                  { text: 'Guided Start', link: '/en/guides/getting-started' },
                  { text: 'Quick Start', link: '/setup/quick-start' },
                  { text: 'Browser Support', link: '/setup/browser-support' },
                  { text: 'AI Tooling & LSP', link: '/setup/ai-tooling' },
                ],
              },
            ],
            '/en/academy/': [
              {
                text: 'Academy',
                items: [
                  { text: 'Reading Map', link: '/en/academy/reading-map' },
                  { text: 'Tutorials', link: '/tutorials/introduction' },
                  { text: 'API Reference', link: '/api/index' },
                  { text: 'Reference Hub', link: '/reference/index' },
                ],
              },
            ],
            '/architecture/': [
              {
                text: 'Architecture',
                items: [{ text: 'Overview', link: '/architecture/overview' }],
              },
            ],
            '/showcase/': [
              {
                text: 'Evidence',
                items: [
                  { text: 'Benchmarks', link: '/showcase/benchmarks' },
                  { text: 'Architecture Decisions', link: '/showcase/decisions' },
                ],
              },
            ],
            '/reference/': [
              {
                text: 'Reference',
                items: [
                  { text: 'Reference Hub', link: '/reference/index' },
                  { text: 'Academic Papers', link: '/reference/papers' },
                  { text: 'Implementations', link: '/reference/implementations' },
                  { text: 'Learning Resources', link: '/reference/learning' },
                ],
              },
            ],
          },
          editLink: {
            pattern: 'https://github.com/LessUp/gpu-fft/edit/master/docs/:path',
            text: 'Edit this page on GitHub',
          },
        },
      },
    },

    themeConfig: {
      logo: { src: '/logo.svg', width: 28, height: 28 },
      siteTitle: 'WebGPU FFT',
      outline: [2, 3],
      search: {
        provider: 'local',
        options: {
          detailedView: true,
        },
      },
      socialLinks: [
        { icon: 'github', link: 'https://github.com/LessUp/gpu-fft' },
        { icon: 'npm', link: 'https://www.npmjs.com/package/webgpu-fft' },
      ],
      footer: {
        message: 'Released under the MIT License.',
        copyright: 'Copyright © 2024-2026 WebGPU FFT Contributors',
      },
      editLink: {
        pattern: 'https://github.com/LessUp/gpu-fft/edit/master/docs/:path',
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
      publicDir: '.vitepress/public',
      plugins: [llmstxt()],
      resolve: {
        alias: {
          '@': '/.vitepress',
        },
      },
      build: {
        chunkSizeWarningLimit: 3000,
      },
    },
  }),
);
