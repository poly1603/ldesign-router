# 配置文件使用指南

## 📁 配置文件位置和命名

### @ldesign/builder 配置（用于库包构建）

**优先级顺序**：
1. `.ldesign/builder.config.ts` ✅ **推荐**
2. `.ldesign/builder.config.js`
3. `ldesign.config.ts` (备用)
4. `builder.config.ts`

**使用场景**：用于构建库包（packages/router/packages/core, vue, react, svelte, solid）

**示例** (`.ldesign/builder.config.ts`):
```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    format: ['esm', 'cjs'],
    esm: { dir: 'es', preserveStructure: true },
    cjs: { dir: 'lib', preserveStructure: true },
  },
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['vue', 'react', '@ldesign/router-core'],
})
```

### @ldesign/launcher 配置（用于示例应用）

**推荐位置**：
- `.ldesign/launcher.config.ts` ✅ **推荐**
- `launcher.config.ts` (根目录)

**使用场景**：用于启动示例应用（example 目录）

**示例** (`.ldesign/launcher.config.ts`):
```typescript
import { defineConfig } from '@ldesign/launcher'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  
  server: {
    port: 5173,
    open: true,
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  
  resolve: {
    alias: {
      '@ldesign/router-vue': resolve(__dirname, '../src'),
      '@ldesign/router-core': resolve(__dirname, '../../core/src'),
    },
  },
})
```

## 🗂️ 项目结构

### 库包结构（使用 builder）

```
packages/router/packages/vue/
├── .ldesign/
│   └── builder.config.ts        ✅ Builder 配置
├── src/                          源代码
├── es/                          ESM 输出
├── lib/                          CJS 输出
├── package.json
└── tsconfig.json
```

### 示例应用结构（使用 launcher）

```
packages/router/packages/vue/example/
├── .ldesign/
│   └── launcher.config.ts       ✅ Launcher 配置
├── src/                          示例源代码
│   ├── views/                   页面组件
│   ├── App.vue
│   ├── main.ts
│   └── router.ts
├── package.json
├── index.html
└── tsconfig.json
```

## 📝 当前项目配置

### Router 包配置

所有路由包目前使用备用名称（也可正常工作）：

```
packages/router/packages/
├── core/
│   └── ldesign.config.ts        ⚠️ 备用名称（建议改为 .ldesign/builder.config.ts）
├── vue/
│   └── ldesign.config.ts        ⚠️ 备用名称
├── react/
│   └── ldesign.config.ts        ⚠️ 备用名称
├── svelte/
│   └── ldesign.config.ts        ⚠️ 备用名称
└── solid/
    └── ldesign.config.ts        ⚠️ 备用名称
```

### 示例应用配置

所有示例应用现已使用正确位置：

```
packages/router/packages/
├── vue/example/
│   └── .ldesign/launcher.config.ts     ✅ 正确
├── react/example/
│   └── .ldesign/launcher.config.ts     ✅ 正确
├── svelte/example/
│   └── .ldesign/launcher.config.ts     ✅ 正确
└── solid/example/
    └── .ldesign/launcher.config.ts     ✅ 正确
```

## 🚀 运行命令

### 使用 @ldesign/builder（构建库包）

```bash
cd packages/router/packages/vue
pnpm run build      # 使用 ldesign-builder build
```

Builder 会自动查找配置文件：
1. 先查找 `.ldesign/builder.config.ts`
2. 找不到则使用 `ldesign.config.ts`
3. 都找不到则使用默认配置

### 使用 @ldesign/launcher（运行示例）

```bash
cd packages/router/packages/vue/example
pnpm dev      # 使用 ldesign-launcher dev
pnpm build    # 使用 ldesign-launcher build
pnpm preview  # 使用 ldesign-launcher preview
```

Launcher 会自动查找：
1. `.ldesign/launcher.config.ts` ✅
2. `launcher.config.ts`
3. 都找不到则使用默认配置

## 🔧 配置选项对比

### Builder 配置重点

```typescript
defineConfig({
  input: 'src/index.ts',           // 入口文件
  output: { format: [...] },       // 输出格式
  dts: true,                       // 生成类型声明
  external: [...],                 // 外部依赖
  clean: true,                     // 构建前清理
})
```

### Launcher 配置重点

```typescript
defineConfig({
  plugins: [...],                  // Vite 插件
  server: { port, open },          // 开发服务器
  build: { outDir, sourcemap },    // 构建选项
  resolve: { alias },              // 路径别名
})
```

## ✅ 正确的配置方式

### 1. 创建 .ldesign 目录

```bash
mkdir .ldesign
```

### 2. 创建配置文件

**库包**（使用 builder）：
```bash
# 在包根目录
touch .ldesign/builder.config.ts
```

**示例应用**（使用 launcher）：
```bash
# 在示例根目录
touch .ldesign/launcher.config.ts
```

### 3. 编写配置

参考本文档中的示例。

## 📊 总结

| 工具 | 配置文件 | 位置 | 用途 |
|------|---------|------|------|
| **@ldesign/builder** | `builder.config.ts` | `.ldesign/` 或根目录 | 构建库包 |
| **@ldesign/launcher** | `launcher.config.ts` | `.ldesign/` 或根目录 | 启动示例应用 |

✅ **当前状态**: 所有示例应用已修正为使用 `.ldesign/launcher.config.ts`

---

**最后更新**: 2025-10-28  
**作者**: @ldesign Team


