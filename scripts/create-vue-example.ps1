# 快速创建 Vue 示例项目

$examplePath = ".\examples\vue-example"

Write-Host "`n🚀 创建 Vue 示例项目..." -ForegroundColor Cyan

# 创建目录
New-Item -ItemType Directory -Force -Path "$examplePath\src" | Out-Null
Write-Host "✅ 创建目录结构" -ForegroundColor Green

# package.json
$packageJson = @"
{
  "name": "vue-router-example",
  "version": "1.0.0",
  "private": true,
  "description": "Vue 3 router example using @ldesign/router-vue",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@ldesign/router-vue": "workspace:*",
    "vue": "^3.4.15"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.3",
    "typescript": "^5.7.3",
    "vite": "^5.0.12",
    "vue-tsc": "^3.0.5"
  }
}
"@
Set-Content -Path "$examplePath\package.json" -Value $packageJson
Write-Host "✅ 创建 package.json" -ForegroundColor Green

# index.html
$indexHtml = @"
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vue Router Example</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
"@
Set-Content -Path "$examplePath\index.html" -Value $indexHtml
Write-Host "✅ 创建 index.html" -ForegroundColor Green

# vite.config.ts
$viteConfig = @"
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3002,
    open: true,
  },
})
"@
Set-Content -Path "$examplePath\vite.config.ts" -Value $viteConfig
Write-Host "✅ 创建 vite.config.ts" -ForegroundColor Green

# tsconfig.json
$tsconfig = @"
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
"@
Set-Content -Path "$examplePath\tsconfig.json" -Value $tsconfig
Write-Host "✅ 创建 tsconfig.json" -ForegroundColor Green

# README.md
$readme = @"
# Vue Router Example

基于 @ldesign/router-vue 的示例项目。

## 开发

\`\`\`bash
pnpm install --ignore-scripts
pnpm dev
\`\`\`

访问: http://localhost:3002

## 功能

- ✅ Vue 3 + TypeScript
- ✅ Hash 模式路由
- ✅ 动态路由参数
- ✅ 编程式导航
- ✅ 组合式 API
"@
Set-Content -Path "$examplePath\README.md" -Value $readme
Write-Host "✅ 创建 README.md" -ForegroundColor Green

Write-Host "`n✨ Vue 示例项目创建完成！" -ForegroundColor Green
Write-Host "📁 路径: examples\vue-example" -ForegroundColor Cyan
Write-Host "`n下一步:" -ForegroundColor Yellow
Write-Host "  1. cd examples\vue-example" -ForegroundColor White
Write-Host "  2. pnpm install --ignore-scripts" -ForegroundColor White
Write-Host "  3. pnpm dev" -ForegroundColor White
Write-Host "  4. 访问 http://localhost:3002`n" -ForegroundColor White
