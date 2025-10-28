import { Component } from 'solid-js'
import { useRouter, useRoute, useMeta } from '@ldesign/router-solid'

const About: Component = () => {
  const router = useRouter()
  const route = useRoute()
  const meta = useMeta()

  return (
    <div class="about" style={{ 'max-width': '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#2c4f7c', 'margin-bottom': '1.5rem' }}>📖 关于</h1>

      <div
        style={{
          background: '#f0f9ff',
          padding: '1.5rem',
          'border-radius': '8px',
          'margin-bottom': '2rem',
        }}
      >
        <h2 style={{ 'margin-top': 0, color: '#0369a1' }}>当前路由信息</h2>
        <dl
          style={{
            display: 'grid',
            'grid-template-columns': '120px 1fr',
            gap: '0.5rem',
            margin: 0,
          }}
        >
          <dt style={{ 'font-weight': 600, color: '#333' }}>路径:</dt>
          <dd
            style={{
              margin: 0,
              color: '#666',
              'font-family': "'Courier New', monospace",
            }}
          >
            {route.path()}
          </dd>

          <dt style={{ 'font-weight': 600, color: '#333' }}>完整路径:</dt>
          <dd
            style={{
              margin: 0,
              color: '#666',
              'font-family': "'Courier New', monospace",
            }}
          >
            {route.fullPath()}
          </dd>

          <dt style={{ 'font-weight': 600, color: '#333' }}>元信息标题:</dt>
          <dd
            style={{
              margin: 0,
              color: '#666',
              'font-family': "'Courier New', monospace",
            }}
          >
            {(meta().title as string) || '无'}
          </dd>
        </dl>
      </div>

      <div style={{ 'margin-bottom': '2rem' }}>
        <h2 style={{ color: '#333' }}>关于 @ldesign/router-solid</h2>
        <p style={{ 'line-height': 1.6, color: '#666', 'margin-bottom': '1rem' }}>
          @ldesign/router-solid 是一个基于 @solidjs/router 的增强路由库，
          它提供了与 @ldesign/router-core 的深度集成，
          为 Solid.js 应用提供了统一的路由解决方案。
        </p>

        <h3 style={{ color: '#333' }}>主要特点</h3>
        <ul style={{ 'padding-left': '2rem' }}>
          <li style={{ margin: '0.5rem 0', color: '#666' }}>
            完全兼容 @solidjs/router 的 API
          </li>
          <li style={{ margin: '0.5rem 0', color: '#666' }}>
            与 @ldesign/router-core 共享类型定义
          </li>
          <li style={{ margin: '0.5rem 0', color: '#666' }}>
            使用 @ldesign/launcher 统一管理
          </li>
          <li style={{ margin: '0.5rem 0', color: '#666' }}>
            提供细粒度响应式体验
          </li>
        </ul>
      </div>

      <button onClick={() => router.back()}>返回上一页</button>
    </div>
  )
}

export default About


