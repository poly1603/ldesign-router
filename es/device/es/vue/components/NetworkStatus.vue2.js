/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { defineComponent, ref, computed, onMounted, onUnmounted, watch, createElementBlock, openBlock, normalizeClass, unref, createCommentVNode, createElementVNode, Fragment, toDisplayString, normalizeStyle } from 'vue';
import { useNetwork } from '../composables/useDevice.js';

const _hoisted_1 = {
  key: 0,
  class: "network-status__loading"
};
const _hoisted_2 = {
  key: 0
};
const _hoisted_3 = {
  class: "network-status__error"
};
const _hoisted_4 = {
  key: 0
};
const _hoisted_5 = {
  class: "network-status__content"
};
const _hoisted_6 = ["title"];
const _hoisted_7 = {
  class: "network-status__text"
};
const _hoisted_8 = {
  class: "network-status__detailed"
};
const _hoisted_9 = {
  class: "network-status__main"
};
const _hoisted_10 = {
  class: "network-status__icon"
};
const _hoisted_11 = {
  class: "network-status__info"
};
const _hoisted_12 = {
  class: "network-status__status"
};
const _hoisted_13 = {
  class: "network-status__type"
};
const _hoisted_14 = {
  key: 0,
  class: "network-status__details"
};
const _hoisted_15 = {
  key: 0,
  class: "network-status__detail"
};
const _hoisted_16 = {
  key: 1,
  class: "network-status__detail"
};
const _hoisted_17 = {
  key: 2,
  class: "network-status__detail"
};
const _hoisted_18 = {
  class: "network-status__progress"
};
const _hoisted_19 = {
  class: "network-status__progress-header"
};
const _hoisted_20 = {
  key: 0
};
const _hoisted_21 = {
  class: "network-status__progress-bar"
};
const _hoisted_22 = ["disabled"];
var script = /* @__PURE__ */ defineComponent({
  __name: "NetworkStatus",
  props: {
    displayMode: {
      type: String,
      required: false,
      default: "detailed"
    },
    showDetails: {
      type: Boolean,
      required: false,
      default: true
    },
    showRefresh: {
      type: Boolean,
      required: false,
      default: false
    },
    autoRefresh: {
      type: Number,
      required: false,
      default: 0
    },
    refreshInterval: {
      type: Number,
      required: false,
      default: 3e4
    }
  },
  emits: ["update", "statusChange", "refresh", "error"],
  setup(__props, {
    emit: __emit
  }) {
    const props = __props;
    const emit = __emit;
    const {
      networkInfo,
      isLoaded,
      loadModule
    } = useNetwork();
    const isLoading = ref(true);
    const errorMessage = ref("");
    const lastStatus = ref();
    const hasError = computed(() => !!errorMessage.value);
    let autoRefreshTimer = null;
    function getStatusIcon(status) {
      const icons = {
        online: "\u{1F7E2}",
        offline: "\u{1F534}"
      };
      return icons[status] || "\u26AA";
    }
    function getStatusText(status) {
      const texts = {
        online: "\u5728\u7EBF",
        offline: "\u79BB\u7EBF"
      };
      return texts[status] || "\u672A\u77E5";
    }
    function getConnectionTypeText(type) {
      const texts = {
        wifi: "WiFi",
        cellular: "\u79FB\u52A8\u7F51\u7EDC",
        ethernet: "\u4EE5\u592A\u7F51",
        bluetooth: "\u84DD\u7259",
        wimax: "WiMAX",
        other: "\u5176\u4ED6",
        unknown: "\u672A\u77E5",
        none: "\u65E0\u8FDE\u63A5"
      };
      return texts[type] || "\u672A\u77E5";
    }
    function getSpeedPercentage(speed) {
      if (!speed) return 0;
      return Math.min(speed / 100 * 100, 100);
    }
    async function refresh() {
      try {
        isLoading.value = true;
        errorMessage.value = "";
        if (!isLoaded.value) {
          await loadModule();
        }
        emit("refresh");
      } catch (error) {
        const message = error instanceof Error ? error.message : "\u5237\u65B0\u5931\u8D25";
        errorMessage.value = message;
        emit("error", message);
      } finally {
        isLoading.value = false;
      }
    }
    function setupAutoRefresh() {
      const interval = props.autoRefresh || props.refreshInterval;
      if (interval > 0) {
        autoRefreshTimer = window.setInterval(() => {
          refresh();
        }, interval);
      }
    }
    function clearAutoRefresh() {
      if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
      }
    }
    onMounted(async () => {
      await refresh();
      setupAutoRefresh();
    });
    onUnmounted(() => {
      clearAutoRefresh();
    });
    watch(networkInfo, (newInfo) => {
      if (newInfo) {
        emit("update", newInfo);
        if (lastStatus.value !== newInfo.status) {
          lastStatus.value = newInfo.status;
          emit("statusChange", newInfo.status);
        }
      }
    }, {
      deep: true
    });
    watch(() => [props.autoRefresh, props.refreshInterval], () => {
      clearAutoRefresh();
      setupAutoRefresh();
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock(
        "div",
        {
          class: normalizeClass(["network-status", [`network-status--${_ctx.displayMode}`, `network-status--${unref(networkInfo)?.status || "unknown"}`, {
            "network-status--loading": isLoading.value,
            "network-status--error": hasError.value
          }]])
        },
        [createCommentVNode(" \u52A0\u8F7D\u72B6\u6001 "), isLoading.value ? (openBlock(), createElementBlock("div", _hoisted_1, [_cache[0] || (_cache[0] = createElementVNode(
          "div",
          {
            class: "network-status__spinner"
          },
          null,
          -1
          /* CACHED */
        )), _ctx.displayMode !== "icon" ? (openBlock(), createElementBlock("span", _hoisted_2, "\u68C0\u6D4B\u7F51\u7EDC\u72B6\u6001...")) : createCommentVNode("v-if", true)])) : hasError.value ? (openBlock(), createElementBlock(
          Fragment,
          {
            key: 1
          },
          [createCommentVNode(" \u9519\u8BEF\u72B6\u6001 "), createElementVNode("div", _hoisted_3, [_cache[1] || (_cache[1] = createElementVNode(
            "span",
            {
              class: "network-status__error-icon"
            },
            "\u26A0\uFE0F",
            -1
            /* CACHED */
          )), _ctx.displayMode !== "icon" ? (openBlock(), createElementBlock("span", _hoisted_4, "\u7F51\u7EDC\u68C0\u6D4B\u5931\u8D25")) : createCommentVNode("v-if", true)])],
          2112
          /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
        )) : unref(networkInfo) ? (openBlock(), createElementBlock(
          Fragment,
          {
            key: 2
          },
          [createCommentVNode(" \u7F51\u7EDC\u72B6\u6001\u5185\u5BB9 "), createElementVNode("div", _hoisted_5, [createCommentVNode(" \u56FE\u6807\u6A21\u5F0F "), _ctx.displayMode === "icon" ? (openBlock(), createElementBlock("span", {
            key: 0,
            class: normalizeClass(["network-status__icon", [`network-status__icon--${unref(networkInfo).status}`]]),
            title: getStatusText(unref(networkInfo).status)
          }, toDisplayString(getStatusIcon(unref(networkInfo).status)), 11, _hoisted_6)) : _ctx.displayMode === "text" ? (openBlock(), createElementBlock(
            Fragment,
            {
              key: 1
            },
            [createCommentVNode(" \u6587\u5B57\u6A21\u5F0F "), createElementVNode(
              "span",
              _hoisted_7,
              toDisplayString(getStatusText(unref(networkInfo).status)),
              1
              /* TEXT */
            )],
            64
            /* STABLE_FRAGMENT */
          )) : _ctx.displayMode === "detailed" ? (openBlock(), createElementBlock(
            Fragment,
            {
              key: 2
            },
            [createCommentVNode(" \u8BE6\u7EC6\u6A21\u5F0F "), createElementVNode("div", _hoisted_8, [createElementVNode("div", _hoisted_9, [createElementVNode(
              "span",
              _hoisted_10,
              toDisplayString(getStatusIcon(unref(networkInfo).status)),
              1
              /* TEXT */
            ), createElementVNode("div", _hoisted_11, [createElementVNode(
              "div",
              _hoisted_12,
              toDisplayString(getStatusText(unref(networkInfo).status)),
              1
              /* TEXT */
            ), createElementVNode(
              "div",
              _hoisted_13,
              toDisplayString(getConnectionTypeText(unref(networkInfo).type)),
              1
              /* TEXT */
            )])]), _ctx.showDetails && unref(networkInfo).status === "online" ? (openBlock(), createElementBlock("div", _hoisted_14, [unref(networkInfo).downlink ? (openBlock(), createElementBlock("div", _hoisted_15, [_cache[2] || (_cache[2] = createElementVNode(
              "label",
              null,
              "\u4E0B\u8F7D\u901F\u5EA6",
              -1
              /* CACHED */
            )), createElementVNode(
              "span",
              null,
              toDisplayString(unref(networkInfo).downlink.toFixed(1)) + " Mbps",
              1
              /* TEXT */
            )])) : createCommentVNode("v-if", true), unref(networkInfo).rtt ? (openBlock(), createElementBlock("div", _hoisted_16, [_cache[3] || (_cache[3] = createElementVNode(
              "label",
              null,
              "\u5EF6\u8FDF",
              -1
              /* CACHED */
            )), createElementVNode(
              "span",
              null,
              toDisplayString(unref(networkInfo).rtt) + " ms",
              1
              /* TEXT */
            )])) : createCommentVNode("v-if", true), unref(networkInfo).saveData !== void 0 ? (openBlock(), createElementBlock("div", _hoisted_17, [_cache[4] || (_cache[4] = createElementVNode(
              "label",
              null,
              "\u7701\u6D41\u6A21\u5F0F",
              -1
              /* CACHED */
            )), createElementVNode(
              "span",
              null,
              toDisplayString(unref(networkInfo).saveData ? "\u5F00\u542F" : "\u5173\u95ED"),
              1
              /* TEXT */
            )])) : createCommentVNode("v-if", true)])) : createCommentVNode("v-if", true)])],
            64
            /* STABLE_FRAGMENT */
          )) : _ctx.displayMode === "progress" ? (openBlock(), createElementBlock(
            Fragment,
            {
              key: 3
            },
            [createCommentVNode(" \u8FDB\u5EA6\u6761\u6A21\u5F0F "), createElementVNode("div", _hoisted_18, [createElementVNode("div", _hoisted_19, [createElementVNode(
              "span",
              null,
              toDisplayString(getStatusText(unref(networkInfo).status)),
              1
              /* TEXT */
            ), unref(networkInfo).downlink ? (openBlock(), createElementBlock(
              "span",
              _hoisted_20,
              toDisplayString(unref(networkInfo).downlink.toFixed(1)) + " Mbps",
              1
              /* TEXT */
            )) : createCommentVNode("v-if", true)]), createElementVNode("div", _hoisted_21, [createElementVNode(
              "div",
              {
                class: "network-status__progress-fill",
                style: normalizeStyle({
                  width: `${getSpeedPercentage(unref(networkInfo).downlink)}%`
                })
              },
              null,
              4
              /* STYLE */
            )])])],
            64
            /* STABLE_FRAGMENT */
          )) : createCommentVNode("v-if", true)])],
          2112
          /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
        )) : createCommentVNode("v-if", true), createCommentVNode(" \u5237\u65B0\u6309\u94AE "), _ctx.showRefresh && _ctx.displayMode !== "icon" ? (openBlock(), createElementBlock("button", {
          key: 3,
          class: "network-status__refresh",
          disabled: isLoading.value,
          onClick: refresh
        }, " \u{1F504} ", 8, _hoisted_22)) : createCommentVNode("v-if", true)],
        2
        /* CLASS */
      );
    };
  }
});
/*! End of @ldesign/device | Powered by @ldesign/builder */

export { script as default };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=NetworkStatus.vue2.js.map
