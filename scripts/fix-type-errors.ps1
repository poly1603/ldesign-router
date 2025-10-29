# 批量修复所有新包的 TypeScript 类型错误

$packages = @(
    "alpinejs", "astro", "lit", "nextjs", "nuxtjs", 
    "preact", "qwik", "remix", "sveltekit"
)

foreach ($pkg in $packages) {
    $routerPath = ".\packages\$pkg\src\router.ts"
    
    if (Test-Path $routerPath) {
        Write-Host "Fixing types in $pkg..." -ForegroundColor Yellow
        
        # 读取文件内容
        $content = Get-Content $routerPath -Raw -Encoding UTF8
        
        # 添加 NavigationInformation 类型导入
        $importLine = "import type {
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteRecordRaw,
  RouterHistory,
} from '@ldesign/router-core'"

        $newImportLine = "import type {
  NavigationInformation,
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteRecordRaw,
  RouterHistory,
} from '@ldesign/router-core'"
        
        $content = $content -replace [regex]::Escape($importLine), $newImportLine
        
        # 修复 history.listen 的类型
        $content = $content -replace 'history\.listen\(\(to\) =>', 'history.listen((to: NavigationInformation) =>'
        
        # 保存文件
        Set-Content -Path $routerPath -Value $content -NoNewline -Encoding UTF8
        
        Write-Host "✓ Fixed types in $pkg" -ForegroundColor Green
    }
}

Write-Host "`n✓ All type errors fixed!" -ForegroundColor Cyan
