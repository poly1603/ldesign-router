# 批量更新所有 Router 包的导出

$frameworks = @('solid', 'svelte', 'lit', 'preact', 'qwik', 'angular')

$exportCode = @'

// ==================== Engine 插件导出 ====================
export {
  createRouterEnginePlugin,
  createDefaultRouterEnginePlugin,
  routerPlugin,
} from './engine-plugin'

export type {
  RouterEnginePluginOptions,
  RouterMode,
  RouterPreset,
} from './engine-plugin'
'@

foreach ($framework in $frameworks) {
    $indexPath = "packages/$framework/src/index.ts"
    
    if (Test-Path $indexPath) {
        Write-Host "Updating $indexPath..."
        
        # 读取文件内容
        $content = Get-Content $indexPath -Raw
        
        # 检查是否已经有 Engine 插件导出
        if ($content -notmatch 'createRouterEnginePlugin') {
            # 添加导出到文件末尾
            $content = $content.TrimEnd() + "`n" + $exportCode + "`n"
            
            # 写回文件
            Set-Content -Path $indexPath -Value $content -NoNewline
            
            Write-Host "✓ Updated $framework" -ForegroundColor Green
        } else {
            Write-Host "○ $framework already has engine plugin exports" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✗ $indexPath not found" -ForegroundColor Red
    }
}

Write-Host "`nDone!" -ForegroundColor Cyan

