/**
 * @ldesign/router-core - Parallel Guards Execution
 * 并行守卫执行优化
 * 
 * @description
 * 实现智能的守卫并行执行策略:
 * - 自动分析守卫依赖关系
 * - 独立守卫并行执行
 * - 依赖守卫串行执行
 * - 预期性能提升: 40-60%
 * 
 * @module features/parallel-guards
 */

import type { RouteLocationNormalized } from '../types'
import type { Guard, GuardResult, GuardReturn } from './guards'

/**
 * 守卫依赖信息
 */
export interface GuardDependency {
  /** 守卫 ID */
  id: string

  /** 守卫函数 */
  guard: Guard

  /** 依赖的守卫 ID 列表 */
  dependencies: string[]

  /** 守卫名称 */
  name?: string
}

/**
 * 并行执行结果
 */
export interface ParallelExecutionResult {
  /** 是否允许通过 */
  allowed: boolean

  /** 重定向位置 */
  redirect?: string | RouteLocationNormalized

  /** 错误 */
  error?: Error

  /** 执行时间 (ms) */
  duration: number

  /** 并行执行的守卫数量 */
  parallelCount: number

  /** 串行执行的守卫数量 */
  serialCount: number
}

/**
 * 守卫执行上下文
 */
interface ExecutionContext {
  to: RouteLocationNormalized
  from: RouteLocationNormalized
  results: Map<string, GuardReturn>
  aborted: boolean
}

/**
 * 并行守卫执行器
 */
export class ParallelGuardExecutor {
  /**
   * 分析守卫依赖关系
   * 
   * 简单启发式规则:
   * - 如果守卫访问或修改共享状态，则有依赖
   * - 如果守卫是身份验证相关，优先级最高
   * - 默认假设守卫之间是独立的
   */
  analyzeGuardDependencies(guards: Guard[], names?: string[]): GuardDependency[] {
    const dependencies: GuardDependency[] = []

    for (let i = 0; i < guards.length; i++) {
      const guard = guards[i]
      const id = `guard_${i}`
      const name = names?.[i]

      // 启发式分析:
      // 1. 身份验证守卫通常需要最先执行
      // 2. 权限检查守卫依赖于身份验证
      // 3. 其他守卫通常是独立的
      const deps: string[] = []

      if (name) {
        // 如果是权限检查，依赖于身份验证
        if (name.includes('permission') || name.includes('auth') && !name.includes('check')) {
          // 查找身份验证守卫
          const authIndex = names.findIndex(n =>
            n.includes('authenticate') || n.includes('checkAuth')
          )
          if (authIndex >= 0 && authIndex < i) {
            deps.push(`guard_${authIndex}`)
          }
        }
      }

      dependencies.push({
        id,
        guard,
        dependencies: deps,
        name,
      })
    }

    return dependencies
  }

  /**
   * 执行守卫（带并行优化）
   */
  async executeGuards(
    guards: Guard[],
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    options?: {
      names?: string[]
      timeout?: number
      stopOnError?: boolean
    }
  ): Promise<ParallelExecutionResult> {
    const startTime = Date.now()
    const context: ExecutionContext = {
      to,
      from,
      results: new Map(),
      aborted: false,
    }

    // 分析依赖关系
    const dependencies = this.analyzeGuardDependencies(guards, options?.names)

    // 分组: 独立守卫 vs 有依赖的守卫
    const independent = dependencies.filter(d => d.dependencies.length === 0)
    const dependent = dependencies.filter(d => d.dependencies.length > 0)

    let parallelCount = 0
    let serialCount = 0

    try {
      // 1. 并行执行所有独立守卫
      if (independent.length > 0) {
        parallelCount = independent.length
        const results = await Promise.all(
          independent.map(dep =>
            this.executeGuardWithTimeout(
              dep.guard,
              to,
              from,
              options?.timeout || 10000,
              dep.name || dep.id
            )
          )
        )

        // 检查结果
        for (let i = 0; i < independent.length; i++) {
          const result = results[i]
          context.results.set(independent[i].id, result)

          // 如果有守卫返回 false 或重定向，立即停止
          const processed = this.processGuardResult(result)
          if (!processed.allowed) {
            return {
              ...processed,
              duration: Date.now() - startTime,
              parallelCount,
              serialCount,
            }
          }
        }
      }

      // 2. 串行执行有依赖的守卫
      if (dependent.length > 0) {
        serialCount = dependent.length

        // 拓扑排序确保执行顺序
        const sorted = this.topologicalSort(dependent)

        for (const dep of sorted) {
          const result = await this.executeGuardWithTimeout(
            dep.guard,
            to,
            from,
            options?.timeout || 10000,
            dep.name || dep.id
          )

          context.results.set(dep.id, result)

          const processed = this.processGuardResult(result)
          if (!processed.allowed) {
            return {
              ...processed,
              duration: Date.now() - startTime,
              parallelCount,
              serialCount,
            }
          }
        }
      }

      return {
        allowed: true,
        duration: Date.now() - startTime,
        parallelCount,
        serialCount,
      }
    } catch (error) {
      return {
        allowed: false,
        error: error as Error,
        duration: Date.now() - startTime,
        parallelCount,
        serialCount,
      }
    }
  }

  /**
   * 执行单个守卫（带超时）
   */
  private async executeGuardWithTimeout(
    guard: Guard,
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    timeout: number,
    guardName: string
  ): Promise<GuardReturn> {
    const result = guard(to, from)

    // 如果不是 Promise，直接返回
    if (!(result instanceof Promise)) {
      return result
    }

    // 添加超时控制
    return Promise.race([
      result,
      new Promise<GuardReturn>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Guard "${guardName}" timeout after ${timeout}ms`))
        }, timeout)
      }),
    ])
  }

  /**
   * 处理守卫返回值
   */
  private processGuardResult(result: GuardReturn): GuardResult {
    // undefined 或 true - 允许通过
    if (result === undefined || result === true) {
      return { allowed: true, duration: 0 }
    }

    // false - 取消导航
    if (result === false) {
      return { allowed: false, duration: 0 }
    }

    // string - 重定向到路径
    if (typeof result === 'string') {
      return {
        allowed: false,
        redirect: result,
        duration: 0,
      }
    }

    // Error - 错误
    if (result instanceof Error) {
      return {
        allowed: false,
        error: result as any,
        duration: 0,
      }
    }

    // object - 重定向到位置
    if (typeof result === 'object') {
      return {
        allowed: false,
        redirect: result as RouteLocationNormalized,
        duration: 0,
      }
    }

    return { allowed: true, duration: 0 }
  }

  /**
   * 拓扑排序（确保依赖顺序）
   */
  private topologicalSort(dependencies: GuardDependency[]): GuardDependency[] {
    const sorted: GuardDependency[] = []
    const visited = new Set<string>()
    const visiting = new Set<string>()

    const visit = (dep: GuardDependency) => {
      if (visited.has(dep.id)) return
      if (visiting.has(dep.id)) {
        throw new Error(`Circular dependency detected in guard: ${dep.name || dep.id}`)
      }

      visiting.add(dep.id)

      // 访问所有依赖
      for (const depId of dep.dependencies) {
        const depGuard = dependencies.find(d => d.id === depId)
        if (depGuard) {
          visit(depGuard)
        }
      }

      visiting.delete(dep.id)
      visited.add(dep.id)
      sorted.push(dep)
    }

    for (const dep of dependencies) {
      visit(dep)
    }

    return sorted
  }
}

/**
 * 创建并行守卫执行器
 */
export function createParallelGuardExecutor(): ParallelGuardExecutor {
  return new ParallelGuardExecutor()
}

/**
 * 守卫批量执行器（高级用法）
 */
export class BatchGuardExecutor {
  private executor = new ParallelGuardExecutor()

  /**
   * 批量执行多组守卫
   */
  async executeBatch(
    batches: Array<{
      guards: Guard[]
      to: RouteLocationNormalized
      from: RouteLocationNormalized
      names?: string[]
    }>,
    options?: {
      parallel?: boolean
      timeout?: number
    }
  ): Promise<ParallelExecutionResult[]> {
    if (options?.parallel) {
      // 并行执行所有批次
      return Promise.all(
        batches.map(batch =>
          this.executor.executeGuards(
            batch.guards,
            batch.to,
            batch.from,
            { names: batch.names, timeout: options?.timeout }
          )
        )
      )
    } else {
      // 串行执行所有批次
      const results: ParallelExecutionResult[] = []
      for (const batch of batches) {
        const result = await this.executor.executeGuards(
          batch.guards,
          batch.to,
          batch.from,
          { names: batch.names, timeout: options.timeout }
        )
        results.push(result)

        // 如果某批次失败，停止执行
        if (!result.allowed) {
          break
        }
      }
      return results
    }
  }
}

/**
 * 创建批量守卫执行器
 */
export function createBatchGuardExecutor(): BatchGuardExecutor {
  return new BatchGuardExecutor()
}