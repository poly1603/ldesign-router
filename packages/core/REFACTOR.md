# @ldesign/router-core 重构说明

## 重构日期
2025-11-11

## 重构目标
规范化命名,去除 "enhanced" 前缀,使包结构更清晰易懂。

## 主要变更

### 1. 文件重命名

#### Router 模块
- `router/enhanced-router.ts` → `router/router.ts`
- `EnhancedRouter` → `Router`

#### History 模块
- `history/enhanced.ts` → `history/advanced.ts`
- `EnhancedHistory` → `AdvancedHistory`
- `EnhancedHistoryOptions` → `AdvancedHistoryOptions`
- `createEnhancedHistory()` → `createAdvancedHistory()`

#### Types 模块
- `types/enhanced.ts` → `types/typed.ts`
- 保留所有导出的类型名称

#### Utils 模块
- `utils/path-enhanced.ts` → `utils/path-advanced.ts`
- `utils/query-enhanced.ts` → `utils/query-advanced.ts`
- 保留所有函数名称(如 `parseQueryEnhanced` 等)

### 2. 兼容性

为了保持向后兼容,所有旧的命名都保留为 **deprecated 别名**:

```typescript
// 旧代码仍然可以工作
import { EnhancedHistory, createEnhancedHistory } from '@ldesign/router-core'

// 但建议使用新名称
import { AdvancedHistory, createAdvancedHistory } from '@ldesign/router-core'
```

### 3. 包结构

```
@ldesign/router-core/
├── history/          # 历史管理
│   ├── base.ts       # 基础历史
│   ├── html5.ts      # HTML5 History
│   ├── hash.ts       # Hash History
│   ├── memory.ts     # Memory History
│   └── advanced.ts   # 高级历史(持久化、拦截器、快照)
├── router/           # 核心路由器
│   ├── router.ts     # 主路由器实现
│   ├── plugin.ts     # 插件系统
│   ├── chainable.ts  # 链式 API
│   └── promise.ts    # Promise API
├── types/            # 类型定义
│   ├── base.ts       # 基础类型
│   ├── history.ts    # 历史类型
│   ├── navigation.ts # 导航类型
│   └── typed.ts      # 类型安全系统
├── utils/            # 工具函数
│   ├── path.ts           # 基础路径工具
│   ├── path-advanced.ts  # 高级路径工具
│   ├── query.ts          # 基础查询工具
│   ├── query-advanced.ts # 高级查询工具
│   ├── matcher.ts        # 路径匹配
│   ├── normalizer.ts     # 标准化
│   ├── validator.ts      # 验证器
│   └── ...
└── features/         # 可选功能
    ├── guards.ts         # 守卫系统
    ├── scroll.ts         # 滚动管理
    ├── cache.ts          # 缓存
    ├── lazy-loading.ts   # 懒加载
    ├── prefetch.ts       # 预取
    └── ...
```

## 迁移指南

### 对于 Core 包用户

#### 1. 导入路径不变
```typescript
// ✅ 所有导入路径保持不变
import { Router, createRouter } from '@ldesign/router-core'
import { AdvancedHistory } from '@ldesign/router-core'
import { parseQueryEnhanced } from '@ldesign/router-core'
```

#### 2. 类型名称更新 (可选)
```typescript
// 旧方式 (仍然可用,但标记为 deprecated)
import type { EnhancedHistoryOptions } from '@ldesign/router-core'

// 新方式 (推荐)
import type { AdvancedHistoryOptions } from '@ldesign/router-core'
```

### 对于框架集成包 (React, Vue, Svelte 等)

框架包依赖 `@ldesign/router-core`,需要更新导入:

```typescript
// 之前
import { EnhancedRouter } from '@ldesign/router-core'

// 之后
import { Router } from '@ldesign/router-core'
```

## 核心理念

### 1. 模块化设计
- **基础模块** (base): 提供核心功能
- **高级模块** (advanced): 提供可选的高级特性
- **类型模块** (typed): 提供类型安全

### 2. 清晰的命名
- 去除 "enhanced" 这样模糊的词汇
- 使用更具描述性的名称:
  - `Router` - 核心路由器
  - `AdvancedHistory` - 高级历史管理
  - `typed` - 类型安全系统

### 3. 框架无关
Core 包不包含任何框架特定代码,可被任何框架集成:
- `@ldesign/router-react` - React 绑定
- `@ldesign/router-vue` - Vue 绑定
- `@ldesign/router-svelte` - Svelte 绑定
- 等等...

## 打包和导出

### Package Exports
```json
{
  ".": "./es/index.js",
  "./history": "./es/history/index.js",
  "./router": "./es/router/index.js",
  "./types": "./es/types/index.js",
  "./utils": "./es/utils/index.js",
  "./features": "./es/features/index.js"
}
```

### 使用示例
```typescript
// 完整导入
import { Router, createRouter } from '@ldesign/router-core'

// 按需导入
import { AdvancedHistory } from '@ldesign/router-core/history'
import { parseQueryEnhanced } from '@ldesign/router-core/utils'
import { GuardManager } from '@ldesign/router-core/features'
```

## 测试

所有测试文件保持不变,确保功能完整性。

## 下一步

1. 更新所有框架集成包使用新的导入
2. 更新文档和示例
3. 在下一个主版本中移除 deprecated 别名

## 破坏性变更

**无破坏性变更**。所有旧的 API 都通过别名保持可用。
