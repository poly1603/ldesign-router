import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/router',
  description: '现代化的 Vue 3 企业级路由管理器',

  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: '功能', link: '/features/guards' },
      { text: 'API', link: '/api/router' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '核心概念', link: '/guide/core-concepts' },
            { text: '配置指南', link: '/guide/configuration' },
            { text: 'VitePress 使用指南', link: '/guide/vitepress-usage' },
          ],
        },
        {
          text: '进阶指南',
          items: [
            { text: '最佳实践', link: '/guide/best-practices' },
            { text: '性能优化', link: '/guide/performance' },
            { text: '调试指南', link: '/guide/debugging' },
            { text: '迁移指南', link: '/guide/migration' },
          ],
        },
      ],
      '/features/': [
        {
          text: '核心功能',
          items: [
            { text: '导航守卫', link: '/features/guards' },
            { text: '权限管理', link: '/features/permissions' },
            { text: '路由缓存', link: '/features/caching' },
            { text: '设备路由', link: '/features/device-routing' },
          ],
        },
        {
          text: 'UI 功能',
          items: [
            { text: '标签页管理', link: '/features/tabs' },
            { text: '面包屑导航', link: '/features/breadcrumbs' },
            { text: '菜单管理', link: '/features/menu' },
            { text: '页面动画', link: '/features/animations' },
          ],
        },
        {
          text: '开发工具',
          items: [
            { text: '开发者工具', link: '/features/dev-tools' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '路由器 API', link: '/api/router' },
            { text: 'Composables', link: '/api/composables' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/poly1603/ldesign' },
    ],
  },
})
