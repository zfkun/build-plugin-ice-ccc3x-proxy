interface IConfig {
    proxy?: boolean;
    allowedHosts?: string;
    proxyTarget?: string;
    proxyContext?: string[];
}
export declare const parseConfigFile: (rootDir: any) => IConfig | undefined;
export {};
