/**
 * Trie 树序列化器
 *
 * 将 Trie 树序列化为紧凑格式，支持快速反序列化恢复。
 * 可用于 SSR 预渲染、缓存优化等场景。
 *
 * @module router/trie-serializer
 */

import { RouteTrie, RouteNode, MatchResult } from './route-trie'

/**
 * 序列化后的节点格式
 */
interface SerializedNode {
  /** 路径片段 */
  s: string
  /** 是否动态 (d: dynamic) */
  d?: boolean
  /** 参数名 (p: param) */
  p?: string
  /** 处理器索引 (h: handler) */
  h?: number
  /** 元数据索引 (m: meta) */
  m?: number
  /** 路由名称 (n: name) */
  n?: string
  /** 子节点 (c: children) */
  c?: SerializedNode[]
  /** 通配符子节点 (w: wildcard) */
  w?: SerializedNode
}

/**
 * 序列化数据格式
 */
export interface SerializedTrie<THandler = unknown, TMeta = Record<string, unknown>> {
  /** 版本号 */
  version: number
  /** 根节点 */
  root: SerializedNode
  /** 处理器列表 */
  handlers: THandler[]
  /** 元数据列表 */
  metas: TMeta[]
  /** 路由数量 */
  routeCount: number
  /** 序列化时间戳 */
  timestamp: number
  /** 校验和 */
  checksum?: string
}

/**
 * 序列化选项
 */
export interface SerializeOptions {
  /** 是否计算校验和 */
  calculateChecksum?: boolean
  /** 是否压缩（移除空值） */
  compress?: boolean
  /** 处理器序列化函数 */
  serializeHandler?: (handler: unknown) => unknown
  /** 元数据序列化函数 */
  serializeMeta?: (meta: unknown) => unknown
}

/**
 * 反序列化选项
 */
export interface DeserializeOptions {
  /** 是否验证校验和 */
  validateChecksum?: boolean
  /** 处理器反序列化函数 */
  deserializeHandler?: (data: unknown) => unknown
  /** 元数据反序列化函数 */
  deserializeMeta?: (data: unknown) => unknown
}

/**
 * 序列化统计
 */
export interface SerializationStats {
  /** 节点数 */
  nodeCount: number
  /** 原始大小（字节） */
  originalSize: number
  /** 压缩后大小（字节） */
  compressedSize: number
  /** 压缩率 */
  compressionRatio: number
  /** 序列化耗时（毫秒） */
  serializationTime: number
}

/**
 * Trie 树序列化器
 *
 * @example
 * ```typescript
 * const serializer = new TrieSerializer()
 *
 * // 序列化
 * const data = serializer.serialize(trie)
 * const json = serializer.toJSON(trie)
 *
 * // 反序列化
 * const newTrie = serializer.deserialize(data)
 * const fromJson = serializer.fromJSON(json)
 *
 * // 快速初始化
 * const cachedJson = localStorage.getItem('routes')
 * const trie = cachedJson
 *   ? serializer.fromJSON(cachedJson)
 *   : createAndCacheTrie()
 * ```
 */
export class TrieSerializer<THandler = unknown, TMeta = Record<string, unknown>> {
  private options: SerializeOptions

  constructor(options: SerializeOptions = {}) {
    this.options = {
      calculateChecksum: options.calculateChecksum ?? false,
      compress: options.compress ?? true,
      serializeHandler: options.serializeHandler,
      serializeMeta: options.serializeMeta,
    }
  }

  /**
   * 序列化 Trie 树
   *
   * @param trie - 要序列化的 Trie 树
   * @returns 序列化数据
   */
  serialize(trie: RouteTrie<THandler, TMeta>): SerializedTrie<THandler, TMeta> {
    const startTime = performance.now()
    const handlers: THandler[] = []
    const metas: TMeta[] = []
    const handlerMap = new Map<THandler, number>()
    const metaMap = new Map<TMeta, number>()

    // 遍历并序列化
    const root = this.serializeNode(
      (trie as unknown as { root: RouteNode<THandler, TMeta> }).root,
      handlers,
      metas,
      handlerMap,
      metaMap
    )

    const serialized: SerializedTrie<THandler, TMeta> = {
      version: 1,
      root,
      handlers: handlers.map(h =>
        this.options.serializeHandler ? this.options.serializeHandler(h) as THandler : h
      ),
      metas: metas.map(m =>
        this.options.serializeMeta ? this.options.serializeMeta(m) as TMeta : m
      ),
      routeCount: trie.getRouteCount(),
      timestamp: Date.now(),
    }

    // 计算校验和
    if (this.options.calculateChecksum) {
      serialized.checksum = this.calculateChecksum(serialized)
    }

    return serialized
  }

  /**
   * 反序列化为 Trie 树
   *
   * @param data - 序列化数据
   * @param options - 反序列化选项
   * @returns Trie 树实例
   */
  deserialize(
    data: SerializedTrie<THandler, TMeta>,
    options: DeserializeOptions = {}
  ): RouteTrie<THandler, TMeta> {
    // 验证版本
    if (data.version !== 1) {
      throw new Error(`Unsupported serialization version: ${data.version}`)
    }

    // 验证校验和
    if (options.validateChecksum && data.checksum) {
      const { checksum: _, ...dataWithoutChecksum } = data
      const computed = this.calculateChecksum(dataWithoutChecksum)
      if (computed !== data.checksum) {
        throw new Error('Checksum validation failed')
      }
    }

    // 反序列化处理器和元数据
    const handlers = data.handlers.map(h =>
      options.deserializeHandler ? options.deserializeHandler(h) as THandler : h
    )
    const metas = data.metas.map(m =>
      options.deserializeMeta ? options.deserializeMeta(m) as TMeta : m
    )

    // 创建新的 Trie 并恢复节点
    const trie = new RouteTrie<THandler, TMeta>()
    const routes = this.collectRoutes(data.root, [], handlers, metas)

    for (const route of routes) {
      trie.addRoute(route.path, route.handler, route.meta, route.name)
    }

    return trie
  }

  /**
   * 序列化为 JSON 字符串
   *
   * @param trie - Trie 树
   * @returns JSON 字符串
   */
  toJSON(trie: RouteTrie<THandler, TMeta>): string {
    const data = this.serialize(trie)
    return JSON.stringify(data)
  }

  /**
   * 从 JSON 字符串反序列化
   *
   * @param json - JSON 字符串
   * @param options - 反序列化选项
   * @returns Trie 树实例
   */
  fromJSON(json: string, options?: DeserializeOptions): RouteTrie<THandler, TMeta> {
    const data = JSON.parse(json) as SerializedTrie<THandler, TMeta>
    return this.deserialize(data, options)
  }

  /**
   * 序列化为 Base64 字符串（更紧凑）
   *
   * @param trie - Trie 树
   * @returns Base64 编码的字符串
   */
  toBase64(trie: RouteTrie<THandler, TMeta>): string {
    const json = this.toJSON(trie)
    if (typeof btoa === 'function') {
      return btoa(encodeURIComponent(json))
    }
    // Node.js 环境
    return Buffer.from(json).toString('base64')
  }

  /**
   * 从 Base64 字符串反序列化
   *
   * @param base64 - Base64 编码的字符串
   * @param options - 反序列化选项
   * @returns Trie 树实例
   */
  fromBase64(base64: string, options?: DeserializeOptions): RouteTrie<THandler, TMeta> {
    let json: string
    if (typeof atob === 'function') {
      json = decodeURIComponent(atob(base64))
    } else {
      // Node.js 环境
      json = Buffer.from(base64, 'base64').toString()
    }
    return this.fromJSON(json, options)
  }

  /**
   * 获取序列化统计信息
   *
   * @param trie - Trie 树
   * @returns 统计信息
   */
  getStats(trie: RouteTrie<THandler, TMeta>): SerializationStats {
    const startTime = performance.now()
    const data = this.serialize(trie)
    const serializationTime = performance.now() - startTime

    const json = JSON.stringify(data)
    const compressedJson = this.options.compress
      ? JSON.stringify(this.removeNulls(data))
      : json

    return {
      nodeCount: this.countNodes(data.root),
      originalSize: json.length,
      compressedSize: compressedJson.length,
      compressionRatio: 1 - compressedJson.length / json.length,
      serializationTime,
    }
  }

  /**
   * 比较两个 Trie 树是否相等
   *
   * @param trie1 - 第一个 Trie 树
   * @param trie2 - 第二个 Trie 树
   * @returns 是否相等
   */
  isEqual(
    trie1: RouteTrie<THandler, TMeta>,
    trie2: RouteTrie<THandler, TMeta>
  ): boolean {
    const data1 = this.serialize(trie1)
    const data2 = this.serialize(trie2)

    // 比较路由数量
    if (data1.routeCount !== data2.routeCount) {
      return false
    }

    // 比较校验和
    const checksum1 = this.calculateChecksum(data1)
    const checksum2 = this.calculateChecksum(data2)

    return checksum1 === checksum2
  }

  // ==================== 私有方法 ====================

  /**
   * 序列化单个节点
   */
  private serializeNode(
    node: RouteNode<THandler, TMeta>,
    handlers: THandler[],
    metas: TMeta[],
    handlerMap: Map<THandler, number>,
    metaMap: Map<TMeta, number>
  ): SerializedNode {
    const serialized: SerializedNode = {
      s: node.segment,
    }

    // 仅在非默认值时添加属性（压缩）
    if (node.isDynamic) {
      serialized.d = true
    }

    if (node.paramName) {
      serialized.p = node.paramName
    }

    if (node.handler !== undefined) {
      let handlerIndex = handlerMap.get(node.handler)
      if (handlerIndex === undefined) {
        handlerIndex = handlers.length
        handlers.push(node.handler)
        handlerMap.set(node.handler, handlerIndex)
      }
      serialized.h = handlerIndex
    }

    if (node.meta !== undefined) {
      let metaIndex = metaMap.get(node.meta)
      if (metaIndex === undefined) {
        metaIndex = metas.length
        metas.push(node.meta)
        metaMap.set(node.meta, metaIndex)
      }
      serialized.m = metaIndex
    }

    if (node.name) {
      serialized.n = node.name
    }

    // 序列化子节点
    if (node.children.size > 0) {
      serialized.c = []
      for (const child of node.children.values()) {
        serialized.c.push(
          this.serializeNode(child, handlers, metas, handlerMap, metaMap)
        )
      }
    }

    // 序列化通配符子节点
    if (node.wildcardChild) {
      serialized.w = this.serializeNode(
        node.wildcardChild,
        handlers,
        metas,
        handlerMap,
        metaMap
      )
    }

    return serialized
  }

  /**
   * 从序列化节点收集路由
   */
  private collectRoutes(
    node: SerializedNode,
    pathSegments: string[],
    handlers: THandler[],
    metas: TMeta[]
  ): Array<{ path: string; handler: THandler; meta?: TMeta; name?: string }> {
    const routes: Array<{ path: string; handler: THandler; meta?: TMeta; name?: string }> = []

    // 添加当前节点的路由
    if (node.h !== undefined) {
      const segment = node.d && node.p ? `:${node.p}` : node.s
      const currentPath = pathSegments.length > 0 || segment
        ? '/' + [...pathSegments, segment].filter(Boolean).join('/')
        : '/'

      routes.push({
        path: currentPath,
        handler: handlers[node.h],
        meta: node.m !== undefined ? metas[node.m] : undefined,
        name: node.n,
      })
    }

    // 收集子节点路由
    if (node.c) {
      for (const child of node.c) {
        routes.push(
          ...this.collectRoutes(
            child,
            [...pathSegments, child.s],
            handlers,
            metas
          )
        )
      }
    }

    // 收集通配符子节点路由
    if (node.w) {
      const wildcardSegment = node.w.p ? `:${node.w.p}` : '*'
      routes.push(
        ...this.collectRoutes(
          node.w,
          [...pathSegments, wildcardSegment],
          handlers,
          metas
        )
      )
    }

    return routes
  }

  /**
   * 计算校验和
   */
  private calculateChecksum(data: Omit<SerializedTrie<THandler, TMeta>, 'checksum'>): string {
    const str = JSON.stringify({
      root: data.root,
      routeCount: data.routeCount,
    })

    // 简单的哈希算法
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }

    return Math.abs(hash).toString(36)
  }

  /**
   * 计算节点数
   */
  private countNodes(node: SerializedNode): number {
    let count = 1

    if (node.c) {
      for (const child of node.c) {
        count += this.countNodes(child)
      }
    }

    if (node.w) {
      count += this.countNodes(node.w)
    }

    return count
  }

  /**
   * 移除空值（压缩）
   */
  private removeNulls(obj: unknown): unknown {
    if (Array.isArray(obj)) {
      return obj.map(item => this.removeNulls(item))
    }

    if (obj !== null && typeof obj === 'object') {
      const result: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(obj)) {
        if (value !== null && value !== undefined) {
          result[key] = this.removeNulls(value)
        }
      }
      return result
    }

    return obj
  }
}

/**
 * 创建 Trie 序列化器
 *
 * @param options - 序列化选项
 * @returns 序列化器实例
 *
 * @example
 * ```typescript
 * const serializer = createTrieSerializer({
 *   calculateChecksum: true,
 *   compress: true,
 * })
 *
 * // 序列化并缓存
 * const json = serializer.toJSON(trie)
 * localStorage.setItem('routes', json)
 *
 * // 从缓存恢复
 * const cached = localStorage.getItem('routes')
 * if (cached) {
 *   const trie = serializer.fromJSON(cached)
 * }
 * ```
 */
export function createTrieSerializer<THandler = unknown, TMeta = Record<string, unknown>>(
  options?: SerializeOptions
): TrieSerializer<THandler, TMeta> {
  return new TrieSerializer<THandler, TMeta>(options)
}
