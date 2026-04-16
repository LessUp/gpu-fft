# 🎉 WebGPU FFT Library v1.1.0

## What's New | 新特性

### 📚 Documentation Overhaul | 文档重构

**Complete bilingual documentation** with professional formatting:

- **English Documentation** (9 comprehensive guides)
- **简体中文文档** (9 篇完整指南)
- Language selection portal at [Documentation Site](https://lessup.github.io/gpu-fft/)
- Modern dark theme with code syntax highlighting
- Responsive design for mobile devices

**Documentation Includes | 文档包含:**
- 📖 API Reference (双语 API 参考)
- 🚀 Quick Start Guide (快速入门指南)
- 💡 Examples & Tutorials (示例教程)
- 🌐 Browser Compatibility (浏览器兼容性)
- 🔧 Troubleshooting (故障排除)

### 📋 CHANGELOG Restructure | 变更日志重构

- Professional changelog structure (专业化变更日志结构)
- Individual version changelogs in `/changelog/` directory
- Follows [Keep a Changelog](https://keepachangelog.com/) format
- Bilingual release notes

## Installation | 安装

```bash
npm install webgpu-fft@1.1.0
```

```bash
npm install webgpu-fft@1.1.0
```

## Quick Start | 快速开始

```typescript
import { createFFTEngine, isWebGPUAvailable } from 'webgpu-fft';

if (await isWebGPUAvailable()) {
  const engine = await createFFTEngine();
  const spectrum = await engine.fft(inputData);
  engine.dispose();
}
```

```typescript
import { createFFTEngine, isWebGPUAvailable } from 'webgpu-fft';

if (await isWebGPUAvailable()) {
  const engine = await createFFTEngine();
  const spectrum = await engine.fft(inputData);
  engine.dispose();
}
```

## Assets | 资源

- Source code (zip)
- Source code (tar.gz)

## Documentation | 文档

📚 **Full Documentation | 完整文档:** https://lessup.github.io/gpu-fft/

📦 **npm Package:** https://www.npmjs.com/package/webgpu-fft

💻 **GitHub Repository:** https://github.com/LessUp/gpu-fft

---

## Changelog | 变更日志

See [CHANGELOG.md](./CHANGELOG.md) for full details | 详情请查看 [CHANGELOG.md](./CHANGELOG.md)

## Contributors | 贡献者

Thanks to all contributors who helped improve this library! | 感谢所有帮助改进这个库的贡献者！

---

**Full Changelog:** https://github.com/LessUp/gpu-fft/compare/v1.0.1...v1.1.0
