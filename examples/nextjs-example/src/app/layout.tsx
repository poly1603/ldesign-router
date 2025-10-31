import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '@ldesign/router-nextjs 示例',
  description: 'Next.js 15 路由示例应用',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
