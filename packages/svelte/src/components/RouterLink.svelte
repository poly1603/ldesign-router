<script lang="ts">
  /**
   * RouterLink 组件 - 路由导航链接
   */
  import type { RouteLocationRaw } from '@ldesign/router-core'
  import { getRouter } from '../stores'

  export let to: RouteLocationRaw | string
  export let replace: boolean = false
  export let activeClass: string = 'router-link-active'
  export let exactActiveClass: string = 'router-link-exact-active'

  const router = getRouter()
  const currentRoute = router.currentRoute

  $: href = typeof to === 'string' ? to : to.path || '/'
  $: isActive = $currentRoute.path.startsWith(href)
  $: isExactActive = $currentRoute.path === href
  $: classes = [
    isActive ? activeClass : '',
    isExactActive ? exactActiveClass : '',
  ].filter(Boolean).join(' ')

  function handleClick(event: MouseEvent) {
    // 如果是修饰键点击，让浏览器处理
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
      return
    }

    // 阻止默认行为
    event.preventDefault()

    // 执行导航
    if (replace) {
      router.replace(to)
    } else {
      router.push(to)
    }
  }
</script>

<a {href} class={classes} on:click={handleClick}>
  <slot />
</a>

<style>
  a {
    text-decoration: none;
    color: inherit;
  }

  :global(.router-link-active) {
    /* 默认活跃样式可以被覆盖 */
  }

  :global(.router-link-exact-active) {
    /* 默认精确活跃样式可以被覆盖 */
  }
</style>


