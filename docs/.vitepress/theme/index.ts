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
  },
} satisfies Theme;
