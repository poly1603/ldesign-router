import { useRouter, useParams, useQuery, useHash } from '@ldesign/router-react'

export default function User() {
  const router = useRouter()
  const params = useParams()
  const query = useQuery()
  const hash = useHash()

  const userId = params.id
  const currentTab = query.tab || 'profile'
  const currentPage = query.page || '1'
  const section = hash || '无'

  const changePage = (page: number) => {
    router.push({
      path: `/user/${userId}`,
      query: { ...query, page: String(page) },
    })
  }

  const changeTab = (tab: string) => {
    router.push({
      path: `/user/${userId}`,
      query: { tab, page: '1' },
    })
  }

  const changeSection = (newSection: string) => {
    router.push({
      path: `/user/${userId}`,
      query,
      hash: newSection,
    })
  }

  return (
    <div className="user" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#61dafb', marginBottom: '1.5rem' }}>👤 用户详情</h1>

      <div
        style={{
          background: '#f0fdf4',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
        }}
      >
        <h2 style={{ marginTop: 0, color: '#15803d' }}>路由信息</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { label: '用户 ID', value: userId },
            { label: '当前标签', value: currentTab },
            { label: '当前页码', value: currentPage },
            { label: '锚点', value: section },
          ].map((item, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.75rem',
                background: 'white',
                borderRadius: '4px',
              }}
            >
              <span style={{ fontWeight: 600, color: '#333' }}>
                {item.label}:
              </span>
              <span
                style={{
                  color: '#15803d',
                  fontFamily: "'Courier New', monospace",
                  fontWeight: 500,
                }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h3>切换标签</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => changeTab('profile')}>个人资料</button>
            <button onClick={() => changeTab('posts')}>文章列表</button>
            <button onClick={() => changeTab('followers')}>粉丝</button>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3>切换页码</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => changePage(1)}>第 1 页</button>
            <button onClick={() => changePage(2)}>第 2 页</button>
            <button onClick={() => changePage(3)}>第 3 页</button>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3>跳转锚点</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
          paddingTop: '1rem',
          borderTop: '1px solid #e5e5e5',
        }}
      >
        <button onClick={() => router.back()}>返回</button>
        <button onClick={() => router.push('/')}>回到首页</button>
      </div>
    </div>
  )
}


