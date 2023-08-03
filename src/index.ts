import { resolve as pathResolve } from "node:path";
import {
  accessSync as fsAccessSync,
  constants,
  existsSync as fsExistsSync,
  readFileSync as fsReadFileSync,
} from "node:fs";

import type { Plugin } from "@ice/app/types";

const PLUGIN_NAME = "@hoowu/build-plugin-ice-ccc3x-proxy";

// IDE 本地预览地址 (浏览器模式)
const DEFAULT_PROXY_TARGET = "http://localhost:7456";

// 资源代理规则列表
const DEFAULT_PROXY_CONTEXT = [
  // 2.x 支持
  "/preview-scripts",
  "/app",
  "/boot.js",
  "/preview-scene",

  // 预览器
  "/preview-app",

  // 基础
  "/settings",
  "/socket.io",
  "/scripting",
  "/query-extname",

  // 资源
  "/scene",
  "/assets",

  // 插件
  "/plugins",
];

interface IConfig {
  proxy?: boolean;
  allowedHosts?: string;
  proxyTarget?: string;
  proxyContext?: string[];
}

const readConfigSync = (file) => {
  let json;

  try {
    fsAccessSync(file, constants.R_OK);
    const body = fsReadFileSync(file, { encoding: "utf8" });
    json = JSON.parse(body);
  } catch (e) {
    console.error(`无法读取 ${file}: ${e.message}`);
  }

  return json;
};

export const parseConfigFile = (rootDir): IConfig | undefined => {
  const configPath = pathResolve(rootDir, ".cc3x.json");
  if (fsExistsSync(configPath)) {
    console.info(
      "[plugin-ccc3x-proxy] 检测到 自定义配置 (.cc3x.json) 文件, 尝试自动读取解析"
    );

    const c = readConfigSync(configPath);
    if (c) {
      const config: IConfig = {};

      if (typeof c.proxy === "boolean") config.proxy = c.proxy;
      if (typeof c.allowedHosts === "string" && c.allowedHosts)
        config.allowedHosts = c.allowedHosts;
      if (typeof c.proxyTarget === "string" && c.proxyTarget)
        config.proxyTarget = c.proxyTarget;
      if (Array.isArray(c.proxyContext) && c.proxyContext.length > 0)
        config.proxyContext = c.proxyContext.map((v) => v.toString());

      console.info(
        "[plugin-ccc3x-proxy] 自定义配置 (.cc3x.json) 解析结果: ",
        config
      );
      return config;
    }
  }
};

const processWeb = (api, options: PluginOptions) => {
  const { context, onGetConfig } = api;
  const { rootDir } = context;

  let {
    proxy = true,
    allowedHosts = "all",
    proxyTarget = DEFAULT_PROXY_TARGET,
    proxyContext = DEFAULT_PROXY_CONTEXT,
  } = options || {};

  const config = parseConfigFile(rootDir);
  if (config) {
    console.info("[plugin-ccc3x-proxy] 存在 自定义配置文件 尝试合并", config);

    if ("proxy" in config) {
      console.info(
        "[plugin-ccc3x-proxy] 合并 自定义配置 (proxy):",
        proxy,
        config.proxy
      );
      proxy = config.proxy;
    }

    if ("allowedHosts" in config) {
      console.info(
        "[plugin-ccc3x-proxy] 合并 自定义配置 (allowedHosts):",
        allowedHosts,
        config.allowedHosts
      );
      allowedHosts = config.allowedHosts;
    }

    if ("proxyTarget" in config) {
      console.info(
        "[plugin-ccc3x-proxy] 合并 自定义配置 (proxyTarget):",
        proxyTarget,
        config.proxyTarget
      );
      proxyTarget = config.proxyTarget;
    }

    if ("proxyContext" in config) {
      console.info(
        "[plugin-ccc3x-proxy] 合并 自定义配置 (proxyContext):",
        proxyContext,
        config.proxyContext
      );
      proxyContext = config.proxyContext;
    }
  }

  if (proxy === false) return;

  if (!proxyTarget) {
    console.error("[plugin-ccc3x-proxy] 代理目标地址 (proxyTarget) 不能为空");
    return;
  }

  onGetConfig((c) => {
    c.define = {
      ...(c.define || {}),
      "process.env.REMOTE_GAME_SERVER": JSON.stringify(proxyTarget),
    };
    console.info(
      "[plugin-ccc3x-proxy] 声明环境变量 process.env.REMOTE_GAME_SERVER => ",
      JSON.stringify(proxyTarget)
    );

    if (!c.devServer) c.devServer = {};

    if (allowedHosts) {
      c.devServer.allowedHosts = allowedHosts;
      console.info("[plugin-ccc3x-proxy] 改写域名白名单: ", allowedHosts);
    }

    if (proxyContext && proxyContext.length > 0) {
      const rule = {
        context: proxyContext,
        target: `${proxyTarget}/`,
        secure: false,
        changeOrigin: true,
      };

      console.info(
        "[plugin-ccc3x-proxy] 注册 CocosCreator 3.x 浏览器预览模式代理策略: ",
        rule
      );

      c.devServer.proxy = [rule];
    }
  });
};

interface PluginOptions {
  proxy?: boolean;
  proxyTarget?: string;
  proxyContext?: string[];
  allowedHosts?: string[];
}

const plugin: Plugin<PluginOptions> = (options) => ({
  name: PLUGIN_NAME,
  setup: (api) => {
    const { context } = api;
    const { command, commandArgs } = context;

    if (command !== "start") return;
    if (commandArgs.target === "web") processWeb(api, options);
  },
  // runtime: `${PLUGIN_NAME}/runtime`,
});

export default plugin;
