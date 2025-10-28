import { Component } from 'solid-js'
import { useRouter, useParams, useQuery, useHash } from '@ldesign/router-solid'

const User: Component = () => {
  const router = useRouter()
  const params = useParams()
  const query = useQuery()
  const hash = useHash()

  const changePage = (page: number) => {
    router.push({
      path: `/user/${params().id}`,
      query: { ...query(), page: String(page) },
    })
  }

  const changeTab = (tab: string) => {
    router.push({
      path: `/user/${params().id}`,
      query: { tab, page: '1' },
    })
  }

  const changeSection = (newSection: string) => {
    router.push({
      path: `/user/${params().id}`,
      query: query(),
      hash: newSection,
    })
  }

  return (
    <div class="user" style={{ 'max-width': '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#2c4f7c', 'margin-bottom': '1.5rem' }}>👤 用户详情</h1>

      <div
        style={{
          background: '#f0fdf4',
          padding: '1.5rem',
          'border-radius': '8px',
          'margin-bottom': '2rem',
        }}
      >
        <h2 style={{ 'margin-top': 0, color: '#15803d' }}>路由信息</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { label: '用户 ID', value: params().id },
            { label: '当前标签', value: query().tab || 'profile' },
            { label: '当前页码', value: query().page || '1' },
            { label: '锚点', value: hash() || '无' },
          ].map((item) => (
            <div
              style={{
                display: 'flex',
                'justify-content': 'space-between',
                padding: '0.75rem',
                background: 'white',
                'border-radius': '4px',
              }}
            >
              <span style={{ 'font-weight': 600, color: '#333' }}>
                {item.label}:
              </span>
              <span
                style={{
                  color: '#15803d',
                  'font-family': "'Courier New', monospace",
                  'font-weight': 500,
                }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ 'margin-bottom': '2rem' }}>
        <div style={{ 'margin-bottom': '1.5rem' }}>
          <h3>切换标签</h3>
          <div style={{ display: 'flex', gap: '0.5rem', 'flex-wrap': 'wrap' }}>
            <button onClick={() => changeTab('profile')}>个人资料</button>
            <button onClick={() => changeTab('posts')}>文章列表</button>
            <button onClick={() => changeTab('followers')}>粉丝</button>
          </div>
        </div>

        <div style={{ 'margin-bottom': '1.5rem' }}>
          <h3>切换页码</h3>
          <div style={{ display: 'flex', gap: '0.5rem', 'flex-wrap': 'wrap' }}>
            <button onClick={() => changePage(1)}>第 1 页</button>
            <button onClick={() => changePage(2)}>第 2 页</button>
            <button onClick={() => changePage(3)}>第 3 页</button>
          </div>
        </div>

        <div style={{ 'margin-bottom': '1.5rem' }}>
          <h3>跳转锚点</h3>
          <div style={{ display: 'flex', gap: '0.5rem', 'flex-wrap': 'wrap' }}>
            <button onClick={() => changeSection('top')}>顶部</button>
            <button onClick={() => changeSection('middle')}>中间</button>
            <button onClick={() => changeSection('bottom')}>底部</button>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          'padding-top': '1rem',
          'border-top': '1px solid #e5e5e5',
        }}
      >
        <button onClick={() => router.back()}>返回</button>
        <button onClick={() => router.push('/')}>回到首页</button>
      </div>
    </div>
  )
}

export default User


