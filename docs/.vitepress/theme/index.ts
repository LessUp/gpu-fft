import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { h } from 'vue';
import HomeHero from './components/HomeHero.vue';
import FFTPlayground from './components/FFTPlayground.vue';
import './styles/custom.css';

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      'home-hero-before': () => h(HomeHero),
    });
  },
  enhanceApp({ app }) {
    app.component('FFTPlayground', FFTPlayground);

    // 浏览器语言自动检测（仅首次访问）
    if (typeof window !== 'undefined') {
      // 检查是否已有语言偏好存储
      const stored = localStorage.getItem('vitepress-locale');
      if (!stored) {
        const browserLang = navigator.language.toLowerCase();
        // 中文用户（zh, zh-cn, zh-tw, zh-hk）重定向到 /zh/
        if (browserLang.startsWith('zh')) {
          const currentPath = window.location.pathname;
          // 避免已经在中文页面时重定向，并处理 base path
          if (!currentPath.includes('/zh/')) {
            // 保存语言偏好标记，避免后续重复重定向
            localStorage.setItem('vitepress-locale', 'zh');
            // 构建中文路径
            const basePath = currentPath.replace(/\/$/, '').replace(/^\//, '');
            window.location.pathname = '/zh/' + basePath;
          }
        }
      }
    }
  },
} satisfies Theme;
