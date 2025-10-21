/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { defineComponent, h } from 'vue';
import { useI18nRoute } from '../features/i18n/index.js';
import { RouterLink } from './RouterLink.js';

const LocaleSwitcher = defineComponent({
  name: "LocaleSwitcher",
  props: {
    // 显示模式
    mode: {
      type: String,
      default: "dropdown"
    },
    // 显示格式
    format: {
      type: String,
      default: "code"
    },
    // 语言名称映射
    labels: {
      type: Object,
      default: () => ({
        en: "English",
        zh: "\u4E2D\u6587",
        ja: "\u65E5\u672C\u8A9E",
        ko: "\uD55C\uAD6D\uC5B4",
        es: "Espa\xF1ol",
        fr: "Fran\xE7ais",
        de: "Deutsch",
        ru: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439"
      })
    },
    // 语言表情映射
    emojis: {
      type: Object,
      default: () => ({
        en: "\u{1F1FA}\u{1F1F8}",
        zh: "\u{1F1E8}\u{1F1F3}",
        ja: "\u{1F1EF}\u{1F1F5}",
        ko: "\u{1F1F0}\u{1F1F7}",
        es: "\u{1F1EA}\u{1F1F8}",
        fr: "\u{1F1EB}\u{1F1F7}",
        de: "\u{1F1E9}\u{1F1EA}",
        ru: "\u{1F1F7}\u{1F1FA}"
      })
    },
    // 自定义类名
    class: {
      type: String,
      default: ""
    },
    // 下拉框位置
    position: {
      type: String,
      default: "bottom"
    }
  },
  setup(props, {
    slots
  }) {
    const {
      locale,
      setLocale,
      getSwitchLinks
    } = useI18nRoute();
    const formatLocale = (loc) => {
      switch (props.format) {
        case "code":
          return loc.toUpperCase();
        case "name":
          return props.labels[loc] || loc;
        case "native":
          return props.labels[loc] || loc;
        case "emoji":
          return props.emojis[loc] || loc;
        default:
          return loc;
      }
    };
    const renderDropdown = () => {
      const links = getSwitchLinks();
      return h("div", {
        class: `locale-switcher locale-switcher--dropdown ${props.class}`
      }, [h("button", {
        class: "locale-switcher__trigger",
        "aria-haspopup": "listbox",
        "aria-expanded": "false"
      }, [slots.trigger?.({
        locale: locale.value,
        label: formatLocale(locale.value)
      }) || h("span", formatLocale(locale.value)), h("svg", {
        class: "locale-switcher__arrow",
        width: "12",
        height: "12",
        viewBox: "0 0 12 12"
      }, [h("path", {
        d: "M2 4L6 8L10 4",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        fill: "none"
      })])]), h("ul", {
        class: `locale-switcher__menu locale-switcher__menu--${props.position}`,
        role: "listbox"
      }, links.map((link) => h("li", {
        key: link.locale,
        class: "locale-switcher__item",
        role: "option",
        "aria-selected": link.active
      }, [h("button", {
        class: ["locale-switcher__link", {
          "locale-switcher__link--active": link.active
        }],
        onClick: () => setLocale(link.locale),
        disabled: link.active
      }, [props.format === "emoji" && h("span", {
        class: "locale-switcher__emoji"
      }, props.emojis[link.locale]), h("span", formatLocale(link.locale))])])))]);
    };
    const renderInline = () => {
      const links = getSwitchLinks();
      return h("nav", {
        class: `locale-switcher locale-switcher--inline ${props.class}`,
        "aria-label": "Language switcher"
      }, [h("ul", {
        class: "locale-switcher__list"
      }, links.map((link, index) => h("li", {
        key: link.locale,
        class: "locale-switcher__item"
      }, [h(RouterLink, {
        to: link.path,
        class: ["locale-switcher__link", {
          "locale-switcher__link--active": link.active
        }],
        custom: true
      }, {
        default: ({
          navigate
        }) => h("button", {
          onClick: navigate,
          disabled: link.active,
          "aria-current": link.active ? "true" : void 0
        }, formatLocale(link.locale))
      }), index < links.length - 1 && h("span", {
        class: "locale-switcher__separator"
      }, " | ")])))]);
    };
    const renderButtons = () => {
      const links = getSwitchLinks();
      return h("div", {
        class: `locale-switcher locale-switcher--buttons ${props.class}`,
        role: "group",
        "aria-label": "Language switcher"
      }, links.map((link) => h("button", {
        key: link.locale,
        class: ["locale-switcher__button", {
          "locale-switcher__button--active": link.active
        }],
        onClick: () => setLocale(link.locale),
        disabled: link.active,
        "aria-pressed": link.active,
        title: props.labels[link.locale]
      }, [props.format === "emoji" ? props.emojis[link.locale] : formatLocale(link.locale)])));
    };
    return () => {
      switch (props.mode) {
        case "dropdown":
          return renderDropdown();
        case "inline":
          return renderInline();
        case "buttons":
          return renderButtons();
        default:
          return null;
      }
    };
  }
});

export { LocaleSwitcher, LocaleSwitcher as default };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=LocaleSwitcher.js.map
