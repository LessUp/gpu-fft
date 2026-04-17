import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { h } from 'vue';
import './styles/custom.css';

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // Add custom slots if needed
    });
  },
  enhanceApp({ app, router, siteData }) {
    // Custom app enhancements
  },
} satisfies Theme;
