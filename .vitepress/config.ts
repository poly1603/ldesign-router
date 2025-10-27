import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/router',
  description: '现代化、高性能、类型安全的 Vue 路由库',
  base: '/router/',

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API 参考', link: '/api/core' },
      { text: '示例', link: '/examples/basic' },
      {
        text: '生态系统',
        items: [
          { text: 'LDesign Engine', link: '/ecosystem/engine' },
          { text: 'LDesign 组件库', link: '/ecosystem/components' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '简介', link: '/guide/introduction' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' }
          ]
        },
        {
          text: '基础',
          items: [
            { text: '路由配置', link: '/guide/route-configuration' },
            { text: '导航', link: '/guide/navigation' },
            { text: '路由参数', link: '/guide/route-params' },
            { text: '嵌套路由', link: '/guide/nested-routes' },
            { text: '动态路由', link: '/guide/dynamic-routes' }
          ]
        },
        {
          text: '进阶',
          items: [
            { text: '路由守卫', link: '/guide/guards' },
            { text: '路由元信息', link: '/guide/meta' },
            { text: '懒加载', link: '/guide/lazy-loading' },
            { text: '滚动行为', link: '/guide/scroll-behavior' },
            { text: '过渡动画', link: '/guide/transitions' }
          ]
        },
        {
          text: '高级功能',
          items: [
            { text: 'Engine 集成', link: '/guide/engine-integration' },
            { text: '设备适配', link: '/guide/device-routing' },
            { text: '性能优化', link: '/guide/performance' },
            { text: 'SEO 优化', link: '/guide/seo' },
            { text: 'SSR 支持', link: '/guide/ssr' },
            { text: '智能预加载', link: '/guide/smart-preload' },
            { text: '路由分析', link: '/guide/analytics' },
            { text: '微前端', link: '/guide/micro-frontend' }
          ]
        },
        {
          text: '最佳实践',
          items: [
            { text: '项目结构', link: '/guide/best-practices/project-structure' },
            { text: '性能优化', link: '/guide/best-practices/performance' },
            { text: '类型安全', link: '/guide/best-practices/type-safety' },
            { text: '错误处理', link: '/guide/best-practices/error-handling' }
          ]
        }
      ],
      '/api/': [
        {
          text: '核心 API',
          items: [
            { text: 'createRouter', link: '/api/core' },
            { text: 'Router 实例', link: '/api/router-instance' },
            { text: 'RouteRecord', link: '/api/route-record' },
            { text: 'RouteLocation', link: '/api/route-location' }
          ]
        },
        {
          text: '组合式 API',
          items: [
            { text: 'useRouter', link: '/api/composables/use-router' },
            { text: 'useRoute', link: '/api/composables/use-route' },
            { text: 'useLink', link: '/api/composables/use-link' },
            { text: '其他 Composables', link: '/api/composables/others' }
          ]
        },
        {
          text: '组件',
          items: [
            { text: 'RouterView', link: '/api/components/router-view' },
            { text: 'RouterLink', link: '/api/components/router-link' },
            { text: 'DeviceUnsupported', link: '/api/components/device-unsupported' }
          ]
        },
        {
          text: '插件',
          items: [
            { text: '性能监控插件', link: '/api/plugins/performance' },
            { text: '缓存插件', link: '/api/plugins/cache' },
            { text: '预加载插件', link: '/api/plugins/preload' },
            { text: '智能预加载插件', link: '/api/plugins/smart-preload' },
            { text: '动画插件', link: '/api/plugins/animation' },
            { text: 'SEO 插件', link: '/api/plugins/seo' },
            { text: '设备路由插件', link: '/api/plugins/device' }
          ]
        },
        {
          text: '高级功能',
          items: [
            { text: 'Engine 插件', link: '/api/engine-plugin' },
            { text: '设备适配 API', link: '/api/device-api' },
            { text: 'SSR API', link: '/api/ssr-api' },
            { text: '分析 API', link: '/api/analytics-api' }
          ]
        },
        {
          text: 'TypeScript',
          items: [
            { text: '类型参考', link: '/api/typescript/types' },
            { text: '类型辅助', link: '/api/typescript/helpers' }
          ]
        }
      ],
      '/examples/': [
        {
          text: '基础示例',
          items: [
            { text: '基本使用', link: '/examples/basic' },
            { text: '嵌套路由', link: '/examples/nested-routes' },
            { text: '动态路由', link: '/examples/dynamic-routes' },
            { text: '路由守卫', link: '/examples/guards' }
          ]
        },
        {
          text: '进阶示例',
          items: [
            { text: '懒加载', link: '/examples/lazy-loading' },
            { text: '路由过渡', link: '/examples/transitions' },
            { text: '权限控制', link: '/examples/permission' },
            { text: '多步骤表单', link: '/examples/multi-step-form' }
          ]
        },
        {
          text: '高级示例',
          items: [
            { text: 'Engine 集成', link: '/examples/engine-integration' },
            { text: '设备适配', link: '/examples/device-routing' },
            { text: 'SSR 应用', link: '/examples/ssr' },
            { text: '微前端', link: '/examples/micro-frontend' },
            { text: '性能优化', link: '/examples/performance' },
            { text: 'SEO 优化', link: '/examples/seo' }
          ]
        },
        {
          text: '完整应用',
          items: [
            { text: '后台管理系统', link: '/examples/admin-dashboard' },
            { text: '电商网站', link: '/examples/e-commerce' },
            { text: '博客系统', link: '/examples/blog' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/ldesign' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDesign'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/ldesign/ldesign/edit/main/packages/router/:path',
      text: '在 GitHub 上编辑此页'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    }
  },

  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  }
})

