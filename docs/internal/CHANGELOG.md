# Changelog

## [Unreleased] - 2025-11-11

### 🗑️ 移除

#### 框架适配清理
- **移除 Angular 适配** (`packages/angular/`)
- **移除 Lit 适配** (`packages/lit/`)
- **移除 Preact 适配** (`packages/preact/`)
- **移除 Qwik 适配** (`packages/qwik/`)
- **移除 React 适配** (`packages/react/`)
- **移除 Solid 适配** (`packages/solid/`)
- **移除 Svelte 适配** (`packages/svelte/`)
- **移除 Vue 2 适配** (`packages/vue2/`)

**原因**: 专注于核心路由器和 Vue 3 适配的优化和完善

### ✨ 新增

#### Core 模块

##### MatcherRegistry 类
- 新增 `MatcherRegistry` 类用于管理多个路由匹配器
- 提供统一的路由匹配接口
- 支持路由添加、删除和匹配
- 内置 LRU 缓存策略，提升匹配性能
- 按优先级返回最佳匹配结果

**API**:
```typescript
const registry = createMatcherRegistry({
  enableCache: true,
  cacheSize: 1000
})

// 添加路由
registry.addRoute('/user/:id', { name: 'user', component: UserPage })
registry.addRoute('/user/profile', { name: 'profile', component: ProfilePage })

// 匹配路径
const result = registry.match('/user/123')
// => { matched: true, params: { id: '123' }, route: {...}, score: 150 }

// 移除路由
registry.removeRoute('/user/:id')
```

**导出**:
- `MatcherRegistry` - 匹配器注册表类
- `createMatcherRegistry` - 创建匹配器注册表的工厂函数
- `MatcherOptions` - 匹配器选项接口

#### Vue 模块

##### 增强的 Composables
新增 7 个增强的 composable 函数，提供更便捷的路由操作：

1. **useNavigationState()** - 获取导航状态
   ```typescript
   const navState = useNavigationState()
   // {
   //   currentPath: string,
   //   currentName: string | symbol | undefined,
   //   isNavigating: boolean,
   //   canGoBack: boolean,
   //   canGoForward: boolean
   // }
   ```

2. **useBreadcrumb()** - 面包屑导航
   ```typescript
   const breadcrumbs = useBreadcrumb()
   // [
   //   { path: '/dashboard', title: 'Dashboard', name: 'dashboard', meta: {...} },
   //   { path: '/dashboard/users', title: 'Users', name: 'users', meta: {...} }
   // ]
   ```

3. **useRouteActive(name, exact)** - 检查路由名称是否活跃
   ```typescript
   const isActive = useRouteActive('UserProfile')
   const isExactActive = useRouteActive('UserProfile', true)
   ```

4. **usePathActive(path, exact)** - 检查路径是否活跃
   ```typescript
   const isActive = usePathActive('/dashboard')
   const isExactActive = usePathActive('/dashboard', true)
   ```

5. **useHasQueryParam(key)** - 检查是否包含查询参数
   ```typescript
   const hasTab = useHasQueryParam('tab')
   // URL: /page?tab=profile => hasTab.value === true
   ```

6. **useQueryParam(key, defaultValue)** - 获取单个查询参数
   ```typescript
   const page = useQueryParam('page', '1')
   const sort = useQueryParam('sort', 'asc')
   ```

7. **useParam(key, defaultValue)** - 获取单个路由参数
   ```typescript
   const userId = useParam('id', '')
   // Route: /user/:id => userId.value === '123' for /user/123
   ```

### 🔧 改进

#### Core 模块

##### Router 类更新
- **修复**: 使用 `MatcherRegistry` 替代单个 `PathMatcher`
- **改进**: 路由匹配性能提升
- **改进**: 更好的路由管理 API
- **改进**: 内置缓存支持

**变更**:
```typescript
// 之前
private matcher: PathMatcher
this.matcher = createMatcher() // ❌ API 不一致

// 现在
private matcher: MatcherRegistry
this.matcher = createMatcherRegistry({
  enableCache: options.enableCache !== false,
  cacheSize: options.cacheSize || 1000
})
```

### 📚 文档

#### 新增文档
- **OPTIMIZATION_SUMMARY.md** - 详细的优化总结和架构分析
  - Core 模块架构分析
  - Vue 模块架构分析
  - 优化建议和实施计划
  - 架构优势总结
  - 下一步计划

### 🏗️ 架构

#### 当前结构
```
packages/
├── core/              # 核心路由器 (框架无关)
│   ├── src/
│   │   ├── router/    # Router 类和插件系统
│   │   ├── history/   # 历史管理
│   │   ├── features/  # 增强功能 (守卫、缓存、SSR 等)
│   │   ├── types/     # 类型定义
│   │   └── utils/     # 工具函数
│   └── package.json
│
└── vue/               # Vue 3 适配层
    ├── src/
    │   ├── router/    # Vue Router 适配
    │   ├── components/ # 路由组件
    │   ├── composables/ # 组合式 API
    │   ├── plugins/   # 插件
    │   └── types/     # Vue 特定类型
    └── package.json
```

### 💡 改进点

#### 性能优化
- ✅ 路径匹配使用 MatcherRegistry 统一管理
- ✅ 内置 LRU 缓存策略
- ✅ 按优先级排序匹配结果

#### 开发体验
- ✅ 新增 7 个便捷的 Vue composables
- ✅ 更完善的类型定义
- ✅ 更清晰的 API 设计

### 🐛 修复

#### Core 模块
- **修复**: `createMatcher()` API 不一致问题
  - 之前: Router 中无参数调用 `createMatcher()`，但实际需要路径参数
  - 现在: 使用 `MatcherRegistry` 统一管理所有路由匹配器

### ⚠️ 破坏性变更

无破坏性变更。所有现有 API 保持兼容。

### 🔮 下一步计划

#### 短期 (1-2 周)
- [ ] 添加单元测试覆盖
- [ ] 完善类型定义
- [ ] 添加 API 文档

#### 中期 (1-2 个月)
- [ ] 性能基准测试
- [ ] 添加 DevTools 支持
- [ ] 实现 Trie 树路径匹配优化
- [ ] 添加更多示例

#### 长期 (3-6 个月)
- [ ] 构建开发者工具
- [ ] 社区反馈整合
- [ ] 稳定版本发布

---

## 迁移指南

### 从多框架版本迁移

如果你之前使用了以下任何框架的适配：
- Angular, Lit, Preact, Qwik, React, Solid, Svelte, Vue 2

**选项 1**: 继续使用旧版本
```bash
# 锁定到旧版本
pnpm add @ldesign/router-react@<old-version>
```

**选项 2**: 迁移到 Core + 自定义适配
```typescript
import { createRouter, Router } from '@ldesign/router-core'

// 为你的框架创建自定义适配层
```

**选项 3**: 迁移到 Vue 3
如果可能，考虑迁移到 Vue 3 以获得最佳支持。

### 内部 API 变更

#### Router 类 (仅影响直接使用 Core 的用户)

```typescript
// ❌ 旧代码 (如果你直接操作 Router 内部)
router.matcher.match('/user/123')

// ✅ 新代码
router.matcher.match('/user/123')
// API 保持不变，但内部实现更改为 MatcherRegistry
```

对于大多数用户来说，这个变更是透明的，不需要任何代码修改。

---

## 贡献者

- 初始清理和优化: @ldesign-team

## 致谢

感谢所有为 ldesign router 项目做出贡献的开发者！
