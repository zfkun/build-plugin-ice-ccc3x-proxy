import { DEFAULT_PROXY_CONTEXT, DEFAULT_PROXY_TARGET } from "./config";
import { PluginOptions } from "./types";
import { parseConfigFile } from "./utils";

export default (api, options: PluginOptions) => {
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
