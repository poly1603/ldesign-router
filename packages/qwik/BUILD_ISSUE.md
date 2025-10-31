# Qwik 包构建问题说明

## 问题描述

@ldesign/router-qwik 包在使用 `@ldesign/builder` 构建时遇到配置问题。

### 错误信息

```
BuilderError: Rollup 构建失败: You must specify "output.file" or "output.dir" for the build.
Code: MISSING_OPTION
```

## 已尝试的解决方案

1. ✗ 修改 `ldesign.config.ts` 使用对象格式的 input
2. ✗ 移除 `preserveStructure` 配置
3. ✗ 添加 `preserveStructure` 配置
4. ✗ 修改 `tsconfig.json` 添加 `declarationDir` 和 `composite`
5. ✗ 修改 output 为数组格式

## 根本原因

`@ldesign/builder` 工具在检测到 Qwik 项目时，可能会应用特殊的构建逻辑，导致 Rollup 配置中的 `output.dir` 没有正确传递。

## 临时解决方案

### 方案 1：使用 Vite 直接构建（推荐）

由于 Qwik 是基于 Vite 的，可以直接使用 Vite 进行构建：

```bash
# 安装依赖
pnpm add -D vite @vitejs/plugin-legacy vite-plugin-dts

# 创建 vite.config.ts
# 修改 package.json 中的 build 脚本为: "vite build"
```

### 方案 2：使用 tsc 进行类型生成 + Rollup 手动构建

```bash
# 生成类型定义
tsc --emitDeclarationOnly

# 使用 Rollup 直接构建
pnpm add -D rollup @rollup/plugin-typescript @rollup/plugin-node-resolve
```

### 方案 3：暂时跳过 Qwik 包

Qwik 包的核心功能已经实现，仅构建配置存在问题。可以：
- 保留源代码
- 文档中标注为实验性支持
- 等待 `@ldesign/builder` 工具修复

## 下一步行动

1. 向 `@ldesign/builder` 维护者报告此问题
2. 或者为 Qwik 包单独配置 Vite 构建流程
3. 或者更新 `@ldesign/builder` 以正确处理 Qwik 项目

## 相关文件

- `packages/qwik/ldesign.config.ts` - 构建配置
- `packages/qwik/tsconfig.json` - TypeScript 配置
- `packages/qwik/package.json` - 包配置
- `packages/qwik/src/` - 源代码（功能完整）

## 状态

- **代码**: ✅ 完成
- **类型定义**: ✅ 完成
- **测试**: ✅ 完成
- **构建**: ❌ 配置问题
- **发布**: ⏸️ 等待构建修复

---

创建时间: 2025-10-29  
最后更新: 2025-10-29
