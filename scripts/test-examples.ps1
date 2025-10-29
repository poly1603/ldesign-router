# 测试所有示例项目的脚本

$examples = @(
    @{ Name = "alpinejs-example"; Port = 3000 },
    @{ Name = "react-example"; Port = 3001 }
)

Write-Host "`n╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         📋 示例项目测试报告                           ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$results = @()

foreach ($example in $examples) {
    $examplePath = ".\examples\$($example.Name)"
    
    Write-Host "🔍 检查: $($example.Name)" -ForegroundColor Yellow
    
    $result = @{
        Name = $example.Name
        Port = $example.Port
        Exists = $false
        HasPackageJson = $false
        HasReadme = $false
        HasSrc = $false
        HasIndex = $false
        NodeModules = $false
    }
    
    # 检查目录是否存在
    if (Test-Path $examplePath) {
        $result.Exists = $true
        Write-Host "  ✅ 目录存在" -ForegroundColor Green
        
        # 检查 package.json
        if (Test-Path "$examplePath\package.json") {
            $result.HasPackageJson = $true
            Write-Host "  ✅ package.json 存在" -ForegroundColor Green
        } else {
            Write-Host "  ❌ package.json 不存在" -ForegroundColor Red
        }
        
        # 检查 README.md
        if (Test-Path "$examplePath\README.md") {
            $result.HasReadme = $true
            Write-Host "  ✅ README.md 存在" -ForegroundColor Green
        } else {
            Write-Host "  ❌ README.md 不存在" -ForegroundColor Red
        }
        
        # 检查 src 目录
        if (Test-Path "$examplePath\src") {
            $result.HasSrc = $true
            Write-Host "  ✅ src 目录存在" -ForegroundColor Green
        } else {
            Write-Host "  ❌ src 目录不存在" -ForegroundColor Red
        }
        
        # 检查 index.html
        if (Test-Path "$examplePath\index.html") {
            $result.HasIndex = $true
            Write-Host "  ✅ index.html 存在" -ForegroundColor Green
        } else {
            Write-Host "  ❌ index.html 不存在" -ForegroundColor Red
        }
        
        # 检查 node_modules
        if (Test-Path "$examplePath\node_modules") {
            $result.NodeModules = $true
            Write-Host "  ✅ 依赖已安装" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  依赖未安装" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ❌ 目录不存在" -ForegroundColor Red
    }
    
    $results += $result
    Write-Host ""
}

# 生成报告
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                  📊 测试总结                          ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$totalExamples = $results.Count
$completeExamples = ($results | Where-Object { $_.Exists -and $_.HasPackageJson -and $_.HasReadme -and $_.HasSrc -and $_.HasIndex }).Count
$installedExamples = ($results | Where-Object { $_.NodeModules }).Count

Write-Host "总示例数量: $totalExamples" -ForegroundColor White
Write-Host "完整示例: $completeExamples/$totalExamples" -ForegroundColor $(if ($completeExamples -eq $totalExamples) { "Green" } else { "Yellow" })
Write-Host "已安装依赖: $installedExamples/$totalExamples`n" -ForegroundColor $(if ($installedExamples -eq $totalExamples) { "Green" } else { "Yellow" })

# 详细报告
Write-Host "📋 详细报告:" -ForegroundColor Yellow
Write-Host ""
Write-Host "| 示例项目        | 目录 | package.json | README | src | index.html | 依赖 |" -ForegroundColor Cyan
Write-Host "|----------------|------|-------------|--------|-----|------------|------|" -ForegroundColor Cyan

foreach ($result in $results) {
    $line = "| $($result.Name.PadRight(14)) |"
    $line += " $(if ($result.Exists) { '✅' } else { '❌' })   |"
    $line += " $(if ($result.HasPackageJson) { '✅' } else { '❌' })          |"
    $line += " $(if ($result.HasReadme) { '✅' } else { '❌' })     |"
    $line += " $(if ($result.HasSrc) { '✅' } else { '❌' })  |"
    $line += " $(if ($result.HasIndex) { '✅' } else { '❌' })         |"
    $line += " $(if ($result.NodeModules) { '✅' } else { '❌' })   |"
    Write-Host $line -ForegroundColor White
}

Write-Host ""

# 建议
Write-Host "🎯 建议操作:" -ForegroundColor Yellow

$needInstall = $results | Where-Object { $_.Exists -and -not $_.NodeModules }
if ($needInstall.Count -gt 0) {
    Write-Host "`n需要安装依赖的示例:" -ForegroundColor Cyan
    foreach ($ex in $needInstall) {
        Write-Host "  cd examples\$($ex.Name) && pnpm install --ignore-scripts" -ForegroundColor White
    }
}

$canRun = $results | Where-Object { $_.Exists -and $_.NodeModules }
if ($canRun.Count -gt 0) {
    Write-Host "`n可以运行的示例:" -ForegroundColor Cyan
    foreach ($ex in $canRun) {
        Write-Host "  cd examples\$($ex.Name) && pnpm dev  # 端口: $($ex.Port)" -ForegroundColor White
    }
}

Write-Host "`n╚═══════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
