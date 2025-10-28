<script lang="ts">
  /**
   * Router 组件 - 提供路由器上下文
   */
  import { setContext } from 'svelte'
  import type { Router } from '../router'
  import { ROUTER_KEY } from '../router'

  export let router: Router

  setContext(ROUTER_KEY, router)
</script>

<slot />


