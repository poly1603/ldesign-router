<script lang="ts">
  /**
   * RouterView 组件 - 渲染当前路由匹配的组件
   */
  import { getRouter } from '../stores'
  
  const router = getRouter()
  const currentRoute = router.currentRoute

  $: component = $currentRoute.matched[0]?.component
</script>

{#if component}
  <svelte:component this={component} />
{:else}
  <slot />
{/if}


