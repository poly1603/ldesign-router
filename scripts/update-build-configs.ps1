# 批量更新所有新包的构建配置，移除 UMD 格式

$packages = @(
    "alpinejs", "astro", "lit", "nextjs", "nuxtjs", 
    "preact", "qwik", "remix", "sveltekit"
)

foreach ($pkg in $packages) {
    $configPath = ".\packages\$pkg\ldesign.config.ts"
    
    if (Test-Path $configPath) {
        Write-Host "Updating build config for $pkg..." -ForegroundColor Yellow
        
        # 读取文件内容
        $content = Get-Content $configPath -Raw -Encoding UTF8
        
        # 移除 UMD 配置，只保留 ESM 和 CJS
        $oldConfig = "  output: {
    format: ['esm', 'cjs', 'umd'],
    esm: {
      dir: 'es',
      preserveStructure: true,
    },
    cjs: {
      dir: 'lib',
      preserveStructure: true,
    },
    umd: {
      dir: 'dist',
      name: "
      
        $newConfig = "  output: {
    format: ['esm', 'cjs'],
    esm: {
      dir: 'es',
      preserveStructure: true,
    },
    cjs: {
      dir: 'lib',
      preserveStructure: true,
    },
    // umd: {
    //   dir: 'dist',
    //   name: "
        
        $content = $content -replace [regex]::Escape($oldConfig), $newConfig
        
        # 移除 umd 配置块的结束部分
        $content = $content -replace "    },\r?\n  },", "    },`n  },"
        
        # 保存文件
        Set-Content -Path $configPath -Value $content -NoNewline -Encoding UTF8
        
        Write-Host "✓ Updated build config for $pkg" -ForegroundColor Green
    }
}

Write-Host "`n✓ All build configs updated!" -ForegroundColor Cyan
