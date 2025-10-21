/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { defineComponent, computed, h } from 'vue';

var DeviceUnsupported = defineComponent({
  name: "DeviceUnsupported",
  props: {
    device: {
      type: String,
      default: "desktop"
    },
    from: {
      type: String,
      default: ""
    },
    message: {
      type: String,
      default: "\u5F53\u524D\u7CFB\u7EDF\u4E0D\u652F\u6301\u5728\u6B64\u8BBE\u5907\u4E0A\u67E5\u770B"
    },
    supportedDevices: {
      type: Array,
      default: () => ["desktop"]
    },
    showBackButton: {
      type: Boolean,
      default: true
    },
    showRefreshButton: {
      type: Boolean,
      default: true
    },
    className: {
      type: String,
      default: ""
    }
  },
  setup(props) {
    const deviceNames = {
      mobile: "\u79FB\u52A8\u8BBE\u5907",
      tablet: "\u5E73\u677F\u8BBE\u5907",
      desktop: "\u684C\u9762\u8BBE\u5907",
      tv: "\u7535\u89C6\u8BBE\u5907",
      watch: "\u667A\u80FD\u624B\u8868",
      unknown: "\u672A\u77E5\u8BBE\u5907"
    };
    const currentDeviceName = computed(() => {
      return deviceNames[props.device] || props.device;
    });
    const supportedDeviceNames = computed(() => {
      return props.supportedDevices.map((device) => deviceNames[device] || device);
    });
    const deviceIcon = computed(() => {
      const icons = {
        mobile: "\u{1F4F1}",
        tablet: "\u{1F4F1}",
        desktop: "\u{1F5A5}\uFE0F",
        tv: "\u{1F4FA}",
        watch: "\u231A",
        unknown: "\u2753"
      };
      return icons[props.device] || "\u{1F4F1}";
    });
    const goBack = () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "/";
      }
    };
    const refresh = () => {
      window.location.reload();
    };
    const className = computed(() => {
      return ["device-unsupported", props.className].filter(Boolean).join(" ");
    });
    return () => h("div", {
      class: className.value
    }, [h("div", {
      class: "device-unsupported__container"
    }, [
      // 图标区域
      h("div", {
        class: "device-unsupported__icon"
      }, [h("span", {
        class: "device-unsupported__device-icon"
      }, deviceIcon.value), h("span", {
        class: "device-unsupported__warning-icon"
      }, "\u26A0\uFE0F")]),
      // 标题
      h("h1", {
        class: "device-unsupported__title"
      }, "\u8BBE\u5907\u4E0D\u652F\u6301"),
      // 消息内容
      h("div", {
        class: "device-unsupported__content"
      }, [
        h("p", {
          class: "device-unsupported__message"
        }, props.message),
        h("div", {
          class: "device-unsupported__details"
        }, [h("p", {}, [h("strong", {}, "\u5F53\u524D\u8BBE\u5907\uFF1A"), h("span", {
          class: "device-unsupported__current-device"
        }, currentDeviceName.value)]), props.supportedDevices.length > 0 ? h("p", {}, [h("strong", {}, "\u652F\u6301\u7684\u8BBE\u5907\uFF1A"), h("span", {
          class: "device-unsupported__supported-devices"
        }, supportedDeviceNames.value.join("\u3001"))]) : null]),
        // 建议
        h("div", {
          class: "device-unsupported__suggestions"
        }, [h("h3", {}, "\u5EFA\u8BAE\uFF1A"), h("ul", {}, [props.supportedDevices.includes("desktop") ? h("li", {}, "\u8BF7\u4F7F\u7528\u684C\u9762\u7535\u8111\u6216\u7B14\u8BB0\u672C\u7535\u8111\u8BBF\u95EE") : null, props.supportedDevices.includes("tablet") ? h("li", {}, "\u8BF7\u4F7F\u7528\u5E73\u677F\u8BBE\u5907\u8BBF\u95EE") : null, props.supportedDevices.includes("mobile") ? h("li", {}, "\u8BF7\u4F7F\u7528\u624B\u673A\u8BBF\u95EE") : null, h("li", {}, "\u8054\u7CFB\u7BA1\u7406\u5458\u83B7\u53D6\u66F4\u591A\u5E2E\u52A9")].filter(Boolean))])
      ]),
      // 操作按钮
      h("div", {
        class: "device-unsupported__actions"
      }, [props.showBackButton ? h("button", {
        type: "button",
        class: "device-unsupported__button device-unsupported__button--secondary",
        onClick: goBack
      }, "\u8FD4\u56DE\u4E0A\u4E00\u9875") : null, props.showRefreshButton ? h("button", {
        type: "button",
        class: "device-unsupported__button device-unsupported__button--primary",
        onClick: refresh
      }, "\u5237\u65B0\u9875\u9762") : null].filter(Boolean)),
      // 来源信息
      props.from ? h("div", {
        class: "device-unsupported__from"
      }, [h("small", {}, ["\u6765\u6E90\u9875\u9762\uFF1A", props.from])]) : null
    ])]);
  }
});

export { DeviceUnsupported as default };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=DeviceUnsupported.js.map
