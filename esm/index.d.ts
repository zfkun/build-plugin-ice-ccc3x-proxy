import type { Plugin } from "@ice/app/types";
interface IConfig {
    proxy?: boolean;
    allowedHosts?: string;
    proxyTarget?: string;
    proxyContext?: string[];
}
export declare const parseConfigFile: (rootDir: any) => IConfig | undefined;
interface PluginOptions {
    proxy?: boolean;
    proxyTarget?: string;
    proxyContext?: string[];
    allowedHosts?: string[];
}
declare const plugin: Plugin<PluginOptions>;
export default plugin;
