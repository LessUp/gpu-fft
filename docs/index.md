---
layout: home
hero:
  name: WebGPU FFT
  text: ' '
  actions:
    - theme: brand
      text: English
      link: /en/
    - theme: alt
      text: 简体中文
      link: /zh/
---

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vitepress';

onMounted(() => {
  const router = useRouter();
  const lang = navigator.language || navigator.userLanguage || 'en';
  router.go(lang.toLowerCase().startsWith('zh') ? '/zh/' : '/en/');
});
</script>
