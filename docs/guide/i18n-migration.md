# 国际化迁移

本章节详细介绍如何从 `@ldesign/router` v1.x 的内置国际化功能迁移到标准的国际化解决方案。

## 迁移概述

在 v2.x 中，我们移除了内置的国际化功能，推荐使用以下方案：

1. **vue-i18n** - Vue 官方国际化库（推荐）
2. **@intlify/unplugin-vue-i18n** - 构建时优化
3. **应用层国际化** - 自定义实现

## 使用 vue-i18n

### 安装

```bash
pnpm add vue-i18n@9
```

### 基础迁移

**v1.x (旧版本):**
```typescript
import { createLDesignRouter, useI18n } from '@ldesign/router'

const router = createLDesignRouter({
  routes,
  i18nManager: {
    enabled: true,
    defaultLocale: 'zh-CN',
    fallbackLocale: 'en-US',
    messages: {
      'zh-CN': {
        hello: '你好',
        welcome: '欢迎使用',
        routes: {
          home: '首页',
          about: '关于我们'
        }
      },
      'en-US': {
        hello: 'Hello',
        welcome: 'Welcome',
        routes: {
          home: 'Home',
          about: 'About'
        }
      }
    },
    persistent: true,
    detectBrowserLanguage: true
  }
})

// 在组件中使用
const { locale, t, setLocale } = useI18n()
```

**v2.x (新版本):**
```typescript
import { createLDesignRouter } from '@ldesign/router'
import { createI18n } from 'vue-i18n'

// 在组件中使用
import { useI18n } from 'vue-i18n'

// 创建路由器
const router = createLDesignRouter({ routes })

// 创建国际化实例
const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': {
      hello: '你好',
      welcome: '欢迎使用',
      routes: {
        home: '首页',
        about: '关于我们'
      }
    },
    'en-US': {
      hello: 'Hello',
      welcome: 'Welcome',
      routes: {
        home: 'Home',
        about: 'About'
      }
    }
  }
})

// 在 Vue 应用中使用
app.use(router)
app.use(i18n)
const { locale, t } = useI18n()
```

### 高级配置

```typescript
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  // 基础配置
  locale: 'zh-CN',
  fallbackLocale: 'en-US',

  // 消息格式
  messages: {
    'zh-CN': {
      // 基础消息
      hello: '你好 {name}',
      welcome: '欢迎使用 {app}',

      // 复数形式
      item: '没有项目 | 一个项目 | {count} 个项目',

      // 嵌套消息
      user: {
        profile: '用户资料',
        settings: '用户设置'
      },

      // 路由相关
      routes: {
        home: '首页',
        about: '关于我们',
        contact: '联系我们'
      }
    },
    'en-US': {
      hello: 'Hello {name}',
      welcome: 'Welcome to {app}',
      item: 'no items | one item | {count} items',
      user: {
        profile: 'User Profile',
        settings: 'User Settings'
      },
      routes: {
        home: 'Home',
        about: 'About',
        contact: 'Contact'
      }
    }
  },

  // 数字格式
  numberFormats: {
    'zh-CN': {
      currency: {
        style: 'currency',
        currency: 'CNY'
      },
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 2
      }
    },
    'en-US': {
      currency: {
        style: 'currency',
        currency: 'USD'
      },
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 2
      }
    }
  },

  // 日期格式
  datetimeFormats: {
    'zh-CN': {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      },
      long: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric'
      }
    },
    'en-US': {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      },
      long: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric'
      }
    }
  },

  // 其他选项
  legacy: false, // 使用 Composition API
  globalInjection: true, // 全局注入 $t
  missingWarn: false, // 关闭缺失警告
  fallbackWarn: false // 关闭回退警告
})
```

### 组件中使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, n, d, locale } = useI18n()

const userName = ref('张三')
const itemCount = ref(5)
const price = ref(99.99)
const quantity = ref(1234.56)
</script>

<template>
  <div class="i18n-demo">
    <!-- 基础翻译 -->
    <h1>{{ t('welcome', { app: 'LDesign Router' }) }}</h1>
    <p>{{ t('hello', { name: userName }) }}</p>

    <!-- 复数形式 -->
    <p>{{ t('item', itemCount, { count: itemCount }) }}</p>

    <!-- 数字格式化 -->
    <p>价格: {{ n(price, 'currency') }}</p>
    <p>数量: {{ n(quantity, 'decimal') }}</p>

    <!-- 日期格式化 -->
    <p>日期: {{ d(new Date(), 'short') }}</p>
    <p>时间: {{ d(new Date(), 'long') }}</p>

    <!-- 语言切换 -->
    <select v-model="locale">
      <option value="zh-CN">
        中文
      </option>
      <option value="en-US">
        English
      </option>
    </select>

    <!-- 路由标题 -->
    <nav>
      <router-link to="/">
        {{ t('routes.home') }}
      </router-link>
      <router-link to="/about">
        {{ t('routes.about') }}
      </router-link>
    </nav>
  </div>
</template>
```

## 路由国际化

### 路由标题国际化

```typescript
// 在路由配置中使用国际化键
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'routes.home' // 使用国际化键
    }
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: {
      title: 'routes.about'
    }
  }
]

// 在导航守卫中设置页面标题
router.afterEach((to) => {
  const { t } = i18n.global

  if (to.meta?.title) {
    document.title = t(to.meta.title as string)
  }
})
```

### 动态路由国际化

```typescript
// utils/i18n-routes.ts
import { useI18n } from 'vue-i18n'

export function useI18nRoutes() {
  const { t, locale } = useI18n()

  // 生成国际化路由
  const generateI18nRoutes = (routes: RouteConfig[]) => {
    return routes.map(route => ({
      ...route,
      meta: {
        ...route.meta,
        title: route.meta?.title ? t(route.meta.title) : route.meta?.title
      },
      children: route.children ? generateI18nRoutes(route.children) : undefined
    }))
  }

  // 监听语言变化，更新路由标题
  watch(locale, () => {
    const currentRoute = router.currentRoute.value
    if (currentRoute.meta?.title) {
      document.title = t(currentRoute.meta.title as string)
    }
  })

  return {
    generateI18nRoutes
  }
}
```

## 懒加载国际化

### 按需加载语言包

```typescript
// i18n/index.ts
import { createI18n } from 'vue-i18n'

// 默认消息（只包含必要的）
const messages = {
  'zh-CN': {
    loading: '加载中...',
    error: '加载失败'
  },
  'en-US': {
    loading: 'Loading...',
    error: 'Load failed'
  }
}

const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages
})

// 懒加载语言包
export async function loadLocaleMessages(locale: string) {
  try {
    const messages = await import(`./locales/${locale}.json`)
    i18n.global.setLocaleMessage(locale, messages.default)
    return true
  }
 catch (error) {
    console.error(`Failed to load locale ${locale}:`, error)
    return false
  }
}

// 设置语言
export async function setI18nLanguage(locale: string) {
  // 加载语言包
  const loaded = await loadLocaleMessages(locale)
  if (!loaded)
return false

  // 设置语言
  i18n.global.locale.value = locale

  // 设置 HTML lang 属性
  document.querySelector('html')?.setAttribute('lang', locale)

  // 保存到本地存储
  localStorage.setItem('locale', locale)

  return true
}

export default i18n
```

### 语言包文件结构

```
src/i18n/
├── index.ts
├── locales/
│   ├── zh-CN.json
│   ├── en-US.json
│   ├── ja-JP.json
│   └── ko-KR.json
└── modules/
    ├── common.json
    ├── routes.json
    └── errors.json
```

## 应用层国际化

如果您不想使用 vue-i18n，可以实现简单的国际化：

```typescript
// composables/useI18n.ts
import { computed, ref } from 'vue'

type Locale = 'zh-CN' | 'en-US'
type Messages = Record<string, any>

const currentLocale = ref<Locale>('zh-CN')
const messages = ref<Record<Locale, Messages>>({
  'zh-CN': {},
  'en-US': {}
})

export function useI18n() {
  const locale = computed({
    get: () => currentLocale.value,
    set: (value: Locale) => {
      currentLocale.value = value
      localStorage.setItem('locale', value)
      document.querySelector('html')?.setAttribute('lang', value)
    }
  })

  const t = (key: string, params?: Record<string, any>) => {
    const keys = key.split('.')
    let message = messages.value[currentLocale.value]

    for (const k of keys) {
      message = message?.[k]
    }

    if (typeof message !== 'string') {
      return key // 返回键名作为后备
    }

    // 简单的参数替换
    if (params) {
      return message.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param] || match
      })
    }

    return message
  }

  const setLocale = (newLocale: Locale) => {
    locale.value = newLocale
  }

  const addMessages = (locale: Locale, newMessages: Messages) => {
    messages.value[locale] = {
      ...messages.value[locale],
      ...newMessages
    }
  }

  return {
    locale,
    t,
    setLocale,
    addMessages
  }
}
```

## 构建时优化

### 使用 unplugin-vue-i18n

```bash
pnpm add @intlify/unplugin-vue-i18n -D
```

```typescript
// vite.config.ts
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueI18n from '@intlify/unplugin-vue-i18n/vite'

export default defineConfig({
  plugins: [
    vue(),
    VueI18n({
      // 语言文件目录
      include: resolve(dirname(fileURLToPath(import.meta.url)), './src/i18n/locales/**'),
      // 构建时优化
      compositionOnly: true,
      runtimeOnly: true
    })
  ]
})
```

## 迁移检查清单

### 1. 代码更新

- [ ] 移除路由器配置中的 `i18nManager`
- [ ] 更新 `useI18n` 的导入路径
- [ ] 安装 vue-i18n 依赖
- [ ] 创建独立的 i18n 实例

### 2. 消息文件

- [ ] 迁移消息文件到新格式
- [ ] 检查消息键的使用
- [ ] 验证复数形式和参数

### 3. 组件更新

- [ ] 更新组件中的 i18n 使用
- [ ] 检查路由标题国际化
- [ ] 验证数字和日期格式化

### 4. 功能测试

- [ ] 测试语言切换功能
- [ ] 测试消息翻译
- [ ] 测试路由标题更新
- [ ] 测试懒加载语言包

## 常见问题

### Q: 如何处理路由参数的国际化？

A: 可以在路由守卫中处理：

```typescript
router.beforeEach((to, from, next) => {
  // 国际化路由参数
  if (to.params.category) {
    to.params.category = t(`categories.${to.params.category}`)
  }
  next()
})
```

### Q: 如何实现 URL 国际化？

A: 可以为不同语言创建不同的路由：

```typescript
const routes = [
  // 中文路由
  { path: '/关于我们', component: About, meta: { locale: 'zh-CN' } },
  // 英文路由
  { path: '/about', component: About, meta: { locale: 'en-US' } }
]
```

### Q: 如何处理 SEO 和多语言？

A: 使用 vue-meta 或类似库：

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useMeta } from 'vue-meta'

const { t } = useI18n()

useMeta({
  title: t('page.title'),
  meta: [
    { name: 'description', content: t('page.description') },
    { property: 'og:title', content: t('page.title') }
  ]
})
</script>
```

通过这个迁移指南，您可以顺利地从内置国际化功能迁移到标准的 vue-i18n 解决方案。
