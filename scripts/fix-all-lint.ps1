# 批量修复所有包的 lint 错误

$packages = @(
    "alpinejs", "astro", "lit", "nextjs", "nuxtjs", 
    "preact", "qwik", "remix", "sveltekit"
)

foreach ($pkg in $packages) {
    $pkgPath = ".\packages\$pkg"
    
    # 修复 router.ts 中的 unused routes
    $routerPath = "$pkgPath\src\router.ts"
    if (Test-Path $routerPath) {
        $content = Get-Content $routerPath -Raw
        $content = $content -replace "const \{ history, routes \} = options", "const { history } = options"
        Set-Content -Path $routerPath -Value $content -NoNewline
    }
    
    # 修复 e2e test 中的 unused page
    $e2ePath = "$pkgPath\e2e\basic.test.ts"
    if (Test-Path $e2ePath) {
        $content = Get-Content $e2ePath -Raw
        $content = $content -replace "\{ page \}", "{ page: _page }"
        Set-Content -Path $e2ePath -Value $content -NoNewline
    }
    
    # 修复 performance test 中的模板字符串
    $perfPath = "$pkgPath\__tests__\performance.test.ts"
    if (Test-Path $perfPath) {
        $content = Get-Content $perfPath -Raw
        $content = $content -replace '`/test-\$\{i\}`', '`/test-${ i }`'
        Set-Content -Path $perfPath -Value $content -NoNewline
    }
    
    Write-Host "Fixed lint issues for: $pkg" -ForegroundColor Green
}

Write-Host "`nAll lint issues fixed!" -ForegroundColor Cyan
