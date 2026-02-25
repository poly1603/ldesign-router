export interface RouterEnginePluginOptions {
  dependencies?: string[]
  /** 路由模式 */
  mode?: 'history' | 'hash' | 'memory'
  /** 基础路径 */
  base?: string
}
