import processWeb from "./processWeb";
const plugin = (options) => ({
    name: "ccc3x-proxy",
    setup: (api) => {
        const { context } = api;
        const { command, commandArgs } = context;
        if (command !== "start")
            return;
        if (commandArgs.target === "web")
            processWeb(api, options);
    },
});
export default plugin;
//# sourceMappingURL=index.js.map