# 主题管理迁移

本章节详细介绍如何从 `@ldesign/router` v1.x 的内置主题管理迁移到独立的主题管理解决方案。

## 迁移概述

在 v2.x 中，我们移除了内置的主题管理功能，推荐使用以下方案：

1. **@ldesign/color** - 官方主题管理包（推荐）
2. **应用层主题管理** - 自定义实现
3. **第三方主题库** - 如 VueUse 的 useDark

## 使用 @ldesign/color

### 安装

```bash
pnpm add @ldesign/color
```

### 基础迁移

**v1.x (旧版本):**
```typescript
import { createLDesignRouter, useTheme } from '@ldesign/router'

const router = createLDesignRouter({
  routes,
  themeManager: {
    enabled: true,
    defaultTheme: 'light',
    themes: {
      light: {
        primary: '#1890ff',
        background: '#ffffff',
        text: '#000000'
      },
      dark: {
        primary: '#177ddc',
        background: '#141414',
        text: '#ffffff'
      }
    },
    persistent: true,
    systemTheme: true
  }
})

// 在组件中使用
const { theme, setTheme, toggleTheme } = useTheme()
```

**v2.x (新版本):**
```typescript
import { createLDesignRouter } from '@ldesign/router'
import { createThemeManager, useTheme } from '@ldesign/color'

// 创建路由器
const router = createLDesignRouter({ routes })

// 创建主题管理器
const themeManager = createThemeManager({
  defaultTheme: 'light',
  themes: {
    light: {
      primary: '#1890ff',
      background: '#ffffff',
      text: '#000000'
    },
    dark: {
      primary: '#177ddc',
      background: '#141414',
      text: '#ffffff'
    }
  },
  persistent: true,
  systemTheme: true
})

// 在 Vue 应用中使用
app.use(router)
app.use(themeManager)

// 在组件中使用
const { theme, setTheme, toggleTheme } = useTheme()
```

### 高级配置

```typescript
const themeManager = createThemeManager({
  defaultTheme: 'light',

  // 主题定义
  themes: {
    light: {
      primary: '#1890ff',
      secondary: '#52c41a',
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#000000',
      textSecondary: '#666666'
    },
    dark: {
      primary: '#177ddc',
      secondary: '#49aa19',
      background: '#141414',
      surface: '#1f1f1f',
      text: '#ffffff',
      textSecondary: '#cccccc'
    },
    blue: {
      primary: '#2f54eb',
      secondary: '#1890ff',
      background: '#f0f5ff',
      surface: '#e6f7ff',
      text: '#001529',
      textSecondary: '#314659'
    }
  },

  // 配置选项
  persistent: true, // 持久化存储
  systemTheme: true, // 跟随系统主题
  transition: true, // 主题切换动画
  cssVariables: true, // 自动生成 CSS 变量

  // 自定义存储
  storage: {
    get: (key: string) => localStorage.getItem(key),
    set: (key: string, value: string) => localStorage.setItem(key, value)
  },

  // 主题变化回调
  onThemeChange: (theme: string) => {
    console.log('主题已切换到:', theme)
  }
})
```

### 组件中使用

```vue
<script setup lang="ts">
import { useTheme } from '@ldesign/color'

const {
  theme: currentTheme,
  isDark,
  availableThemes,
  followSystem,
  setTheme,
  toggleTheme,
  setFollowSystem
} = useTheme()

function handleThemeChange(event: Event) {
  const target = event.target as HTMLSelectElement
  setTheme(target.value)
}
</script>

<template>
  <div class="theme-switcher">
    <h3>当前主题: {{ currentTheme }}</h3>

    <!-- 主题切换按钮 -->
    <button @click="toggleTheme">
      切换到 {{ isDark ? '浅色' : '深色' }} 主题
    </button>

    <!-- 主题选择器 -->
    <select v-model="currentTheme" @change="handleThemeChange">
      <option v-for="theme in availableThemes" :key="theme" :value="theme">
        {{ theme }}
      </option>
    </select>

    <!-- 跟随系统主题 -->
    <label>
      <input
        v-model="followSystem"
        type="checkbox"
        @change="setFollowSystem"
      >
      跟随系统主题
    </label>
  </div>
</template>

<style scoped>
.theme-switcher {
  padding: 1rem;
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: 8px;
}

button {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

select {
  background: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  padding: 0.5rem;
  border-radius: 4px;
}
</style>
```

## 应用层主题管理

如果您不想使用额外的包，可以在应用层实现简单的主题管理：

### 基础实现

```typescript
// composables/useTheme.ts
import { computed, ref, watch } from 'vue'

type Theme = 'light' | 'dark'

const currentTheme = ref<Theme>('light')
const systemTheme = ref<Theme>('light')
const followSystem = ref(false)

// 检测系统主题
function detectSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// 监听系统主题变化
function watchSystemTheme() {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const handleChange = (e: MediaQueryListEvent) => {
    systemTheme.value = e.matches ? 'dark' : 'light'
  }

  mediaQuery.addEventListener('change', handleChange)
  systemTheme.value = detectSystemTheme()

  return () => mediaQuery.removeEventListener('change', handleChange)
}

// 应用主题
function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.className = theme
}

export function useTheme() {
  const isDark = computed(() => currentTheme.value === 'dark')
  const effectiveTheme = computed(() =>
    followSystem.value ? systemTheme.value : currentTheme.value
  )

  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    followSystem.value = false
    localStorage.setItem('theme', theme)
    applyTheme(theme)
  }

  const toggleTheme = () => {
    setTheme(currentTheme.value === 'light' ? 'dark' : 'light')
  }

  const setFollowSystem = (follow: boolean) => {
    followSystem.value = follow
    localStorage.setItem('followSystem', follow.toString())

    if (follow) {
      localStorage.removeItem('theme')
    }
  }

  // 监听有效主题变化
  watch(effectiveTheme, (theme) => {
    applyTheme(theme)
  }, { immediate: true })

  // 初始化
  const init = () => {
    const savedTheme = localStorage.getItem('theme') as Theme
    const savedFollowSystem = localStorage.getItem('followSystem') === 'true'

    if (savedFollowSystem) {
      followSystem.value = true
      watchSystemTheme()
    }
 else if (savedTheme) {
      currentTheme.value = savedTheme
    }
 else {
      // 默认跟随系统
      followSystem.value = true
      watchSystemTheme()
    }
  }

  // 在组件挂载时初始化
  onMounted(init)

  return {
    theme: currentTheme,
    isDark,
    followSystem,
    setTheme,
    toggleTheme,
    setFollowSystem
  }
}
```

### CSS 变量定义

```css
/* styles/themes.css */
:root {
  /* 浅色主题 */
  --color-primary: #1890ff;
  --color-secondary: #52c41a;
  --color-background: #ffffff;
  --color-surface: #f5f5f5;
  --color-text: #000000;
  --color-text-secondary: #666666;
  --color-border: #d9d9d9;
}

[data-theme="dark"] {
  /* 深色主题 */
  --color-primary: #177ddc;
  --color-secondary: #49aa19;
  --color-background: #141414;
  --color-surface: #1f1f1f;
  --color-text: #ffffff;
  --color-text-secondary: #cccccc;
  --color-border: #434343;
}

/* 主题切换动画 */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

## 与路由集成

### 路由级主题

```typescript
// 在路由元信息中指定主题
const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    meta: {
      theme: 'dark' // 管理后台使用深色主题
    }
  },
  {
    path: '/user',
    component: UserLayout,
    meta: {
      theme: 'light' // 用户页面使用浅色主题
    }
  }
]

// 在路由守卫中应用主题
router.beforeEach((to, from, next) => {
  if (to.meta?.theme) {
    setTheme(to.meta.theme)
  }
  next()
})
```

### 主题持久化

```typescript
// 保存主题到用户配置
async function saveThemeToProfile(theme: string) {
  try {
    await api.updateUserProfile({
      theme
    })
  }
 catch (error) {
    console.error('保存主题失败:', error)
  }
}

// 从用户配置加载主题
async function loadThemeFromProfile() {
  try {
    const profile = await api.getUserProfile()
    if (profile.theme) {
      setTheme(profile.theme)
    }
  }
 catch (error) {
    console.error('加载主题失败:', error)
  }
}
```

## 迁移检查清单

### 1. 代码更新

- [ ] 移除路由器配置中的 `themeManager`
- [ ] 更新 `useTheme` 的导入路径
- [ ] 安装新的主题管理依赖
- [ ] 更新主题相关的组件代码

### 2. 样式更新

- [ ] 检查 CSS 变量的使用
- [ ] 更新主题切换动画
- [ ] 验证所有主题下的样式

### 3. 功能测试

- [ ] 测试主题切换功能
- [ ] 测试主题持久化
- [ ] 测试系统主题跟随
- [ ] 测试路由级主题

### 4. 性能验证

- [ ] 检查主题切换性能
- [ ] 验证包体积变化
- [ ] 测试首屏加载时间

## 常见问题

### Q: 迁移后主题切换不生效？

A: 检查 CSS 变量是否正确定义，确保 `data-theme` 属性正确设置。

### Q: 如何保持与 v1.x 相同的 API？

A: 可以创建一个适配器层，保持相同的接口：

```typescript
// theme-adapter.ts
import { useTheme as useColorTheme } from '@ldesign/color'

export function useTheme() {
  const colorTheme = useColorTheme()

  // 保持 v1.x 的 API
  return {
    theme: colorTheme.theme,
    setTheme: colorTheme.setTheme,
    toggleTheme: colorTheme.toggleTheme,
    // 添加其他需要的方法
  }
}
```

### Q: 如何处理自定义主题？

A: 在新的主题管理器中定义自定义主题：

```typescript
const themeManager = createThemeManager({
  themes: {
    // 保持原有主题
    light: { /* ... */ },
    dark: { /* ... */ },

    // 添加自定义主题
    custom: {
      primary: '#ff6b6b',
      background: '#fff5f5',
      // ...
    }
  }
})
```

通过这个迁移指南，您可以顺利地从内置主题管理迁移到独立的主题管理解决方案。
