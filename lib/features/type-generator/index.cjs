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

var fs = require('node:fs');
var path = require('node:path');

class RouteTypeGenerator {
  constructor(routes, options = {}) {
    this.routeInfos = [];
    this.routes = routes;
    this.options = {
      outputDir: "./src/types",
      filename: "routes.generated.ts",
      generateEnums: true,
      generateHelpers: true,
      watch: false,
      typePrefix: "",
      typeSuffix: "",
      prettier: true,
      ...options
    };
    this.parseRoutes();
  }
  /**
   * 解析路由信息
   */
  parseRoutes() {
    this.routeInfos = [];
    this.traverseRoutes(this.routes);
  }
  /**
   * 遍历路由树
   */
  traverseRoutes(routes, parentPath = "") {
    for (const route of routes) {
      const fullPath = this.normalizePath(parentPath, route.path);
      if (route.name) {
        const info = {
          name: String(route.name),
          path: fullPath,
          params: this.extractParams(fullPath),
          query: this.extractQuery(route),
          meta: route.meta
        };
        this.routeInfos.push(info);
      }
      if (route.children) {
        this.traverseRoutes(route.children, fullPath);
      }
    }
  }
  /**
   * 标准化路径
   */
  normalizePath(parent, path) {
    if (path.startsWith("/")) {
      return path;
    }
    const base = parent.endsWith("/") ? parent.slice(0, -1) : parent;
    return `${base}/${path}`;
  }
  /**
   * 提取路径参数
   */
  extractParams(path) {
    const params = [];
    const regex = /:([^/?]+)/g;
    let match;
    while ((match = regex.exec(path)) !== null) {
      params.push(match[1].replace(/\?$/, ""));
    }
    return params;
  }
  /**
   * 提取查询参数
   */
  extractQuery(route) {
    if (route.meta?.query && Array.isArray(route.meta.query)) {
      return route.meta.query;
    }
    return [];
  }
  /**
   * 生成类型定义
   */
  generate() {
    const lines = [];
    lines.push("/**");
    lines.push(" * \u81EA\u52A8\u751F\u6210\u7684\u8DEF\u7531\u7C7B\u578B\u5B9A\u4E49");
    lines.push(" * \u8BF7\u52FF\u624B\u52A8\u4FEE\u6539\u6B64\u6587\u4EF6");
    lines.push(` * \u751F\u6210\u65F6\u95F4: ${(/* @__PURE__ */ new Date()).toISOString()}`);
    lines.push(" */");
    lines.push("");
    lines.push("import type { RouteLocationRaw, RouteParams, RouteQuery } from '@ldesign/router'");
    lines.push("");
    if (this.options.generateEnums) {
      lines.push(...this.generateRouteNamesEnum());
      lines.push("");
    } else {
      lines.push(...this.generateRouteNamesType());
      lines.push("");
    }
    lines.push(...this.generateRouteParamsTypes());
    lines.push("");
    lines.push(...this.generateRouteQueryTypes());
    lines.push("");
    lines.push(...this.generateRouteMetaTypes());
    lines.push("");
    lines.push(...this.generateRouteMap());
    lines.push("");
    if (this.options.generateHelpers) {
      lines.push(...this.generateHelperFunctions());
      lines.push("");
    }
    lines.push(...this.generateTypeGuards());
    return lines.join("\n");
  }
  /**
   * 生成路由名称枚举
   */
  generateRouteNamesEnum() {
    const lines = [];
    lines.push(`export enum ${this.options.typePrefix}RouteNames${this.options.typeSuffix} {`);
    for (const info of this.routeInfos) {
      const enumKey = this.toConstantCase(info.name);
      lines.push(`  ${enumKey} = '${info.name}',`);
    }
    lines.push("}");
    return lines;
  }
  /**
   * 生成路由名称类型
   */
  generateRouteNamesType() {
    const lines = [];
    const names = this.routeInfos.map((info) => `'${info.name}'`).join(" | ");
    lines.push(`export type ${this.options.typePrefix}RouteNames${this.options.typeSuffix} = ${names}`);
    return lines;
  }
  /**
   * 生成路由参数类型
   */
  generateRouteParamsTypes() {
    const lines = [];
    lines.push(`export interface ${this.options.typePrefix}RouteParams${this.options.typeSuffix} {`);
    for (const info of this.routeInfos) {
      if (info.params && info.params.length > 0) {
        const paramType = info.params.map((p) => `${p}: string`).join("; ");
        lines.push(`  '${info.name}': { ${paramType} }`);
      } else {
        lines.push(`  '${info.name}': Record<string, never>`);
      }
    }
    lines.push("}");
    return lines;
  }
  /**
   * 生成路由查询类型
   */
  generateRouteQueryTypes() {
    const lines = [];
    lines.push(`export interface ${this.options.typePrefix}RouteQueryParams${this.options.typeSuffix} {`);
    for (const info of this.routeInfos) {
      if (info.query && info.query.length > 0) {
        const queryType = info.query.map((q) => `${q}?: string`).join("; ");
        lines.push(`  '${info.name}': { ${queryType} }`);
      } else {
        lines.push(`  '${info.name}': Record<string, string | undefined>`);
      }
    }
    lines.push("}");
    return lines;
  }
  /**
   * 生成路由元信息类型
   */
  generateRouteMetaTypes() {
    const lines = [];
    lines.push(`export interface ${this.options.typePrefix}RouteMeta${this.options.typeSuffix} {`);
    const metaFields = /* @__PURE__ */ new Set();
    for (const info of this.routeInfos) {
      if (info.meta) {
        Object.keys(info.meta).forEach((key) => metaFields.add(key));
      }
    }
    for (const field of metaFields) {
      const fieldType = this.inferMetaFieldType(field);
      lines.push(`  ${field}?: ${fieldType}`);
    }
    lines.push("}");
    return lines;
  }
  /**
   * 推断 meta 字段类型
   */
  inferMetaFieldType(field) {
    const typeMap = {
      title: "string",
      icon: "string",
      requiresAuth: "boolean",
      permissions: "string[]",
      roles: "string[]",
      keepAlive: "boolean",
      hidden: "boolean",
      order: "number"
    };
    return typeMap[field] || "any";
  }
  /**
   * 生成路由映射
   */
  generateRouteMap() {
    const lines = [];
    lines.push(`export interface ${this.options.typePrefix}RouteMap${this.options.typeSuffix} {`);
    for (const info of this.routeInfos) {
      lines.push(`  '${info.name}': {`);
      lines.push(`    path: '${info.path}'`);
      if (info.params && info.params.length > 0) {
        lines.push(`    params: ${this.options.typePrefix}RouteParams${this.options.typeSuffix}['${info.name}']`);
      }
      if (info.query && info.query.length > 0) {
        lines.push(`    query: ${this.options.typePrefix}RouteQueryParams${this.options.typeSuffix}['${info.name}']`);
      }
      lines.push(`  }`);
    }
    lines.push("}");
    return lines;
  }
  /**
   * 生成辅助函数
   */
  generateHelperFunctions() {
    const lines = [];
    lines.push("/**");
    lines.push(" * \u7C7B\u578B\u5B89\u5168\u7684\u8DEF\u7531\u5BFC\u822A");
    lines.push(" */");
    lines.push(`export function typedRoute<T extends ${this.options.typePrefix}RouteNames${this.options.typeSuffix}>(`);
    lines.push("  name: T,");
    lines.push(`  params?: ${this.options.typePrefix}RouteParams${this.options.typeSuffix}[T],`);
    lines.push(`  query?: ${this.options.typePrefix}RouteQueryParams${this.options.typeSuffix}[T]`);
    lines.push("): RouteLocationRaw {");
    lines.push("  return {");
    lines.push("    name,");
    lines.push("    params: params as RouteParams,");
    lines.push("    query: query as RouteQuery,");
    lines.push("  }");
    lines.push("}");
    lines.push("");
    lines.push("/**");
    lines.push(" * \u6784\u5EFA\u8DEF\u7531\u8DEF\u5F84");
    lines.push(" */");
    lines.push(`export function buildPath<T extends ${this.options.typePrefix}RouteNames${this.options.typeSuffix}>(`);
    lines.push("  name: T,");
    lines.push(`  params?: ${this.options.typePrefix}RouteParams${this.options.typeSuffix}[T]`);
    lines.push("): string {");
    lines.push(`  const routes: Record<${this.options.typePrefix}RouteNames${this.options.typeSuffix}, string> = {`);
    for (const info of this.routeInfos) {
      lines.push(`    '${info.name}': '${info.path}',`);
    }
    lines.push("  }");
    lines.push("");
    lines.push("  let path = routes[name]");
    lines.push("  if (params) {");
    lines.push("    Object.entries(params).forEach(([key, value]) => {");
    lines.push("      path = path.replace(`:${key}`, String(value))");
    lines.push("    })");
    lines.push("  }");
    lines.push("  return path");
    lines.push("}");
    return lines;
  }
  /**
   * 生成类型守卫
   */
  generateTypeGuards() {
    const lines = [];
    lines.push("/**");
    lines.push(" * \u68C0\u67E5\u662F\u5426\u4E3A\u6709\u6548\u7684\u8DEF\u7531\u540D\u79F0");
    lines.push(" */");
    lines.push(`export function isValidRouteName(name: any): name is ${this.options.typePrefix}RouteNames${this.options.typeSuffix} {`);
    lines.push(`  const validNames: ${this.options.typePrefix}RouteNames${this.options.typeSuffix}[] = [`);
    for (const info of this.routeInfos) {
      lines.push(`    '${info.name}',`);
    }
    lines.push("  ]");
    lines.push("  return validNames.includes(name)");
    lines.push("}");
    return lines;
  }
  /**
   * 转换为常量命名
   */
  toConstantCase(str) {
    return str.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[\s-]+/g, "_").toUpperCase();
  }
  /**
   * 写入文件
   */
  async write() {
    const content = this.generate();
    const outputPath = path.join(this.options.outputDir, this.options.filename);
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true
      });
    }
    let formattedContent = content;
    if (this.options.prettier) {
      try {
        const prettier = await import('prettier');
        formattedContent = await prettier.format(content, {
          parser: "typescript",
          ...typeof this.options.prettier === "object" ? this.options.prettier : {}
        });
      } catch {
      }
    }
    fs.writeFileSync(outputPath, formattedContent, "utf-8");
    console.log(`\u2728 \u8DEF\u7531\u7C7B\u578B\u5DF2\u751F\u6210: ${outputPath}`);
  }
  /**
   * 监听路由变化并重新生成
   */
  watch(routes) {
    if (!this.options.watch) return;
    setInterval(() => {
      const newContent = this.generate();
      const outputPath = path.join(this.options.outputDir, this.options.filename);
      try {
        const existingContent = require("node:fs").readFileSync(outputPath, "utf-8");
        if (existingContent !== newContent) {
          this.write();
        }
      } catch {
        this.write();
      }
    }, 5e3);
  }
}
function generateRouteTypes(routes, options) {
  const generator = new RouteTypeGenerator(routes, options);
  generator.write();
  return generator;
}
function vitePluginRouteTypes(options) {
  const routes = [];
  return {
    name: "vite-plugin-route-types",
    configResolved() {
      setTimeout(() => {
        if (routes.length > 0) {
          generateRouteTypes(routes, options);
        }
      }, 100);
    },
    handleHotUpdate({
      file
    }) {
      if (file.includes("routes") || file.includes("router")) {
        generateRouteTypes(routes, options);
      }
    }
  };
}
class WebpackPluginRouteTypes {
  constructor(options) {
    this.options = options || {};
  }
  apply(compiler) {
    compiler.hooks.afterEmit.tap("WebpackPluginRouteTypes", () => {
    });
  }
}

exports.RouteTypeGenerator = RouteTypeGenerator;
exports.WebpackPluginRouteTypes = WebpackPluginRouteTypes;
exports.generateRouteTypes = generateRouteTypes;
exports.vitePluginRouteTypes = vitePluginRouteTypes;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=index.cjs.map
