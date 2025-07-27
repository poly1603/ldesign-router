import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/router',
  description: '现代化的 Vue 3 企业级路由管理器',
  base: '/',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#1890ff' }]
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: '功能', link: '/features/guards' },
      { text: 'API', link: '/api/router' },
      { text: '迁移', link: '/guide/migration' },
      {
        text: '相关链接',
        items: [
          { text: 'GitHub', link: 'https://github.com/poly1603/ldesign' },
          { text: 'LDesign 主站', link: 'https://ldesign.dev' },
          { text: '更新日志', link: '/changelog' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '核心概念', link: '/guide/core-concepts' },
            { text: '配置选项', link: '/guide/configuration' }
          ]
        },
        {
          text: '进阶指南',
          items: [
            { text: '最佳实践', link: '/guide/best-practices' },
            { text: '性能优化', link: '/guide/performance' },
            { text: '调试技巧', link: '/guide/debugging' },
            { text: 'VitePress 使用指南', link: '/guide/vitepress-usage' }
          ]
        },
        {
          text: '升级指南',
          items: [
            { text: '从 v1.x 迁移', link: '/guide/migration' },
            { text: '主题管理迁移', link: '/guide/theme-migration' },
            { text: '国际化迁移', link: '/guide/i18n-migration' }
          ]
        }
      ],
      '/features/': [
        {
          text: '核心功能',
          items: [
            { text: '导航守卫', link: '/features/guards' },
            { text: '权限管理', link: '/features/permissions' },
            { text: '缓存管理', link: '/features/caching' }
          ]
        },
        {
          text: '导航功能',
          items: [
            { text: '面包屑导航', link: '/features/breadcrumbs' },
            { text: '标签页管理', link: '/features/tabs' },
            { text: '菜单管理', link: '/features/menu' }
          ]
        },
        {
          text: '增强功能',
          items: [
            { text: '路由动画', link: '/features/animations' },
            { text: '设备适配', link: '/features/device-routing' },
            { text: '开发工具', link: '/features/dev-tools' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '路由器 API', link: '/api/router' },
            { text: '类型定义', link: '/api/types' },
            { text: '组合式函数', link: '/api/composables' },
            { text: '管理器 API', link: '/api/managers' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/poly1603/ldesign' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDesign Team'
    },

    editLink: {
      pattern: 'https://github.com/poly1603/ldesign/edit/main/packages/router/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    outline: {
      label: '页面导航'
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式'
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  }
})
