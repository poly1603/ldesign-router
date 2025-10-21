/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class TemplateRouteResolver {
  constructor(_router, options = {}) {
    this.options = {
      enabled: true,
      defaultTemplate: "default",
      templatePrefix: "/templates",
      ...options
    };
  }
  /**
   * 初始化模板路由解析器
   */
  init() {
    if (!this.options.enabled) ;
  }
  /**
   * 解析模板路由
   */
  resolveTemplateRoute(path, device) {
    return `${this.options.templatePrefix}/${device}${path}`;
  }
  /**
   * 获取模板路径
   */
  getTemplatePath(templateName, device) {
    return `${this.options.templatePrefix}/${device}/${templateName}`;
  }
  /**
   * 销毁解析器
   */
  destroy() {
  }
}

export { TemplateRouteResolver };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=template.js.map
