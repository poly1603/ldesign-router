/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var vue = require('vue');
var useDevice = require('../composables/useDevice.cjs');

const _hoisted_1 = {
  key: 0,
  class: "device-info__loading"
};
const _hoisted_2 = {
  class: "device-info__error"
};
const _hoisted_3 = {
  class: "device-info__error-content"
};
const _hoisted_4 = {
  class: "device-info__content"
};
const _hoisted_5 = {
  key: 0,
  class: "device-info__compact"
};
const _hoisted_6 = {
  class: "device-info__icon"
};
const _hoisted_7 = {
  class: "device-info__basic"
};
const _hoisted_8 = {
  class: "device-info__type"
};
const _hoisted_9 = {
  class: "device-info__size"
};
const _hoisted_10 = {
  key: 0,
  class: "device-info__actions"
};
const _hoisted_11 = {
  class: "device-info__header"
};
const _hoisted_12 = {
  class: "device-info__title"
};
const _hoisted_13 = {
  class: "device-info__icon"
};
const _hoisted_14 = {
  class: "device-info__sections"
};
const _hoisted_15 = {
  class: "device-info__section"
};
const _hoisted_16 = {
  class: "device-info__grid"
};
const _hoisted_17 = {
  class: "device-info__item"
};
const _hoisted_18 = {
  class: "device-info__item"
};
const _hoisted_19 = {
  class: "device-info__item"
};
const _hoisted_20 = {
  class: "device-info__section"
};
const _hoisted_21 = {
  class: "device-info__grid"
};
const _hoisted_22 = {
  class: "device-info__item"
};
const _hoisted_23 = {
  class: "device-info__item"
};
const _hoisted_24 = {
  class: "device-info__item"
};
const _hoisted_25 = {
  class: "device-info__section"
};
const _hoisted_26 = {
  class: "device-info__grid"
};
const _hoisted_27 = {
  class: "device-info__item"
};
const _hoisted_28 = {
  class: "device-info__item"
};
const _hoisted_29 = {
  class: "device-info__section"
};
const _hoisted_30 = {
  class: "device-info__grid"
};
const _hoisted_31 = {
  class: "device-info__item"
};
const _hoisted_32 = {
  class: "device-info__item"
};
const _hoisted_33 = {
  key: 3,
  class: "device-info__custom"
};
var script = /* @__PURE__ */ vue.defineComponent({
  __name: "DeviceInfo",
  props: {
    mode: {
      type: String,
      required: false,
      default: "detailed"
    },
    showRefresh: {
      type: Boolean,
      required: false,
      default: true
    },
    autoRefresh: {
      type: Number,
      required: false,
      default: 0
    },
    customClass: {
      type: String,
      required: false
    }
  },
  emits: ["update", "refresh", "error"],
  setup(__props, {
    expose: __expose,
    emit: __emit
  }) {
    const props = __props;
    const emit = __emit;
    const {
      deviceInfo,
      refresh: refreshDevice
    } = useDevice.useDevice();
    const info = vue.computed(() => {
      const v = deviceInfo;
      if (v && typeof v === "object" && "value" in v) return v.value;
      return v;
    });
    const isLoading = vue.ref(false);
    const errorMessage = vue.ref("");
    const hasError = vue.computed(() => !!errorMessage.value);
    let autoRefreshTimer = null;
    function getDeviceIcon(type) {
      const icons = {
        mobile: "\u{1F4F1}",
        tablet: "\u{1F4F1}",
        desktop: "\u{1F4BB}"
      };
      return icons[type] || "\u2753";
    }
    function getDeviceTypeText(type) {
      const texts = {
        mobile: "\u79FB\u52A8\u8BBE\u5907",
        tablet: "\u5E73\u677F\u8BBE\u5907",
        desktop: "\u684C\u9762\u8BBE\u5907"
      };
      return texts[type] || "\u672A\u77E5\u8BBE\u5907";
    }
    function getOrientationText(orientation) {
      const texts = {
        portrait: "\u7AD6\u5C4F",
        landscape: "\u6A2A\u5C4F"
      };
      return texts[orientation] || "\u672A\u77E5";
    }
    async function refresh() {
      try {
        isLoading.value = true;
        errorMessage.value = "";
        await Promise.resolve(refreshDevice());
        if (deviceInfo.value) {
          emit("update", deviceInfo.value);
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
      if (props.autoRefresh > 0) {
        autoRefreshTimer = window.setInterval(() => {
          refresh();
        }, props.autoRefresh);
      }
    }
    function clearAutoRefresh() {
      if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
      }
    }
    vue.onMounted(() => {
      isLoading.value = !deviceInfo.value;
      setupAutoRefresh();
    });
    vue.watch(() => props.autoRefresh, (newValue, oldValue) => {
      if (newValue !== oldValue) {
        clearAutoRefresh();
        setupAutoRefresh();
      }
    });
    vue.onUnmounted(() => {
      clearAutoRefresh();
    });
    __expose({
      isLoading,
      errorMessage
    });
    const instance = vue.getCurrentInstance();
    if (instance && instance.proxy) {
      try {
        Object.defineProperties(instance.proxy, {
          isLoading: {
            get: () => isLoading.value,
            set: (v) => {
              isLoading.value = v;
            },
            configurable: true,
            enumerable: true
          },
          errorMessage: {
            get: () => errorMessage.value,
            set: (v) => {
              errorMessage.value = v;
            },
            configurable: true,
            enumerable: true
          }
        });
      } catch {
      }
    }
    vue.watch(() => deviceInfo.value, (newInfo) => {
      isLoading.value = !newInfo;
      if (newInfo) {
        emit("update", newInfo);
      }
    }, {
      deep: true
    });
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createElementBlock(
        "div",
        {
          class: vue.normalizeClass(["device-info", [`device-info--${_ctx.mode}`, `device-info--${info.value?.type || "unknown"}`, {
            "device-info--loading": isLoading.value,
            "device-info--error": hasError.value
          }]])
        },
        [vue.createCommentVNode(" \u52A0\u8F7D\u72B6\u6001 "), isLoading.value ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_1, [..._cache[0] || (_cache[0] = [vue.createElementVNode(
          "div",
          {
            class: "device-info__spinner"
          },
          null,
          -1
          /* CACHED */
        ), vue.createElementVNode(
          "span",
          null,
          "\u6B63\u5728\u68C0\u6D4B\u8BBE\u5907\u4FE1\u606F...",
          -1
          /* CACHED */
        )])])) : hasError.value ? (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          {
            key: 1
          },
          [vue.createCommentVNode(" \u9519\u8BEF\u72B6\u6001 "), vue.createElementVNode("div", _hoisted_2, [_cache[2] || (_cache[2] = vue.createElementVNode(
            "div",
            {
              class: "device-info__error-icon"
            },
            " \u26A0\uFE0F ",
            -1
            /* CACHED */
          )), vue.createElementVNode("div", _hoisted_3, [_cache[1] || (_cache[1] = vue.createElementVNode(
            "h4",
            null,
            "\u8BBE\u5907\u4FE1\u606F\u83B7\u53D6\u5931\u8D25",
            -1
            /* CACHED */
          )), vue.createElementVNode(
            "p",
            null,
            vue.toDisplayString(errorMessage.value),
            1
            /* TEXT */
          ), vue.createElementVNode("button", {
            class: "device-info__retry-btn",
            onClick: refresh
          }, " \u91CD\u8BD5 ")])])],
          2112
          /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
        )) : info.value ? (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          {
            key: 2
          },
          [vue.createCommentVNode(" \u8BBE\u5907\u4FE1\u606F\u5185\u5BB9 "), vue.createElementVNode("div", _hoisted_4, [vue.createCommentVNode(" \u7D27\u51D1\u6A21\u5F0F "), _ctx.mode === "compact" ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_5, [vue.createElementVNode(
            "div",
            _hoisted_6,
            vue.toDisplayString(getDeviceIcon(info.value.type)),
            1
            /* TEXT */
          ), vue.createElementVNode("div", _hoisted_7, [vue.createElementVNode(
            "span",
            _hoisted_8,
            vue.toDisplayString(getDeviceTypeText(info.value.type)),
            1
            /* TEXT */
          ), vue.createElementVNode(
            "span",
            _hoisted_9,
            vue.toDisplayString(info.value.screen?.width) + "\xD7" + vue.toDisplayString(info.value.screen?.height),
            1
            /* TEXT */
          )]), _ctx.showRefresh ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_10, [vue.createElementVNode("button", {
            class: "device-info__refresh-btn",
            title: "\u5237\u65B0",
            onClick: refresh
          }, " \u{1F504} ")])) : vue.createCommentVNode("v-if", true)])) : (vue.openBlock(), vue.createElementBlock(
            vue.Fragment,
            {
              key: 1
            },
            [vue.createCommentVNode(" \u8BE6\u7EC6\u6A21\u5F0F "), vue.createElementVNode("div", _hoisted_11, [vue.createElementVNode("div", _hoisted_12, [vue.createElementVNode(
              "span",
              _hoisted_13,
              vue.toDisplayString(getDeviceIcon(info.value.type)),
              1
              /* TEXT */
            ), vue.createElementVNode(
              "h3",
              null,
              vue.toDisplayString(getDeviceTypeText(info.value.type)),
              1
              /* TEXT */
            )]), _ctx.showRefresh ? (vue.openBlock(), vue.createElementBlock("button", {
              key: 0,
              class: "device-info__refresh-btn",
              onClick: refresh
            }, " \u5237\u65B0 ")) : vue.createCommentVNode("v-if", true)]), vue.createElementVNode("div", _hoisted_14, [vue.createCommentVNode(" \u57FA\u672C\u4FE1\u606F "), vue.createElementVNode("div", _hoisted_15, [_cache[6] || (_cache[6] = vue.createElementVNode(
              "h4",
              null,
              "\u57FA\u672C\u4FE1\u606F",
              -1
              /* CACHED */
            )), vue.createElementVNode("div", _hoisted_16, [vue.createElementVNode("div", _hoisted_17, [_cache[3] || (_cache[3] = vue.createElementVNode(
              "label",
              null,
              "\u8BBE\u5907\u7C7B\u578B",
              -1
              /* CACHED */
            )), vue.createElementVNode(
              "span",
              null,
              vue.toDisplayString(getDeviceTypeText(info.value.type)),
              1
              /* TEXT */
            )]), vue.createElementVNode("div", _hoisted_18, [_cache[4] || (_cache[4] = vue.createElementVNode(
              "label",
              null,
              "\u5C4F\u5E55\u65B9\u5411",
              -1
              /* CACHED */
            )), vue.createElementVNode(
              "span",
              null,
              vue.toDisplayString(getOrientationText(info.value.orientation)),
              1
              /* TEXT */
            )]), vue.createElementVNode("div", _hoisted_19, [_cache[5] || (_cache[5] = vue.createElementVNode(
              "label",
              null,
              "\u89E6\u6478\u652F\u6301",
              -1
              /* CACHED */
            )), vue.createElementVNode(
              "span",
              null,
              vue.toDisplayString(info.value.features?.touch ? "\u652F\u6301" : "\u4E0D\u652F\u6301"),
              1
              /* TEXT */
            )])])]), vue.createCommentVNode(" \u5C4F\u5E55\u4FE1\u606F "), vue.createElementVNode("div", _hoisted_20, [_cache[10] || (_cache[10] = vue.createElementVNode(
              "h4",
              null,
              "\u5C4F\u5E55\u4FE1\u606F",
              -1
              /* CACHED */
            )), vue.createElementVNode("div", _hoisted_21, [vue.createElementVNode("div", _hoisted_22, [_cache[7] || (_cache[7] = vue.createElementVNode(
              "label",
              null,
              "\u89C6\u53E3\u5C3A\u5BF8",
              -1
              /* CACHED */
            )), vue.createElementVNode(
              "span",
              null,
              vue.toDisplayString(info.value.screen?.width) + "\xD7" + vue.toDisplayString(info.value.screen?.height),
              1
              /* TEXT */
            )]), vue.createElementVNode("div", _hoisted_23, [_cache[8] || (_cache[8] = vue.createElementVNode(
              "label",
              null,
              "\u8BBE\u5907\u50CF\u7D20\u6BD4",
              -1
              /* CACHED */
            )), vue.createElementVNode(
              "span",
              null,
              vue.toDisplayString(info.value.screen?.pixelRatio),
              1
              /* TEXT */
            )]), vue.createElementVNode("div", _hoisted_24, [_cache[9] || (_cache[9] = vue.createElementVNode(
              "label",
              null,
              "\u53EF\u7528\u5C3A\u5BF8",
              -1
              /* CACHED */
            )), vue.createElementVNode(
              "span",
              null,
              vue.toDisplayString(info.value.screen?.availWidth) + "\xD7" + vue.toDisplayString(info.value.screen?.availHeight),
              1
              /* TEXT */
            )])])]), vue.createCommentVNode(" \u6D4F\u89C8\u5668\u4FE1\u606F "), vue.createElementVNode("div", _hoisted_25, [_cache[13] || (_cache[13] = vue.createElementVNode(
              "h4",
              null,
              "\u6D4F\u89C8\u5668\u4FE1\u606F",
              -1
              /* CACHED */
            )), vue.createElementVNode("div", _hoisted_26, [vue.createElementVNode("div", _hoisted_27, [_cache[11] || (_cache[11] = vue.createElementVNode(
              "label",
              null,
              "\u6D4F\u89C8\u5668",
              -1
              /* CACHED */
            )), vue.createElementVNode(
              "span",
              null,
              vue.toDisplayString(info.value.browser?.name) + " " + vue.toDisplayString(info.value.browser?.version),
              1
              /* TEXT */
            )]), vue.createElementVNode("div", _hoisted_28, [_cache[12] || (_cache[12] = vue.createElementVNode(
              "label",
              null,
              "\u5F15\u64CE",
              -1
              /* CACHED */
            )), vue.createElementVNode(
              "span",
              null,
              vue.toDisplayString(info.value.browser?.engine),
              1
              /* TEXT */
            )])])]), vue.createCommentVNode(" \u64CD\u4F5C\u7CFB\u7EDF\u4FE1\u606F "), vue.createElementVNode("div", _hoisted_29, [_cache[16] || (_cache[16] = vue.createElementVNode(
              "h4",
              null,
              "\u64CD\u4F5C\u7CFB\u7EDF",
              -1
              /* CACHED */
            )), vue.createElementVNode("div", _hoisted_30, [vue.createElementVNode("div", _hoisted_31, [_cache[14] || (_cache[14] = vue.createElementVNode(
              "label",
              null,
              "\u7CFB\u7EDF",
              -1
              /* CACHED */
            )), vue.createElementVNode(
              "span",
              null,
              vue.toDisplayString(info.value.os?.name) + " " + vue.toDisplayString(info.value.os?.version),
              1
              /* TEXT */
            )]), vue.createElementVNode("div", _hoisted_32, [_cache[15] || (_cache[15] = vue.createElementVNode(
              "label",
              null,
              "\u5E73\u53F0",
              -1
              /* CACHED */
            )), vue.createElementVNode(
              "span",
              null,
              vue.toDisplayString(info.value.os?.platform),
              1
              /* TEXT */
            )])])])])],
            64
            /* STABLE_FRAGMENT */
          ))])],
          2112
          /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
        )) : vue.createCommentVNode("v-if", true), vue.createCommentVNode(" \u81EA\u5B9A\u4E49\u63D2\u69FD "), _ctx.$slots.default ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_33, [vue.renderSlot(_ctx.$slots, "default", {
          deviceInfo: info.value,
          refresh,
          isLoading: isLoading.value
        })])) : vue.createCommentVNode("v-if", true)],
        2
        /* CLASS */
      );
    };
  }
});
/*! End of @ldesign/device | Powered by @ldesign/builder */

exports.default = script;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=DeviceInfo.vue2.cjs.map
