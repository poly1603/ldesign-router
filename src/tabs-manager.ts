import { ref, reactive, computed, watch } from 'vue'
import type { TabItem, TabConfig, RouteLocationNormalized, Route } from './types'
import type { LDesignRouter } from './router'

export class TabsManager {
  private _tabs = ref<TabItem[]>([])
  private _activeTabId = ref<string>('')
  private _config = reactive<Required<TabConfig>>({
    enabled: true,
    max: 10,
    persistent: true,
    closable: true,
    draggable: true,
    contextMenu: true,
    cache: true
  })

  private _dragState = reactive({
    isDragging: false,
    dragIndex: -1,
    dropIndex: -1
  })

  constructor(
    private router: LDesignRouter,
    config?: TabConfig
  ) {
    if (config) {
      Object.assign(this._config, config)
    }

    if (this._config.enabled) {
      this.init()
    }
  }

  get tabs(): TabItem[] {
    return this._tabs.value
  }

  get activeTabId(): string {
    return this._activeTabId.value
  }

  get activeTab(): TabItem | null {
    return this._tabs.value.find(tab => tab.id === this._activeTabId.value) || null
  }

  get config(): Required<TabConfig> {
    return this._config
  }

  get dragState() {
    return this._dragState
  }

  private init(): void {
    // 从本地存储恢复标签页
    if (this._config.persistent) {
      this.restoreFromStorage()
    }

    // 监听标签页变化并保存到本地存储
    if (this._config.persistent) {
      watch(
        () => this._tabs.value,
        () => this.saveToStorage(),
        { deep: true }
      )
    }
  }

  /**
   * 路由变化时的处理
   */
  onRouteChange(to: RouteLocationNormalized, from: Route): void {
    if (!this._config.enabled) return

    // 检查路由是否应该显示为标签页
    if (!this.shouldShowAsTab(to)) return

    const existingTab = this.findTabByPath(to.path)
    
    if (existingTab) {
      // 激活现有标签页
      this.setActiveTab(existingTab.id)
      // 更新标签页信息
      this.updateTab(existingTab.id, {
        title: this.getTabTitle(to),
        meta: to.meta
      })
    } else {
      // 创建新标签页
      this.addTab({
        id: this.generateTabId(),
        title: this.getTabTitle(to),
        path: to.path,
        name: to.name,
        icon: to.meta.icon,
        closable: this._config.closable && to.meta.closable !== false,
        cached: this._config.cache && to.meta.cache !== false,
        meta: to.meta
      })
    }
  }

  /**
   * 添加标签页
   */
  addTab(tab: Omit<TabItem, 'id'> & { id?: string }): TabItem {
    const newTab: TabItem = {
      id: tab.id || this.generateTabId(),
      title: tab.title,
      path: tab.path,
      name: tab.name,
      icon: tab.icon,
      closable: tab.closable,
      cached: tab.cached,
      meta: tab.meta
    }

    // 检查是否超过最大数量
    if (this._tabs.value.length >= this._config.max) {
      this.removeOldestTab()
    }

    this._tabs.value.push(newTab)
    this.setActiveTab(newTab.id)

    this.emitTabChange('add', newTab)
    return newTab
  }

  /**
   * 移除标签页
   */
  removeTab(tabId: string): boolean {
    const index = this._tabs.value.findIndex(tab => tab.id === tabId)
    if (index === -1) return false

    const tab = this._tabs.value[index]
    if (!tab.closable) return false

    this._tabs.value.splice(index, 1)

    // 如果移除的是当前激活的标签页，需要激活其他标签页
    if (this._activeTabId.value === tabId) {
      const newActiveTab = this._tabs.value[Math.max(0, index - 1)] || this._tabs.value[0]
      if (newActiveTab) {
        this.setActiveTab(newActiveTab.id)
        this.router.push({ path: newActiveTab.path })
      }
    }

    // 清除缓存
    if (tab.cached) {
      this.router.routeCache.removeCache(tab.name)
    }

    this.emitTabChange('remove', tab)
    return true
  }

  /**
   * 更新标签页
   */
  updateTab(tabId: string, updates: Partial<Omit<TabItem, 'id'>>): boolean {
    const tab = this._tabs.value.find(t => t.id === tabId)
    if (!tab) return false

    Object.assign(tab, updates)
    this.emitTabChange('update', tab)
    return true
  }

  /**
   * 设置激活的标签页
   */
  setActiveTab(tabId: string): boolean {
    const tab = this._tabs.value.find(t => t.id === tabId)
    if (!tab) return false

    this._activeTabId.value = tabId
    this.emitTabChange('activate', tab)
    return true
  }

  /**
   * 关闭其他标签页
   */
  closeOtherTabs(tabId: string): void {
    const targetTab = this._tabs.value.find(t => t.id === tabId)
    if (!targetTab) return

    const tabsToRemove = this._tabs.value.filter(tab => 
      tab.id !== tabId && tab.closable
    )

    tabsToRemove.forEach(tab => {
      if (tab.cached) {
        this.router.routeCache.removeCache(tab.name)
      }
    })

    this._tabs.value = this._tabs.value.filter(tab => 
      tab.id === tabId || !tab.closable
    )

    this.setActiveTab(tabId)
    this.router.push({ path: targetTab.path })
  }

  /**
   * 关闭所有标签页
   */
  closeAllTabs(): void {
    const tabsToRemove = this._tabs.value.filter(tab => tab.closable)
    
    tabsToRemove.forEach(tab => {
      if (tab.cached) {
        this.router.routeCache.removeCache(tab.name)
      }
    })

    this._tabs.value = this._tabs.value.filter(tab => !tab.closable)
    
    if (this._tabs.value.length > 0) {
      this.setActiveTab(this._tabs.value[0].id)
      this.router.push({ path: this._tabs.value[0].path })
    } else {
      this._activeTabId.value = ''
      this.router.push({ path: '/' })
    }
  }

  /**
   * 刷新标签页
   */
  refreshTab(tabId: string): void {
    const tab = this._tabs.value.find(t => t.id === tabId)
    if (!tab) return

    // 清除缓存
    if (tab.cached) {
      this.router.routeCache.removeCache(tab.name)
    }

    // 重新加载路由
    if (this._activeTabId.value === tabId) {
      this.router.replace({ path: tab.path })
    }

    this.emitTabChange('refresh', tab)
  }

  /**
   * 拖拽开始
   */
  startDrag(tabId: string, event: DragEvent): void {
    if (!this._config.draggable) return

    const index = this._tabs.value.findIndex(tab => tab.id === tabId)
    if (index === -1) return

    this._dragState.isDragging = true
    this._dragState.dragIndex = index

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', tabId)
    }
  }

  /**
   * 拖拽结束
   */
  endDrag(): void {
    if (this._dragState.dragIndex !== -1 && this._dragState.dropIndex !== -1) {
      this.moveTab(this._dragState.dragIndex, this._dragState.dropIndex)
    }

    this._dragState.isDragging = false
    this._dragState.dragIndex = -1
    this._dragState.dropIndex = -1
  }

  /**
   * 拖拽悬停
   */
  dragOver(tabId: string, event: DragEvent): void {
    if (!this._config.draggable || !this._dragState.isDragging) return

    event.preventDefault()
    const index = this._tabs.value.findIndex(tab => tab.id === tabId)
    this._dragState.dropIndex = index
  }

  /**
   * 移动标签页
   */
  moveTab(fromIndex: number, toIndex: number): void {
    if (fromIndex === toIndex) return

    const tabs = [...this._tabs.value]
    const [movedTab] = tabs.splice(fromIndex, 1)
    tabs.splice(toIndex, 0, movedTab)
    
    this._tabs.value = tabs
    this.emitTabChange('move', movedTab)
  }

  /**
   * 获取标签页右键菜单选项
   */
  getContextMenuOptions(tabId: string): Array<{
    label: string
    action: string
    disabled?: boolean
    icon?: string
  }> {
    const tab = this._tabs.value.find(t => t.id === tabId)
    if (!tab) return []

    return [
      {
        label: '刷新',
        action: 'refresh',
        icon: 'refresh'
      },
      {
        label: '关闭',
        action: 'close',
        disabled: !tab.closable,
        icon: 'close'
      },
      {
        label: '关闭其他',
        action: 'close-others',
        disabled: this._tabs.value.filter(t => t.closable && t.id !== tabId).length === 0,
        icon: 'close-others'
      },
      {
        label: '关闭所有',
        action: 'close-all',
        disabled: this._tabs.value.filter(t => t.closable).length === 0,
        icon: 'close-all'
      }
    ]
  }

  /**
   * 执行右键菜单操作
   */
  executeContextMenuAction(tabId: string, action: string): void {
    switch (action) {
      case 'refresh':
        this.refreshTab(tabId)
        break
      case 'close':
        this.removeTab(tabId)
        break
      case 'close-others':
        this.closeOtherTabs(tabId)
        break
      case 'close-all':
        this.closeAllTabs()
        break
    }
  }

  private shouldShowAsTab(route: RouteLocationNormalized): boolean {
    // 检查路由元信息中的 tab 配置
    if (route.meta.tab === false) return false
    if (route.meta.tab === true) return true
    
    // 默认显示为标签页（除了特殊路由）
    const excludePaths = ['/login', '/404', '/403', '/500']
    return !excludePaths.includes(route.path)
  }

  private getTabTitle(route: RouteLocationNormalized): string {
    return route.meta.title || route.name || route.path
  }

  private findTabByPath(path: string): TabItem | null {
    return this._tabs.value.find(tab => tab.path === path) || null
  }

  private generateTabId(): string {
    return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private removeOldestTab(): void {
    const closableTabs = this._tabs.value.filter(tab => tab.closable)
    if (closableTabs.length > 0) {
      this.removeTab(closableTabs[0].id)
    }
  }

  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') return
    
    try {
      const data = {
        tabs: this._tabs.value,
        activeTabId: this._activeTabId.value
      }
      localStorage.setItem('ldesign-router-tabs', JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save tabs to localStorage:', error)
    }
  }

  private restoreFromStorage(): void {
    if (typeof localStorage === 'undefined') return
    
    try {
      const data = localStorage.getItem('ldesign-router-tabs')
      if (data) {
        const parsed = JSON.parse(data)
        this._tabs.value = parsed.tabs || []
        this._activeTabId.value = parsed.activeTabId || ''
      }
    } catch (error) {
      console.warn('Failed to restore tabs from localStorage:', error)
    }
  }

  private emitTabChange(type: 'add' | 'remove' | 'update' | 'activate' | 'refresh' | 'move', tab: TabItem): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tab-change', {
        detail: { type, tab, tabs: this._tabs.value }
      }))
    }
  }

  /**
   * 获取响应式数据
   */
  useTabs() {
    return {
      tabs: computed(() => this._tabs.value),
      activeTabId: computed(() => this._activeTabId.value),
      activeTab: computed(() => this.activeTab),
      config: computed(() => this._config),
      dragState: computed(() => this._dragState)
    }
  }

  /**
   * 销毁标签页管理器
   */
  destroy(): void {
    if (this._config.persistent) {
      this.saveToStorage()
    }
  }
}