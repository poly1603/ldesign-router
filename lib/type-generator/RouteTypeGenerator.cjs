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

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var fs__namespace = /*#__PURE__*/_interopNamespaceDefault(fs);
var path__namespace = /*#__PURE__*/_interopNamespaceDefault(path);

class RouteTypeGenerator {
  constructor(options = {}) {
    this.routes = [];
    this.routeInfos = [];
    this.generatedTypes = {
      routeNames: "",
      routePaths: "",
      routeParams: "",
      routeQuery: "",
      routeMeta: "",
      routeMap: "",
      helpers: ""
    };
    this.fileWatcher = null;
    this.options = {
      routesPath: "./src/routes.ts",
      outputDir: "./src/types",
      outputFileName: "route-types.ts",
      generateParams: true,
      generateQuery: true,
      generateMeta: true,
      generateGuards: true,
      strictMode: false,
      watch: false,
      generateUnions: true,
      generateEnums: true,
      customTransformers: [],
      templates: this.getDefaultTemplates(),
      ...options
    };
  }
  /**
   * 获取默认模板
   */
  getDefaultTemplates() {
    return {
      header: `/**
 * \u81EA\u52A8\u751F\u6210\u7684\u8DEF\u7531\u7C7B\u578B\u5B9A\u4E49
 * @generated
 * @description \u6B64\u6587\u4EF6\u7531\u8DEF\u7531\u7C7B\u578B\u751F\u6210\u5668\u81EA\u52A8\u751F\u6210\uFF0C\u8BF7\u52FF\u624B\u52A8\u4FEE\u6539
 */

import type { RouteLocationNormalizedLoaded, RouteLocationRaw, RouteParams, LocationQuery } from 'vue-router'

`,
      footer: `
/**
 * \u7C7B\u578B\u5BFC\u51FA
 */
export type {
  RouteNames,
  RoutePaths,
  RouteParamsMap,
  RouteQueryMap,
  RouteMetaMap,
  RouteMap,
  TypedRoute,
  TypedRouteLocation,
  TypedRouteLocationRaw
}
`,
      route: "",
      params: "",
      query: "",
      meta: ""
    };
  }
  /**
   * 生成类型
   */
  async generate(routes) {
    try {
      if (routes) {
        this.routes = routes;
      } else {
        this.routes = await this.loadRoutes();
      }
      this.routeInfos = this.parseRoutes(this.routes);
      this.generateRouteNames();
      this.generateRoutePaths();
      if (this.options.generateParams) {
        this.generateRouteParams();
      }
      if (this.options.generateQuery) {
        this.generateRouteQuery();
      }
      if (this.options.generateMeta) {
        this.generateRouteMeta();
      }
      this.generateRouteMap();
      this.generateHelperTypes();
      await this.writeTypes();
      if (this.options.watch) {
        this.startWatcher();
      }
      console.log("\u2705 \u8DEF\u7531\u7C7B\u578B\u751F\u6210\u6210\u529F");
    } catch (error) {
      console.error("\u274C \u8DEF\u7531\u7C7B\u578B\u751F\u6210\u5931\u8D25:", error);
      throw error;
    }
  }
  /**
   * 加载路由配置
   */
  async loadRoutes() {
    const routesPath = path__namespace.resolve(this.options.routesPath);
    if (!fs__namespace.existsSync(routesPath)) {
      throw new Error(`\u8DEF\u7531\u6587\u4EF6\u4E0D\u5B58\u5728: ${routesPath}`);
    }
    const routeModule = await import(routesPath);
    return routeModule.default || routeModule.routes || [];
  }
  /**
   * 解析路由信息
   */
  parseRoutes(routes, parentPath = "") {
    const infos = [];
    for (const route of routes) {
      const fullPath = this.joinPath(parentPath, route.path);
      const params = this.extractParams(fullPath);
      const query = this.extractQuery(route);
      const info = {
        name: String(route.name || ""),
        path: fullPath,
        params,
        query,
        meta: route.meta || {},
        component: route.component
      };
      if (route.children) {
        info.children = this.parseRoutes(route.children, fullPath);
      }
      infos.push(info);
      if (info.children) {
        infos.push(...info.children);
      }
    }
    return infos;
  }
  /**
   * 连接路径
   */
  joinPath(parent, child) {
    if (child.startsWith("/")) {
      return child;
    }
    const separator = parent.endsWith("/") ? "" : "/";
    return parent + separator + child;
  }
  /**
   * 提取路径参数
   */
  extractParams(path2) {
    const params = {};
    const paramRegex = /:([^/]+)(\(.*?\))?(\?)?/g;
    let match;
    while ((match = paramRegex.exec(path2)) !== null) {
      const paramName = match[1];
      const isOptional = match[3] === "?";
      params[paramName] = isOptional ? "string | undefined" : "string";
    }
    return params;
  }
  /**
   * 提取查询参数
   */
  extractQuery(route) {
    const query = {};
    if (route.meta?.query) {
      Object.assign(query, route.meta.query);
    }
    return query;
  }
  /**
   * 生成路由名称类型
   */
  generateRouteNames() {
    const names = this.routeInfos.filter((info) => info.name).map((info) => `'${info.name}'`);
    if (this.options.generateEnums) {
      this.generatedTypes.routeNames = `
/**
 * \u8DEF\u7531\u540D\u79F0\u679A\u4E3E
 */
export enum RouteNamesEnum {
${this.routeInfos.filter((info) => info.name).map((info) => `  ${this.toUpperCase(info.name)} = '${info.name}'`).join(",\n")}
}
`;
    }
    if (this.options.generateUnions) {
      this.generatedTypes.routeNames += `
/**
 * \u8DEF\u7531\u540D\u79F0\u7C7B\u578B
 */
export type RouteNames = ${names.length > 0 ? names.join(" | ") : "never"}
`;
    }
  }
  /**
   * 生成路由路径类型
   */
  generateRoutePaths() {
    const paths = this.routeInfos.map((info) => `'${info.path}'`);
    if (this.options.generateEnums) {
      this.generatedTypes.routePaths = `
/**
 * \u8DEF\u7531\u8DEF\u5F84\u679A\u4E3E
 */
export enum RoutePathsEnum {
${this.routeInfos.map((info) => `  ${this.toUpperCase(info.name || info.path)} = '${info.path}'`).join(",\n")}
}
`;
    }
    if (this.options.generateUnions) {
      this.generatedTypes.routePaths += `
/**
 * \u8DEF\u7531\u8DEF\u5F84\u7C7B\u578B
 */
export type RoutePaths = ${paths.length > 0 ? paths.join(" | ") : "never"}
`;
    }
  }
  /**
   * 生成路由参数类型
   */
  generateRouteParams() {
    const paramsMap = [];
    for (const info of this.routeInfos) {
      if (Object.keys(info.params).length > 0 && info.name) {
        const paramType = this.generateObjectType(info.params);
        paramsMap.push(`  '${info.name}': ${paramType}`);
      }
    }
    this.generatedTypes.routeParams = `
/**
 * \u8DEF\u7531\u53C2\u6570\u6620\u5C04
 */
export interface RouteParamsMap {
${paramsMap.length > 0 ? paramsMap.join("\n") : "  [key: string]: never"}
}

/**
 * \u83B7\u53D6\u8DEF\u7531\u53C2\u6570\u7C7B\u578B
 */
export type GetRouteParams<T extends RouteNames> = T extends keyof RouteParamsMap 
  ? RouteParamsMap[T] 
  : Record<string, string | undefined>
`;
  }
  /**
   * 生成路由查询类型
   */
  generateRouteQuery() {
    const queryMap = [];
    for (const info of this.routeInfos) {
      if (Object.keys(info.query).length > 0 && info.name) {
        const queryType = this.generateObjectType(info.query);
        queryMap.push(`  '${info.name}': ${queryType}`);
      }
    }
    this.generatedTypes.routeQuery = `
/**
 * \u8DEF\u7531\u67E5\u8BE2\u53C2\u6570\u6620\u5C04
 */
export interface RouteQueryMap {
${queryMap.length > 0 ? queryMap.join("\n") : "  [key: string]: never"}
}

/**
 * \u83B7\u53D6\u8DEF\u7531\u67E5\u8BE2\u53C2\u6570\u7C7B\u578B
 */
export type GetRouteQuery<T extends RouteNames> = T extends keyof RouteQueryMap 
  ? RouteQueryMap[T] 
  : LocationQuery
`;
  }
  /**
   * 生成路由元信息类型
   */
  generateRouteMeta() {
    const metaMap = [];
    for (const info of this.routeInfos) {
      if (Object.keys(info.meta).length > 0 && info.name) {
        const metaType = this.generateObjectType(info.meta);
        metaMap.push(`  '${info.name}': ${metaType}`);
      }
    }
    this.generatedTypes.routeMeta = `
/**
 * \u8DEF\u7531\u5143\u4FE1\u606F\u6620\u5C04
 */
export interface RouteMetaMap {
${metaMap.length > 0 ? metaMap.join("\n") : "  [key: string]: never"}
}

/**
 * \u83B7\u53D6\u8DEF\u7531\u5143\u4FE1\u606F\u7C7B\u578B
 */
export type GetRouteMeta<T extends RouteNames> = T extends keyof RouteMetaMap 
  ? RouteMetaMap[T] 
  : Record<string, any>
`;
  }
  /**
   * 生成路由映射类型
   */
  generateRouteMap() {
    const routeMap = [];
    for (const info of this.routeInfos) {
      if (info.name) {
        routeMap.push(`  '${info.name}': {
    name: '${info.name}'
    path: '${info.path}'
    params: ${this.generateObjectType(info.params)}
    query: ${this.generateObjectType(info.query)}
    meta: ${this.generateObjectType(info.meta)}
  }`);
      }
    }
    this.generatedTypes.routeMap = `
/**
 * \u5B8C\u6574\u8DEF\u7531\u6620\u5C04
 */
export interface RouteMap {
${routeMap.length > 0 ? routeMap.join("\n") : "  [key: string]: never"}
}
`;
  }
  /**
   * 生成辅助类型
   */
  generateHelperTypes() {
    this.generatedTypes.helpers = `
/**
 * \u7C7B\u578B\u5B89\u5168\u7684\u8DEF\u7531\u5BF9\u8C61
 */
export interface TypedRoute<T extends RouteNames = RouteNames> {
  name: T
  params?: T extends keyof RouteParamsMap ? RouteParamsMap[T] : never
  query?: T extends keyof RouteQueryMap ? RouteQueryMap[T] : never
  meta?: T extends keyof RouteMetaMap ? RouteMetaMap[T] : never
}

/**
 * \u7C7B\u578B\u5B89\u5168\u7684\u8DEF\u7531\u4F4D\u7F6E
 */
export type TypedRouteLocation<T extends RouteNames = RouteNames> = 
  RouteLocationNormalizedLoaded & TypedRoute<T>

/**
 * \u7C7B\u578B\u5B89\u5168\u7684\u8DEF\u7531\u8DF3\u8F6C\u53C2\u6570
 */
export type TypedRouteLocationRaw<T extends RouteNames = RouteNames> = 
  | T
  | TypedRoute<T>
  | { path: RoutePaths }

/**
 * \u8DEF\u7531\u5BFC\u822A\u5B88\u536B\u7C7B\u578B
 */
export type TypedNavigationGuard<T extends RouteNames = RouteNames> = (
  to: TypedRouteLocation<T>,
  from: TypedRouteLocation<T>
) => void | Promise<void> | boolean | RouteLocationRaw

/**
 * \u8DEF\u7531\u94A9\u5B50\u7C7B\u578B
 */
export type TypedRouteHook<T extends RouteNames = RouteNames> = (
  route: TypedRouteLocation<T>
) => void | Promise<void>

/**
 * \u4E25\u683C\u6A21\u5F0F\u8DEF\u7531\u7C7B\u578B
 */
${this.options.strictMode ? `
export type StrictRoute<T extends RouteNames> = {
  [K in keyof RouteMap[T]]: RouteMap[T][K]
}
` : ""}
`;
  }
  /**
   * 生成对象类型字符串
   */
  generateObjectType(obj) {
    if (Object.keys(obj).length === 0) {
      return "{}";
    }
    const entries = Object.entries(obj).map(([key, value]) => {
      const type = this.inferType(value);
      return `    ${key}: ${type}`;
    });
    return `{
${entries.join("\n")}
  }`;
  }
  /**
   * 推断类型
   */
  inferType(value) {
    if (value === null) return "null";
    if (value === void 0) return "undefined";
    if (typeof value === "string") {
      if (value.includes("|") || value.includes("&")) {
        return value;
      }
      return `'${value}'`;
    }
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    if (Array.isArray(value)) {
      if (value.length === 0) return "any[]";
      const types = value.map((v) => this.inferType(v));
      const uniqueTypes = [...new Set(types)];
      return uniqueTypes.length === 1 ? `${uniqueTypes[0]}[]` : `(${uniqueTypes.join(" | ")})[]`;
    }
    if (typeof value === "object") {
      return this.generateObjectType(value);
    }
    return "any";
  }
  /**
   * 转换为大写下划线格式
   */
  toUpperCase(str) {
    return str.replace(/([A-Z])/g, "_$1").replace(/[^a-z0-9]/gi, "_").toUpperCase().replace(/^_/, "");
  }
  /**
   * 写入类型文件
   */
  async writeTypes() {
    const outputPath = path__namespace.resolve(this.options.outputDir, this.options.outputFileName);
    const outputDir = path__namespace.dirname(outputPath);
    if (!fs__namespace.existsSync(outputDir)) {
      fs__namespace.mkdirSync(outputDir, {
        recursive: true
      });
    }
    const content = [this.options.templates?.header || this.getDefaultTemplates().header, this.generatedTypes.routeNames, this.generatedTypes.routePaths, this.generatedTypes.routeParams, this.generatedTypes.routeQuery, this.generatedTypes.routeMeta, this.generatedTypes.routeMap, this.generatedTypes.helpers, this.options.templates?.footer || this.getDefaultTemplates().footer].join("\n");
    fs__namespace.writeFileSync(outputPath, content, "utf-8");
    console.log(`\u{1F4DD} \u7C7B\u578B\u6587\u4EF6\u5DF2\u751F\u6210: ${outputPath}`);
  }
  /**
   * 启动文件监听
   */
  startWatcher() {
    if (this.fileWatcher) {
      this.fileWatcher.close();
    }
    const watchPath = path__namespace.resolve(this.options.routesPath);
    this.fileWatcher = fs__namespace.watch(watchPath, async (eventType, filename) => {
      console.log(`\u{1F504} \u68C0\u6D4B\u5230\u8DEF\u7531\u6587\u4EF6\u53D8\u5316: ${filename}`);
      setTimeout(async () => {
        try {
          await this.generate();
        } catch (error) {
          console.error("\u274C \u81EA\u52A8\u751F\u6210\u5931\u8D25:", error);
        }
      }, 500);
    });
    console.log(`\u{1F440} \u6B63\u5728\u76D1\u542C\u8DEF\u7531\u6587\u4EF6: ${watchPath}`);
  }
  /**
   * 停止监听
   */
  stopWatcher() {
    if (this.fileWatcher) {
      this.fileWatcher.close();
      this.fileWatcher = null;
      console.log("\u{1F6D1} \u5DF2\u505C\u6B62\u76D1\u542C");
    }
  }
  /**
   * 应用自定义转换器
   */
  applyTransformers(route) {
    const results = {};
    for (const transformer of this.options.customTransformers) {
      const pattern = transformer.pattern;
      const shouldTransform = typeof pattern === "string" ? route.path.includes(pattern) : pattern.test(route.path);
      if (shouldTransform) {
        const transformed = transformer.transform(route);
        results[transformer.name] = transformed;
      }
    }
    return results;
  }
  /**
   * 生成类型声明文件
   */
  async generateDeclaration() {
    const declarationContent = `
declare module 'vue-router' {
  import type { RouteNames, RouteParamsMap, RouteQueryMap, RouteMetaMap } from '${this.options.outputFileName.replace(".ts", "")}'

  export interface RouteMeta extends RouteMetaMap[keyof RouteMetaMap] {}
  
  export interface RouteLocationNormalizedLoaded {
    name: RouteNames
    params: RouteParamsMap[RouteNames]
    query: RouteQueryMap[RouteNames]
    meta: RouteMetaMap[RouteNames]
  }
}
`;
    const declarationPath = path__namespace.resolve(this.options.outputDir, "vue-router.d.ts");
    fs__namespace.writeFileSync(declarationPath, declarationContent, "utf-8");
    console.log(`\u{1F4DD} \u58F0\u660E\u6587\u4EF6\u5DF2\u751F\u6210: ${declarationPath}`);
  }
  /**
   * 清理生成的文件
   */
  clean() {
    const outputPath = path__namespace.resolve(this.options.outputDir, this.options.outputFileName);
    const declarationPath = path__namespace.resolve(this.options.outputDir, "vue-router.d.ts");
    if (fs__namespace.existsSync(outputPath)) {
      fs__namespace.unlinkSync(outputPath);
      console.log(`\u{1F5D1}\uFE0F  \u5DF2\u5220\u9664: ${outputPath}`);
    }
    if (fs__namespace.existsSync(declarationPath)) {
      fs__namespace.unlinkSync(declarationPath);
      console.log(`\u{1F5D1}\uFE0F  \u5DF2\u5220\u9664: ${declarationPath}`);
    }
    this.stopWatcher();
  }
}
function createRouteTypeGenerator(options) {
  return new RouteTypeGenerator(options);
}

exports.RouteTypeGenerator = RouteTypeGenerator;
exports.createRouteTypeGenerator = createRouteTypeGenerator;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=RouteTypeGenerator.cjs.map
