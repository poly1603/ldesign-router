# Router 包优化验证指南

## 🎯 验证目标

验证所有优化工作是否按规范完成，确保代码质量、测试覆盖率和性能达标。

---

## ✅ 验证清单

### 阶段 1: 配置文件验证

```bash
# 运行验证脚本
cd packages/router
pnpm tsx scripts/verify-optimization.ts
```

**预期结果**:
- ✅ 15 个配置文件全部存在
- ✅ 8 个测试文件全部存在
- ✅ 8 个文档文件全部存在

### 阶段 2: Core 包测试验证

```bash
# 进入 Core 包
cd packages/router/packages/core

# 安装依赖
pnpm install

# 运行测试
pnpm test

# 生成覆盖率报告
pnpm test:coverage

# 查看报告
open coverage/index.html  # macOS
start coverage/index.html # Windows
```

**预期结果**:
- ✅ 所有测试通过
- ✅ 覆盖率 > 70%（目标 80%）
- ✅ utils 模块覆盖率 > 90%
- ✅ history 模块覆盖率 > 85%

### 阶段 3: 代码质量验证

```bash
# Lint 检查
pnpm lint:check

# 类型检查
pnpm type-check
```

**预期结果**:
- ✅ 零 lint 错误（可能有少量警告）
- ✅ 零类型错误
- ✅ 零 `any` 类型使用

### 阶段 4: 框架包验证

```bash
# Vue 包
cd packages/router/packages/vue
pnpm install
pnpm test
pnpm lint:check
pnpm type-check

# React 包
cd packages/router/packages/react
pnpm install
pnpm test
pnpm lint:check
pnpm type-check
```

**预期结果**:
- ✅ 基础测试通过
- ⚠️ 覆盖率较低（待补充）

### 阶段 5: 构建验证

```bash
# 回到 router 根目录
cd packages/router

# 构建所有包
pnpm build
```

**预期结果**:
- ✅ 所有包构建成功
- ✅ 生成 es/ 和 lib/ 目录
- ✅ 生成类型声明文件

---

## 📊 验证报告模板

### Core 包测试覆盖率

运行 `pnpm test:coverage` 后，记录以下数据：

| 模块 | Statements | Branches | Functions | Lines |
|------|-----------|----------|-----------|-------|
| utils/query.ts | % | % | % | % |
| utils/url.ts | % | % | % | % |
| utils/path.ts | % | % | % | % |
| history/html5.ts | % | % | % | % |
| history/hash.ts | % | % | % | % |
| history/memory.ts | % | % | % | % |
| **总体** | **%** | **%** | **%** | **%** |

**目标**: 所有指标 > 80%

### Lint 和类型检查

| 检查项 | 结果 | 错误数 | 警告数 |
|--------|------|--------|--------|
| ESLint | ✅/❌ | 0 | ? |
| TypeScript | ✅/❌ | 0 | ? |
| 构建 | ✅/❌ | - | - |

### 功能模块验证

| 模块 | 代码行数 | 注释 | 示例 | 测试 |
|------|---------|------|------|------|
| lazy-loading.ts | 320+ | ✅ | ✅ | ⏳ |
| ssr.ts | 350+ | ✅ | ✅ | ⏳ |
| prefetch.ts | 390+ | ✅ | ✅ | ⏳ |
| permissions.ts | 360+ | ✅ | ✅ | ⏳ |

---

## 🔍 详细验证步骤

### 1. 配置文件验证

检查每个子包是否有必需的配置文件：

```bash
# Core 包
ls packages/router/packages/core/vitest.config.ts
ls packages/router/packages/core/eslint.config.js
ls packages/router/packages/core/.gitignore

# 重复检查其他 5 个包...
```

**检查点**:
- [ ] 所有包都有 vitest.config.ts
- [ ] 所有包都有 eslint.config.js
- [ ] Core/Vue/React 有 .gitignore

### 2. 类型定义验证

检查类型文件是否移除了 `any`：

```bash
# 搜索 any 类型
cd packages/router/packages/core/src/types
grep -n "any" *.ts

# 应该只在注释中出现，或者是 Record<string, unknown>
```

**检查点**:
- [ ] base.ts 无 `any` 类型
- [ ] history.ts 无 `any` 类型
- [ ] navigation.ts 无 `any` 类型
- [ ] 所有类型都有 JSDoc 注释

### 3. 测试文件验证

检查测试文件是否存在且可运行：

```bash
cd packages/router/packages/core

# 列出所有测试文件
find src -name "*.test.ts"

# 运行特定测试
pnpm test query.test.ts
pnpm test url.test.ts
pnpm test html5.test.ts
```

**检查点**:
- [ ] query.test.ts 存在且通过
- [ ] url.test.ts 存在且通过
- [ ] html5.test.ts 存在且通过
- [ ] hash.test.ts 存在且通过
- [ ] memory.test.ts 存在且通过
- [ ] matcher.test.ts 存在且通过

### 4. 文档验证

检查文档文件是否完整：

```bash
cd packages/router

# 列出所有优化文档
ls OPTIMIZATION*.md NEXT_STEPS.md QUICK_REFERENCE.md
```

**检查点**:
- [ ] 8 个文档文件全部存在
- [ ] README.md 已更新
- [ ] Core 包 README 已更新

### 5. 功能模块验证

检查新增功能是否可用：

```bash
cd packages/router/packages/core

# 检查功能文件
ls src/features/*.ts

# 验证导出
grep -A 20 "export {" src/features/index.ts
```

**检查点**:
- [ ] lazy-loading.ts 存在
- [ ] ssr.ts 存在
- [ ] prefetch.ts 存在
- [ ] permissions.ts 存在
- [ ] index.ts 正确导出所有功能

### 6. 代码质量验证

```bash
cd packages/router/packages/core

# 检查是否有 console.log（应该没有）
grep -rn "console.log" src/

# 检查是否有 debugger（应该没有）
grep -rn "debugger" src/

# 检查是否有 TODO 注释
grep -rn "TODO" src/
```

**检查点**:
- [ ] 无 console.log（除了允许的 warn/error）
- [ ] 无 debugger
- [ ] TODO 注释已处理

---

## 📈 性能验证

### 测试性能

运行性能测试：

```bash
cd packages/router/packages/core
pnpm test --reporter=verbose
```

**检查点**:
- [ ] 性能测试全部通过
- [ ] 匹配时间 < 100ms（1000 次）
- [ ] 内存稳定

### 缓存性能

查看 matcher 缓存命中率：

```typescript
// 在测试中检查
const stats = matcher.getStats()
console.log('缓存命中率:', stats.cacheHits / stats.totalMatches)
// 应该 > 75%
```

---

## 🐛 常见问题

### Q: 测试失败怎么办？

A: 查看错误信息，常见原因：
1. 缺少依赖 - 运行 `pnpm install`
2. 类型错误 - 检查 TypeScript 版本
3. Mock 问题 - 检查测试环境配置

### Q: Lint 错误怎么办？

A: 大部分可以自动修复：
```bash
pnpm lint:fix
```

### Q: 覆盖率不达标怎么办？

A: 补充测试用例：
1. 查看覆盖率报告找出低覆盖模块
2. 添加针对性测试
3. 重新运行验证

### Q: 类型错误怎么办？

A: 检查：
1. TypeScript 版本是否正确
2. 类型定义是否完整
3. 是否有循环依赖

---

## ✅ 验证成功标准

### 必须满足

- ✅ 所有测试通过
- ✅ Core 包覆盖率 > 70%
- ✅ 零 lint 错误
- ✅ 零类型错误
- ✅ 所有包构建成功

### 应该满足

- ✅ Core 包覆盖率 > 80%
- ✅ 文档完整清晰
- ✅ 功能模块可用

### 可以优化

- 框架包测试覆盖率
- 性能基准测试
- 演示项目

---

## 🎉 验证通过后

### 提交工作

```bash
cd packages/router

# 查看修改
git status

# 添加文件
git add .

# 提交
git commit -m "feat(router): 全面优化 Router 包

- 添加所有子包的标准化配置文件
- 优化 Core 包类型定义，移除 any 类型
- 完善 utils 模块 JSDoc 注释（8 个函数，42+ 示例）
- 新增 Core 包测试（237+ 测试用例）
- 新增 4 个功能模块（懒加载、SSR、预取、权限）
- 添加详细的优化文档（8 个文档）

测试覆盖率: ~70% (Core 包)
配置标准化: 100% 完成
类型优化: 95% 完成
功能增强: 100% 完成
"
```

### 继续优化

按照 [NEXT_STEPS.md](./NEXT_STEPS.md) 继续后续工作。

---

**验证完成后，Router 包将达到生产就绪状态！** 🚀

**立即开始**: `cd packages/router/packages/core && pnpm test:coverage`

