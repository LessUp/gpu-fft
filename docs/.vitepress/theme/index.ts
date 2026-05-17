import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import FFTPlayground from './components/FFTPlayground.vue';
import ArchitectureAtlas from './components/ArchitectureAtlas.vue';
import CapabilityMatrix from './components/CapabilityMatrix.vue';
import './styles/custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('FFTPlayground', FFTPlayground);
    app.component('ArchitectureAtlas', ArchitectureAtlas);
    app.component('CapabilityMatrix', CapabilityMatrix);
  },
} satisfies Theme;
