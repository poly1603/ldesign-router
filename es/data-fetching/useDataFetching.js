/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { inject, ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from '../composables/index.js';
import { DATA_FETCHING_KEY } from './DataFetchingManager.js';

function useDataFetching(key, fetcher, options = {}) {
  const route = useRoute();
  const manager = inject(DATA_FETCHING_KEY);
  if (!manager) {
    throw new Error("DataFetchingManager not found. Did you forget to install the plugin?");
  }
  const data = ref(options.defaultValue ?? null);
  const loading = ref(false);
  const error = ref(null);
  const fromCache = ref(false);
  const previousData = ref(null);
  const isReady = computed(() => !loading.value && !error.value && data.value !== null);
  const hasError = computed(() => error.value !== null);
  const isEmpty = computed(() => {
    if (data.value === null || data.value === void 0) {
      return true;
    }
    if (Array.isArray(data.value)) {
      return data.value.length === 0;
    }
    if (typeof data.value === "object") {
      return Object.keys(data.value).length === 0;
    }
    return false;
  });
  const registerConfig = () => {
    const config = {
      fetcher: async (route2, params) => {
        const result = await fetcher(route2, params);
        return options.transform ? options.transform(result) : result;
      },
      cacheKey: options.cacheKey,
      cacheDuration: options.cacheDuration,
      fetchOnClient: options.fetchOnClient,
      fetchOnServer: options.fetchOnServer,
      retryCount: options.retryCount,
      retryDelay: options.retryDelay,
      timeout: options.timeout,
      parallel: options.parallel,
      dependencies: options.dependencies,
      onError: (err, route2) => {
        error.value = err;
        if (options.onError) {
          options.onError(err, route2);
        }
      },
      onSuccess: (result, route2) => {
        if (options.keepPreviousData && data.value !== null) {
          previousData.value = data.value;
        }
        data.value = result;
        error.value = null;
        if (options.onSuccess) {
          options.onSuccess(result, route2);
        }
      }
    };
    manager.register(key, config);
  };
  const fetchData = async (customRoute) => {
    const targetRoute = route;
    loading.value = true;
    error.value = null;
    try {
      const result = await manager.fetch(key, targetRoute, options.params);
      const state = manager.getState(key);
      if (state) {
        fromCache.value = state.fromCache;
      }
      if (options.transform) {
        data.value = options.transform(result);
      } else {
        data.value = result;
      }
    } catch (err) {
      error.value = err;
      if (options.keepPreviousData && previousData.value !== null) {
        data.value = previousData.value;
      }
    } finally {
      loading.value = false;
    }
  };
  const refresh = async () => {
    await manager.refresh(key, route, options.params);
    await fetchData();
  };
  const clearCache = () => {
    manager.clearCache(key);
  };
  const prefetch = async (customRoute) => {
    const targetRoute = customRoute || route;
    await manager.prefetch(key, targetRoute, options.params);
  };
  const getState = () => {
    return manager.getState(key);
  };
  const watchers = [];
  const setupWatchers = () => {
    if (options.watchRoute !== false) {
      const routeWatcher = watch(() => route.path, () => {
        fetchData();
      });
      watchers.push(routeWatcher);
    }
    if (options.watchQuery) {
      const queryWatcher = watch(() => route.query, () => {
        fetchData();
      }, {
        deep: true
      });
      watchers.push(queryWatcher);
    }
    if (options.watchParams) {
      const paramsWatcher = watch(() => route.params, () => {
        fetchData();
      }, {
        deep: true
      });
      watchers.push(paramsWatcher);
    }
    if (options.params) {
      const customParamsWatcher = watch(() => options.params, () => {
        fetchData();
      }, {
        deep: true
      });
      watchers.push(customParamsWatcher);
    }
  };
  onMounted(() => {
    registerConfig();
    if (options.immediate !== false) {
      fetchData();
    }
    setupWatchers();
  });
  onUnmounted(() => {
    watchers.forEach((stop) => stop());
  });
  return {
    data,
    loading,
    error,
    fromCache,
    refresh,
    clearCache,
    prefetch,
    getState,
    isReady,
    hasError,
    isEmpty
  };
}
function useMultipleDataFetching(configs) {
  const results = {};
  Object.entries(configs).forEach(([key, config]) => {
    results[key] = useDataFetching(key, config.fetcher, config.options || {});
  });
  return results;
}
function useLazyDataFetching(key, fetcher, options = {}) {
  const result = useDataFetching(key, fetcher, {
    ...options,
    immediate: false
  });
  const execute = async () => {
    await result.refresh();
  };
  return {
    ...result,
    execute
  };
}
function usePaginatedDataFetching(key, fetcher, options = {}) {
  const page = ref(options.initialPage || 1);
  const pageSize = ref(options.pageSize || 20);
  const total = ref(0);
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value));
  const hasNextPage = computed(() => page.value < totalPages.value);
  const hasPreviousPage = computed(() => page.value > 1);
  const paginatedFetcher = async (route, params) => {
    const result2 = await fetcher(route, {
      ...params,
      page: page.value,
      pageSize: pageSize.value
    });
    total.value = result2.total;
    return result2.data;
  };
  const result = useDataFetching(key, paginatedFetcher, options);
  const nextPage = async () => {
    if (hasNextPage.value) {
      page.value++;
      await result.refresh();
    }
  };
  const previousPage = async () => {
    if (hasPreviousPage.value) {
      page.value--;
      await result.refresh();
    }
  };
  const goToPage = async (targetPage) => {
    if (targetPage >= 1 && targetPage <= totalPages.value) {
      page.value = targetPage;
      await result.refresh();
    }
  };
  const setPageSize = async (size) => {
    pageSize.value = size;
    page.value = 1;
    await result.refresh();
  };
  return {
    ...result,
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    goToPage,
    setPageSize
  };
}
function useInfiniteDataFetching(key, fetcher, options = {}) {
  const items = ref([]);
  const hasMore = ref(true);
  const loadingMore = ref(false);
  const nextCursor = ref();
  const infiniteFetcher = async (route, params) => {
    const result2 = await fetcher(route, {
      ...params,
      cursor: nextCursor.value
    });
    hasMore.value = result2.hasMore;
    nextCursor.value = result2.nextCursor;
    if (options.reverse) {
      items.value = [...result2.data, ...items.value];
    } else {
      items.value = [...items.value, ...result2.data];
    }
    return items.value;
  };
  const result = useDataFetching(key, infiniteFetcher, {
    ...options,
    defaultValue: []
  });
  const loadMore = async () => {
    if (!hasMore.value || loadingMore.value) {
      return;
    }
    loadingMore.value = true;
    try {
      await result.refresh();
    } finally {
      loadingMore.value = false;
    }
  };
  const reset = async () => {
    items.value = [];
    hasMore.value = true;
    nextCursor.value = void 0;
    await result.refresh();
  };
  return {
    ...result,
    loadMore,
    hasMore,
    loadingMore,
    reset,
    items: computed(() => items.value)
  };
}

export { useDataFetching, useInfiniteDataFetching, useLazyDataFetching, useMultipleDataFetching, usePaginatedDataFetching };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=useDataFetching.js.map
