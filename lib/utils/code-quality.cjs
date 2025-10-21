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

exports.QualityIssueType = void 0;
(function(QualityIssueType2) {
  QualityIssueType2["PERFORMANCE"] = "PERFORMANCE";
  QualityIssueType2["SECURITY"] = "SECURITY";
  QualityIssueType2["ACCESSIBILITY"] = "ACCESSIBILITY";
  QualityIssueType2["MAINTAINABILITY"] = "MAINTAINABILITY";
  QualityIssueType2["BEST_PRACTICE"] = "BEST_PRACTICE";
})(exports.QualityIssueType || (exports.QualityIssueType = {}));
exports.IssueSeverity = void 0;
(function(IssueSeverity2) {
  IssueSeverity2["ERROR"] = "ERROR";
  IssueSeverity2["WARNING"] = "WARNING";
  IssueSeverity2["INFO"] = "INFO";
})(exports.IssueSeverity || (exports.IssueSeverity = {}));
class CodeQualityChecker {
  constructor() {
    this.rules = /* @__PURE__ */ new Map();
    this.issues = [];
    this.setupDefaultRules();
  }
  /**
   * 设置默认检查规则
   */
  setupDefaultRules() {
    this.addRule({
      id: "route-depth",
      name: "\u8DEF\u7531\u5D4C\u5957\u6DF1\u5EA6\u68C0\u67E5",
      type: exports.QualityIssueType.MAINTAINABILITY,
      severity: exports.IssueSeverity.WARNING,
      enabled: true,
      check: (context) => {
        const issues = [];
        const maxDepth = 4;
        const checkDepth = (routes, depth = 0, parentPath = "") => {
          for (const route of routes) {
            const currentPath = `${parentPath}${route.path}`;
            if (depth > maxDepth) {
              issues.push({
                id: `route-depth-${Date.now()}`,
                type: exports.QualityIssueType.MAINTAINABILITY,
                severity: exports.IssueSeverity.WARNING,
                message: `\u8DEF\u7531\u5D4C\u5957\u8FC7\u6DF1: ${currentPath}`,
                description: `\u8DEF\u7531\u5D4C\u5957\u6DF1\u5EA6\u4E3A ${depth}\uFF0C\u8D85\u8FC7\u63A8\u8350\u7684\u6700\u5927\u6DF1\u5EA6 ${maxDepth}`,
                suggestion: "\u8003\u8651\u91CD\u6784\u8DEF\u7531\u7ED3\u6784\uFF0C\u51CF\u5C11\u5D4C\u5957\u5C42\u7EA7",
                route: currentPath
              });
            }
            if (route.children) {
              checkDepth(route.children, depth + 1, currentPath);
            }
          }
        };
        checkDepth(context.routes);
        return issues;
      }
    });
    this.addRule({
      id: "route-naming",
      name: "\u8DEF\u7531\u547D\u540D\u89C4\u8303\u68C0\u67E5",
      type: exports.QualityIssueType.BEST_PRACTICE,
      severity: exports.IssueSeverity.INFO,
      enabled: true,
      check: (context) => {
        const issues = [];
        const namePattern = /^[a-z][a-z0-9-]*$/i;
        const checkNaming = (routes) => {
          for (const route of routes) {
            if (route.name && !namePattern.test(String(route.name))) {
              issues.push({
                id: `route-naming-${Date.now()}`,
                type: exports.QualityIssueType.BEST_PRACTICE,
                severity: exports.IssueSeverity.INFO,
                message: `\u8DEF\u7531\u540D\u79F0\u4E0D\u7B26\u5408\u89C4\u8303: ${String(route.name)}`,
                description: "\u8DEF\u7531\u540D\u79F0\u5E94\u8BE5\u4F7F\u7528 kebab-case \u683C\u5F0F",
                suggestion: "\u4F7F\u7528\u5C0F\u5199\u5B57\u6BCD\u3001\u6570\u5B57\u548C\u8FDE\u5B57\u7B26\u7EC4\u6210\u8DEF\u7531\u540D\u79F0",
                route: route.path
              });
            }
            if (route.children) {
              checkNaming(route.children);
            }
          }
        };
        checkNaming(context.routes);
        return issues;
      }
    });
    this.addRule({
      id: "lazy-loading",
      name: "\u7EC4\u4EF6\u61D2\u52A0\u8F7D\u68C0\u67E5",
      type: exports.QualityIssueType.PERFORMANCE,
      severity: exports.IssueSeverity.WARNING,
      enabled: true,
      check: (context) => {
        const issues = [];
        const checkLazyLoading = (routes) => {
          for (const route of routes) {
            if (route.component && typeof route.component !== "function") {
              issues.push({
                id: `lazy-loading-${Date.now()}`,
                type: exports.QualityIssueType.PERFORMANCE,
                severity: exports.IssueSeverity.WARNING,
                message: `\u7EC4\u4EF6\u672A\u4F7F\u7528\u61D2\u52A0\u8F7D: ${route.path}`,
                description: "\u540C\u6B65\u5BFC\u5165\u7684\u7EC4\u4EF6\u4F1A\u589E\u52A0\u521D\u59CB\u5305\u5927\u5C0F",
                suggestion: "\u4F7F\u7528\u52A8\u6001\u5BFC\u5165 () => import() \u5B9E\u73B0\u7EC4\u4EF6\u61D2\u52A0\u8F7D",
                route: route.path
              });
            }
            if (route.children) {
              checkLazyLoading(route.children);
            }
          }
        };
        checkLazyLoading(context.routes);
        return issues;
      }
    });
    this.addRule({
      id: "route-meta",
      name: "\u8DEF\u7531\u5143\u4FE1\u606F\u68C0\u67E5",
      type: exports.QualityIssueType.ACCESSIBILITY,
      severity: exports.IssueSeverity.INFO,
      enabled: true,
      check: (context) => {
        const issues = [];
        const checkMeta = (routes) => {
          for (const route of routes) {
            if (!route.meta?.title) {
              issues.push({
                id: `route-meta-title-${Date.now()}`,
                type: exports.QualityIssueType.ACCESSIBILITY,
                severity: exports.IssueSeverity.INFO,
                message: `\u8DEF\u7531\u7F3A\u5C11\u6807\u9898: ${route.path}`,
                description: "\u8DEF\u7531\u5E94\u8BE5\u5305\u542B meta.title \u7528\u4E8E\u9875\u9762\u6807\u9898\u548C\u65E0\u969C\u788D\u8BBF\u95EE",
                suggestion: '\u5728\u8DEF\u7531\u914D\u7F6E\u4E2D\u6DFB\u52A0 meta: { title: "\u9875\u9762\u6807\u9898" }',
                route: route.path
              });
            }
            if (route.children) {
              checkMeta(route.children);
            }
          }
        };
        checkMeta(context.routes);
        return issues;
      }
    });
    this.addRule({
      id: "duplicate-routes",
      name: "\u91CD\u590D\u8DEF\u7531\u68C0\u67E5",
      type: exports.QualityIssueType.MAINTAINABILITY,
      severity: exports.IssueSeverity.ERROR,
      enabled: true,
      check: (context) => {
        const issues = [];
        const pathSet = /* @__PURE__ */ new Set();
        const nameSet = /* @__PURE__ */ new Set();
        const checkDuplicates = (routes, parentPath = "") => {
          for (const route of routes) {
            const fullPath = `${parentPath}${route.path}`;
            if (pathSet.has(fullPath)) {
              issues.push({
                id: `duplicate-path-${Date.now()}`,
                type: exports.QualityIssueType.MAINTAINABILITY,
                severity: exports.IssueSeverity.ERROR,
                message: `\u91CD\u590D\u7684\u8DEF\u7531\u8DEF\u5F84: ${fullPath}`,
                description: "\u5B58\u5728\u76F8\u540C\u7684\u8DEF\u7531\u8DEF\u5F84\uFF0C\u53EF\u80FD\u5BFC\u81F4\u8DEF\u7531\u51B2\u7A81",
                suggestion: "\u786E\u4FDD\u6BCF\u4E2A\u8DEF\u7531\u8DEF\u5F84\u90FD\u662F\u552F\u4E00\u7684",
                route: fullPath
              });
            } else {
              pathSet.add(fullPath);
            }
            if (route.name) {
              if (nameSet.has(String(route.name))) {
                issues.push({
                  id: `duplicate-name-${Date.now()}`,
                  type: exports.QualityIssueType.MAINTAINABILITY,
                  severity: exports.IssueSeverity.ERROR,
                  message: `\u91CD\u590D\u7684\u8DEF\u7531\u540D\u79F0: ${String(route.name)}`,
                  description: "\u5B58\u5728\u76F8\u540C\u7684\u8DEF\u7531\u540D\u79F0\uFF0C\u53EF\u80FD\u5BFC\u81F4\u5BFC\u822A\u9519\u8BEF",
                  suggestion: "\u786E\u4FDD\u6BCF\u4E2A\u8DEF\u7531\u540D\u79F0\u90FD\u662F\u552F\u4E00\u7684",
                  route: fullPath
                });
              } else {
                nameSet.add(String(route.name));
              }
            }
            if (route.children) {
              checkDuplicates(route.children, fullPath);
            }
          }
        };
        checkDuplicates(context.routes);
        return issues;
      }
    });
  }
  /**
   * 添加检查规则
   */
  addRule(rule) {
    this.rules.set(rule.id, rule);
  }
  /**
   * 移除检查规则
   */
  removeRule(ruleId) {
    this.rules.delete(ruleId);
  }
  /**
   * 启用/禁用规则
   */
  toggleRule(ruleId, enabled) {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;
    }
  }
  /**
   * 执行质量检查
   */
  check(context) {
    this.issues = [];
    for (const rule of this.rules.values()) {
      if (rule.enabled) {
        try {
          const ruleIssues = rule.check(context);
          this.issues.push(...ruleIssues);
        } catch (error) {
          console.error(`\u8D28\u91CF\u68C0\u67E5\u89C4\u5219\u6267\u884C\u5931\u8D25: ${rule.id}`, error);
        }
      }
    }
    return this.issues;
  }
  /**
   * 获取问题统计
   */
  getIssueStats() {
    const stats = {
      total: this.issues.length,
      byType: {},
      bySeverity: {}
    };
    for (const issue of this.issues) {
      stats.byType[issue.type] = (stats.byType[issue.type] || 0) + 1;
      stats.bySeverity[issue.severity] = (stats.bySeverity[issue.severity] || 0) + 1;
    }
    return stats;
  }
  /**
   * 生成质量报告
   */
  generateReport() {
    const stats = this.getIssueStats();
    let report = "# \u4EE3\u7801\u8D28\u91CF\u68C0\u67E5\u62A5\u544A\n\n";
    report += `## \u603B\u89C8
`;
    report += `- \u603B\u95EE\u9898\u6570: ${stats.total}
`;
    report += `- \u9519\u8BEF: ${stats.bySeverity[exports.IssueSeverity.ERROR] || 0}
`;
    report += `- \u8B66\u544A: ${stats.bySeverity[exports.IssueSeverity.WARNING] || 0}
`;
    report += `- \u4FE1\u606F: ${stats.bySeverity[exports.IssueSeverity.INFO] || 0}

`;
    if (this.issues.length > 0) {
      report += `## \u95EE\u9898\u8BE6\u60C5

`;
      for (const issue of this.issues) {
        report += `### ${issue.severity}: ${issue.message}
`;
        report += `- **\u7C7B\u578B**: ${issue.type}
`;
        report += `- **\u63CF\u8FF0**: ${issue.description}
`;
        report += `- **\u5EFA\u8BAE**: ${issue.suggestion}
`;
        if (issue.route) {
          report += `- **\u8DEF\u7531**: ${issue.route}
`;
        }
        report += "\n";
      }
    }
    return report;
  }
  /**
   * 清空问题列表
   */
  clearIssues() {
    this.issues = [];
  }
}
const codeQualityChecker = new CodeQualityChecker();

exports.CodeQualityChecker = CodeQualityChecker;
exports.codeQualityChecker = codeQualityChecker;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=code-quality.cjs.map
