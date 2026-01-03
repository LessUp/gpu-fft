# Implementation Plan: WebGPU FFT Library

## Overview

本实现计划将 WebGPU FFT 库的设计分解为可执行的编码任务。采用自底向上的方式，先实现核心数学运算，再构建 FFT 引擎，最后添加应用层功能。每个任务都包含属性测试以确保正确性。

## Tasks

- [x] 1. 项目初始化和基础设施
  - [x] 1.1 创建项目结构和配置文件
    - 初始化 TypeScript 项目，配置 tsconfig.json
    - 配置 Vite 作为构建工具
    - 安装依赖：@webgpu/types, fast-check, vitest
    - 创建目录结构：src/core, src/shaders, src/utils, src/apps, tests/
    - _Requirements: 10.5_

  - [x] 1.2 实现 WebGPU 资源管理器
    - 创建 GPUResourceManager 类
    - 实现 adapter/device 初始化
    - 实现 buffer 创建、上传、下载方法
    - 实现 dispose 方法释放资源
    - _Requirements: 9.1, 9.2, 9.3, 9.5_

- [x] 2. 复数运算模块
  - [x] 2.1 实现 WGSL 复数运算函数
    - 创建 complex.wgsl 着色器模块
    - 实现 complex_add, complex_mul, complex_magnitude
    - 实现 twiddle_factor 函数
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 2.2 创建 TypeScript 复数工具函数（用于测试验证）
    - 实现 CPU 版本的复数运算
    - 用于与 GPU 结果对比验证
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

  - [x] 2.3 编写复数运算属性测试
    - **Property 5: Complex Addition**
    - **Property 6: Complex Multiplication**
    - **Property 7: Complex Magnitude**
    - **Property 8: Twiddle Factor Correctness**
    - **Validates: Requirements 1.2, 1.3, 1.4, 1.5**

- [x] 3. 位反转模块
  - [x] 3.1 实现位反转算法
    - 创建 bit-reversal.wgsl 着色器
    - 实现 bit_reverse 函数
    - 实现并行位反转置换 kernel
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.2 创建 TypeScript 位反转工具函数
    - 实现 CPU 版本用于测试验证
    - _Requirements: 2.1_

  - [x] 3.3 编写位反转属性测试
    - **Property 3: Bit-Reversal Round-Trip**
    - **Property 4: Bit-Reversal Permutation Correctness**
    - **Validates: Requirements 2.1, 2.2**

- [x] 4. Checkpoint - 基础模块验证
  - 确保所有测试通过，如有问题请询问用户

- [x] 5. 1D FFT 核心引擎
  - [x] 5.1 实现蝴蝶操作着色器
    - 创建 butterfly.wgsl
    - 实现单阶段蝴蝶操作 kernel
    - 实现 Bank Conflict Padding 索引计算
    - _Requirements: 3.2, 3.3, 3.4, 5.1, 5.2, 5.3_

  - [x] 5.2 实现 FFT 引擎类
    - 创建 FFTEngine 类
    - 实现 pipeline 创建和缓存
    - 实现多阶段 FFT 调度逻辑
    - 实现 fft() 方法
    - _Requirements: 3.1, 3.6, 5.4_

  - [x] 5.3 实现输入验证和错误处理
    - 验证输入大小为 2 的幂
    - 实现 FFTError 类和错误码
    - _Requirements: 10.6_

  - [x] 5.4 编写 FFT 正确性属性测试
    - **Property 2: FFT Matches DFT Definition**
    - **Property 16: Output Format Interleaved**
    - **Property 17: Invalid Size Rejection**
    - **Validates: Requirements 3.5, 10.3, 10.6**

- [x] 6. 逆 FFT 实现
  - [x] 6.1 实现 IFFT 着色器和方法
    - 修改 twiddle factor 为共轭形式
    - 实现归一化除法
    - 实现 ifft() 方法
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 6.2 编写 FFT/IFFT Round-Trip 属性测试
    - **Property 1: FFT/IFFT Round-Trip**
    - **Validates: Requirements 3.1, 4.1, 4.4**

- [x] 7. Checkpoint - 1D FFT 验证
  - 确保所有测试通过，如有问题请询问用户

- [x] 8. 2D FFT 实现
  - [x] 8.1 实现 2D FFT 模块
    - 实现行方向 FFT 批处理
    - 实现列方向 FFT 批处理
    - 实现 fft2d() 和 ifft2d() 方法
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 8.2 编写 2D FFT 属性测试
    - **Property 9: 2D FFT/IFFT Round-Trip**
    - **Validates: Requirements 6.1**

- [x] 9. 频域滤波模块
  - [x] 9.1 实现滤波器着色器
    - 创建 filter.wgsl
    - 实现 ideal 低通/高通滤波器
    - 实现 Gaussian 低通/高通滤波器
    - _Requirements: 7.1, 7.2, 7.5_

  - [x] 9.2 实现 ImageFilter 类
    - 实现 apply() 方法（FFT → 滤波 → IFFT）
    - 支持可配置的截止频率
    - _Requirements: 7.3, 7.4_

  - [x] 9.3 编写滤波器属性测试
    - **Property 10: Low-Pass Filter Attenuates High Frequencies**
    - **Property 11: High-Pass Filter Attenuates Low Frequencies**
    - **Validates: Requirements 7.1, 7.2**

- [x] 10. 音频频谱分析器
  - [x] 10.1 实现窗函数
    - 实现 Hann 窗函数
    - _Requirements: 8.3_

  - [x] 10.2 实现 SpectrumAnalyzer 类
    - 实现 analyze() 方法
    - 实现幅度提取和 dB 转换
    - 支持常用 FFT 大小
    - _Requirements: 8.1, 8.2, 8.4, 8.5_

  - [x] 10.3 编写频谱分析器属性测试
    - **Property 12: Spectrum Magnitude is Non-Negative**
    - **Property 13: Hann Window Application**
    - **Property 14: dB Conversion**
    - **Property 15: Frequency Bin Count**
    - **Validates: Requirements 8.1, 8.3, 8.4, 8.5**

- [x] 11. 公共 API 封装
  - [x] 11.1 创建统一的公共 API
    - 实现 createFFTEngine() 工厂函数
    - 实现 createSpectrumAnalyzer() 工厂函数
    - 实现 createImageFilter() 工厂函数
    - 导出所有公共类型定义
    - _Requirements: 10.1, 10.2, 10.4, 10.5_

- [x] 12. Demo 应用
  - [x] 12.1 创建音频频谱可视化 Demo
    - 实现 Web Audio API 集成
    - 实现实时频谱显示（Canvas 或 WebGL）
    - _Requirements: 8.1, 8.2_

  - [x] 12.2 创建图像滤波 Demo
    - 实现图像加载和显示
    - 实现低通/高通滤波效果展示
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 13. Final Checkpoint - 完整验证
  - 确保所有测试通过
  - 验证 Demo 应用正常工作
  - 如有问题请询问用户

## Notes

- 所有任务均为必需任务，包括属性测试
- 每个任务都引用了具体的需求以确保可追溯性
- Checkpoint 任务用于阶段性验证
- 属性测试使用 fast-check 库，每个属性至少运行 100 次迭代
- 单元测试和属性测试互补，共同确保正确性
