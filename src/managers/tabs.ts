import { reactive, ref } from 'vue'
import type { Route, TabItem, TabsConfig } from '../types'

/**
 * 标签页管理器
 * 负责管理多标签页导航功能
 */
export class TabsManager {
  private _tabs = ref<TabItem[]>([])
  private _activeTabId = ref<string>('')

  private config = reactive<Required<TabsConfig>>({
    enabled: false,
    max: 10,
    persistent: true,
    closable: true,
    draggable: false,
    contextMenu: true,
    cache: true,
  })

  constructor(
    private router: any, // 使用 any 避免循环依赖
    config: TabsConfig = {},
  ) {
    Object.assign(this.config, config)
    this.initializeTabs()
  }

  /**
   * 初始化标签页
   */
  private initializeTabs(): void {
    if (!this.config.enabled)
return

    // 从存储中恢复标签页（如果启用了持久化）
    if (this.config.persistent) {
      this.loadTabsFromStorage()
    }
  }

  /**
   * 添加标签页
   * @param route 路由信息
   */
  addTab(route: Route): void {
    if (!this.config.enabled)
return

    // 检查路由是否应该显示为标签页
    if (route.meta?.tab === false)
return

    const tabId = this.generateTabId(route)
    const existingTab = this._tabs.value.find(tab => tab.id === tabId)

    if (existingTab) {
      // 激活已存在的标签页
      this._activeTabId.value = tabId
    }
 else {
      // 创建新标签页
      const newTab: TabItem = {
        id: tabId,
        title: this.getTabTitle(route),
        path: route.path,
        name: route.name,
        icon: route.meta?.icon,
        closable: this.isTabClosable(route),
        cached: this.shouldCacheTab(route),
        meta: route.meta || {},
      }

      // 检查标签页数量限制
      if (this._tabs.value.length >= this.config.max) {
        this.removeOldestTab()
      }

      this._tabs.value.push(newTab)
      this._activeTabId.value = tabId
    }

    // 保存到存储
    if (this.config.persistent) {
      this.saveTabsToStorage()
    }
  }

  /**
   * 关闭标签页
   * @param tabId 标签页ID
   */
  closeTab(tabId: string): void {
    const index = this._tabs.value.findIndex(tab => tab.id === tabId)
    if (index === -1)
return

    const tab = this._tabs.value[index]
    if (!tab.closable)
return

    // 如果关闭的是当前激活的标签页，需要激活其他标签页
    if (this._activeTabId.value === tabId) {
      this.activateAdjacentTab(index)
    }

    this._tabs.value.splice(index, 1)

    // 清理缓存
    if (tab.cached && this.router.cacheManager) {
      this.router.cacheManager.removeFromCache(tabId)
    }

    // 保存到存储
    if (this.config.persistent) {
      this.saveTabsToStorage()
    }
  }

  /**
   * 关闭其他标签页
   * @param keepTabId 保留的标签页ID
   */
  closeOtherTabs(keepTabId: string): void {
    this._tabs.value = this._tabs.value.filter(tab =>
      tab.id === keepTabId || !tab.closable,
    )

    this._activeTabId.value = keepTabId

    if (this.config.persistent) {
      this.saveTabsToStorage()
    }
  }

  /**
   * 关闭所有标签页
   */
  closeAllTabs(): void {
    this._tabs.value = this._tabs.value.filter(tab => !tab.closable)

    if (this._tabs.value.length > 0) {
      this._activeTabId.value = this._tabs.value[0].id
    }
 else {
      this._activeTabId.value = ''
    }

    if (this.config.persistent) {
      this.saveTabsToStorage()
    }
  }

  /**
   * 激活标签页
   * @param tabId 标签页ID
   */
  activateTab(tabId: string): void {
    const tab = this._tabs.value.find(t => t.id === tabId)
    if (tab) {
      this._activeTabId.value = tabId
      this.router.push({ path: tab.path })
    }
  }

  /**
   * 移动标签页
   * @param fromIndex 源索引
   * @param toIndex 目标索引
   */
  moveTab(fromIndex: number, toIndex: number): void {
    if (!this.config.draggable)
return

    const tabs = this._tabs.value
    if (fromIndex < 0 || fromIndex >= tabs.length || toIndex < 0 || toIndex >= tabs.length) {
      return
    }

    const [movedTab] = tabs.splice(fromIndex, 1)
    tabs.splice(toIndex, 0, movedTab)

    if (this.config.persistent) {
      this.saveTabsToStorage()
    }
  }

  /**
   * 获取标签页列表
   */
  getTabs(): TabItem[] {
    return this._tabs.value
  }

  /**
   * 获取当前激活的标签页ID
   */
  getActiveTabId(): string {
    return this._activeTabId.value
  }

  /**
   * 获取当前激活的标签页
   */
  getActiveTab(): TabItem | undefined {
    return this._tabs.value.find(tab => tab.id === this._activeTabId.value)
  }

  /**
   * 生成标签页ID
   * @param route 路由信息
   * @returns 标签页ID
   */
  private generateTabId(route: Route): string {
    // 使用路由名称和参数生成唯一ID
    const params = Object.keys(route.params).length > 0
      ? JSON.stringify(route.params)
      : ''
    return `${route.name}${params}`
  }

  /**
   * 获取标签页标题
   * @param route 路由信息
   * @returns 标题
   */
  private getTabTitle(route: Route): string {
    return route.meta?.title || route.name || route.path
  }

  /**
   * 检查标签页是否可关闭
   * @param route 路由信息
   * @returns 是否可关闭
   */
  private isTabClosable(route: Route): boolean {
    if (route.meta?.closable === false)
return false
    return this.config.closable
  }

  /**
   * 检查是否应该缓存标签页
   * @param route 路由信息
   * @returns 是否缓存
   */
  private shouldCacheTab(route: Route): boolean {
    if (route.meta?.cache === false)
return false
    return this.config.cache
  }

  /**
   * 移除最旧的标签页
   */
  private removeOldestTab(): void {
    // 找到第一个可关闭的标签页
    const closableIndex = this._tabs.value.findIndex(tab => tab.closable)
    if (closableIndex !== -1) {
      const tabId = this._tabs.value[closableIndex].id
      this.closeTab(tabId)
    }
  }

  /**
   * 激活相邻的标签页
   * @param closedIndex 被关闭标签页的索引
   */
  private activateAdjacentTab(closedIndex: number): void {
    const tabs = this._tabs.value

    // 优先激活右侧标签页
    if (closedIndex < tabs.length - 1) {
      this._activeTabId.value = tabs[closedIndex + 1].id
    }
    // 否则激活左侧标签页
    else if (closedIndex > 0) {
      this._activeTabId.value = tabs[closedIndex - 1].id
    }
    // 如果没有其他标签页，清空激活状态
    else {
      this._activeTabId.value = ''
    }
  }

  /**
   * 保存标签页到存储
   */
  private saveTabsToStorage(): void {
    try {
      const data = {
        tabs: this._tabs.value,
        activeTabId: this._activeTabId.value,
      }
      localStorage.setItem('ldesign-router-tabs', JSON.stringify(data))
    }
 catch (error) {
      console.warn('Failed to save tabs to storage:', error)
    }
  }

  /**
   * 从存储加载标签页
   */
  private loadTabsFromStorage(): void {
    try {
      const data = localStorage.getItem('ldesign-router-tabs')
      if (data) {
        const parsed = JSON.parse(data)
        this._tabs.value = parsed.tabs || []
        this._activeTabId.value = parsed.activeTabId || ''
      }
    }
 catch (error) {
      console.warn('Failed to load tabs from storage:', error)
    }
  }

  /**
   * 获取标签页统计信息
   */
  getTabsStats(): {
    total: number
    maxTabs: number
    activeTab: string
    enabled: boolean
  } {
    return {
      total: this._tabs.value.length,
      maxTabs: this.config.max,
      activeTab: this._activeTabId.value,
      enabled: this.config.enabled,
    }
  }
}
