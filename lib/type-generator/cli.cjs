#!/usr/bin/env node
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
var commander = require('commander');
var RouteTypeGenerator = require('./RouteTypeGenerator.cjs');

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

async function loadConfig(configPath) {
  const resolvedPath = path__namespace.resolve(configPath);
  if (!fs__namespace.existsSync(resolvedPath)) {
    return null;
  }
  try {
    const config = await import(resolvedPath);
    return config.default || config;
  } catch (error) {
    console.error(`Failed to load config file: ${error}`);
    return null;
  }
}
function mergeConfig(fileConfig, cliConfig) {
  const {
    configFile,
    ...cliOptions
  } = cliConfig;
  return {
    ...fileConfig,
    ...Object.fromEntries(Object.entries(cliOptions).filter(([_, value]) => value !== void 0))
  };
}
commander.program.name("route-type-gen").description("Generate TypeScript types for Vue Router routes").version("1.0.0");
commander.program.command("generate").alias("gen").description("Generate route types").option("-r, --routes <path>", "Path to routes file", "./src/routes.ts").option("-o, --output-dir <path>", "Output directory", "./src/types").option("-f, --output-file <name>", "Output file name", "route-types.ts").option("--params", "Generate param types", true).option("--no-params", "Do not generate param types").option("--query", "Generate query types", true).option("--no-query", "Do not generate query types").option("--meta", "Generate meta types", true).option("--no-meta", "Do not generate meta types").option("--guards", "Generate guard types", true).option("--no-guards", "Do not generate guard types").option("--strict", "Enable strict mode", false).option("--watch", "Watch for changes", false).option("--enums", "Generate enums", true).option("--no-enums", "Do not generate enums").option("--unions", "Generate union types", true).option("--no-unions", "Do not generate union types").option("-c, --config <path>", "Path to config file").action(async (options) => {
  try {
    let fileConfig = null;
    if (options.configFile) {
      fileConfig = await loadConfig(options.configFile);
      if (!fileConfig) {
        console.warn(`Config file not found: ${options.configFile}`);
      }
    } else {
      const defaultConfigs = ["route-types.config.js", "route-types.config.ts", ".route-typesrc.js", ".route-typesrc.json"];
      for (const configName of defaultConfigs) {
        fileConfig = await loadConfig(configName);
        if (fileConfig) {
          console.log(`Using config file: ${configName}`);
          break;
        }
      }
    }
    const finalConfig = mergeConfig(fileConfig, {
      routesPath: options.routes,
      outputDir: options.outputDir,
      outputFileName: options.outputFile,
      generateParams: options.params,
      generateQuery: options.query,
      generateMeta: options.meta,
      generateGuards: options.guards,
      strictMode: options.strict,
      watch: options.watch,
      generateEnums: options.enums,
      generateUnions: options.unions
    });
    const generator = new RouteTypeGenerator.RouteTypeGenerator(finalConfig);
    await generator.generate();
    if (!options.watch) {
      await generator.generateDeclaration();
    }
    console.log("\u2705 Type generation completed successfully!");
  } catch (error) {
    console.error("\u274C Type generation failed:", error);
    process.exit(1);
  }
});
commander.program.command("clean").description("Clean generated files").option("-o, --output-dir <path>", "Output directory", "./src/types").option("-f, --output-file <name>", "Output file name", "route-types.ts").action((options) => {
  try {
    const generator = new RouteTypeGenerator.RouteTypeGenerator({
      outputDir: options.outputDir,
      outputFileName: options.outputFile
    });
    generator.clean();
    console.log("\u2705 Clean completed successfully!");
  } catch (error) {
    console.error("\u274C Clean failed:", error);
    process.exit(1);
  }
});
commander.program.command("watch").description("Watch routes file and regenerate types on change").option("-r, --routes <path>", "Path to routes file", "./src/routes.ts").option("-o, --output-dir <path>", "Output directory", "./src/types").option("-f, --output-file <name>", "Output file name", "route-types.ts").option("-c, --config <path>", "Path to config file").action(async (options) => {
  try {
    let fileConfig = null;
    if (options.configFile) {
      fileConfig = await loadConfig(options.configFile);
    }
    const finalConfig = mergeConfig(fileConfig, {
      routesPath: options.routes,
      outputDir: options.outputDir,
      outputFileName: options.outputFile,
      watch: true
    });
    const generator = new RouteTypeGenerator.RouteTypeGenerator(finalConfig);
    await generator.generate();
    console.log("\u{1F440} Watching for changes... Press Ctrl+C to stop.");
    process.on("SIGINT", () => {
      generator.stopWatcher();
      console.log("\n\u{1F44B} Bye!");
      process.exit(0);
    });
  } catch (error) {
    console.error("\u274C Watch failed:", error);
    process.exit(1);
  }
});
commander.program.command("init").description("Initialize configuration file").option("-t, --type <type>", "Config file type (js, ts, json)", "js").action((options) => {
  const configContent = {
    js: `/**
 * \u8DEF\u7531\u7C7B\u578B\u751F\u6210\u5668\u914D\u7F6E\u6587\u4EF6
 * @type {import('@ldesign/router').RouteTypeGeneratorOptions}
 */
module.exports = {
  // \u8DEF\u7531\u6587\u4EF6\u8DEF\u5F84
  routesPath: './src/routes.ts',
  
  // \u8F93\u51FA\u76EE\u5F55
  outputDir: './src/types',
  
  // \u8F93\u51FA\u6587\u4EF6\u540D
  outputFileName: 'route-types.ts',
  
  // \u751F\u6210\u9009\u9879
  generateParams: true,
  generateQuery: true,
  generateMeta: true,
  generateGuards: true,
  generateEnums: true,
  generateUnions: true,
  
  // \u4E25\u683C\u6A21\u5F0F
  strictMode: false,
  
  // \u76D1\u542C\u6587\u4EF6\u53D8\u5316
  watch: false,
  
  // \u81EA\u5B9A\u4E49\u8F6C\u6362\u5668
  customTransformers: [],
  
  // \u6A21\u677F\u914D\u7F6E
  templates: {
    // header: '// Custom header',
    // footer: '// Custom footer'
  }
}
`,
    ts: `/**
 * \u8DEF\u7531\u7C7B\u578B\u751F\u6210\u5668\u914D\u7F6E\u6587\u4EF6
 */
import type { RouteTypeGeneratorOptions } from '@ldesign/router'

const config: RouteTypeGeneratorOptions = {
  // \u8DEF\u7531\u6587\u4EF6\u8DEF\u5F84
  routesPath: './src/routes.ts',
  
  // \u8F93\u51FA\u76EE\u5F55
  outputDir: './src/types',
  
  // \u8F93\u51FA\u6587\u4EF6\u540D
  outputFileName: 'route-types.ts',
  
  // \u751F\u6210\u9009\u9879
  generateParams: true,
  generateQuery: true,
  generateMeta: true,
  generateGuards: true,
  generateEnums: true,
  generateUnions: true,
  
  // \u4E25\u683C\u6A21\u5F0F
  strictMode: false,
  
  // \u76D1\u542C\u6587\u4EF6\u53D8\u5316
  watch: false,
  
  // \u81EA\u5B9A\u4E49\u8F6C\u6362\u5668
  customTransformers: [],
  
  // \u6A21\u677F\u914D\u7F6E
  templates: {
    // header: '// Custom header',
    // footer: '// Custom footer'
  }
}

export default config
`,
    json: `{
  "routesPath": "./src/routes.ts",
  "outputDir": "./src/types",
  "outputFileName": "route-types.ts",
  "generateParams": true,
  "generateQuery": true,
  "generateMeta": true,
  "generateGuards": true,
  "generateEnums": true,
  "generateUnions": true,
  "strictMode": false,
  "watch": false
}
`
  };
  const fileNames = {
    js: "route-types.config.js",
    ts: "route-types.config.ts",
    json: ".route-typesrc.json"
  };
  const fileName = fileNames[options.type] || fileNames.js;
  const content = configContent[options.type] || configContent.js;
  try {
    fs__namespace.writeFileSync(fileName, content, "utf-8");
    console.log(`\u2705 Config file created: ${fileName}`);
  } catch (error) {
    console.error("\u274C Failed to create config file:", error);
    process.exit(1);
  }
});
commander.program.parse(process.argv);
if (!process.argv.slice(2).length) {
  commander.program.outputHelp();
}
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=cli.cjs.map
