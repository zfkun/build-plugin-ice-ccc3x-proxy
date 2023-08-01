## @hoowu/build-plugin-ice-ccc3x-proxy

ICE 项目 Web 应用 的 CocosCreator 3.x 游戏开发 集成代理插件

插件默认会开启以下能力:

- **Web 应用** 自动注入代理目标地址环境变量 `process.env.REMOTE_GAME_SERVER`

> **默认值:** `http://localhost:7456`
>
> **注意：** 插件只会在开发调试时生效，不用担心对生产环境造成影响。

### 安装

```bash
$ npm install @hoowu/build-plugin-ice-ccc3x-proxy
```

### 配置

在 `ice.config.mts` 中进行以下配置：

```diff
import { defineConfig } from "@ice/app";
import ccc3x from "@hoowu/build-plugin-ice-ccc3x-proxy";

export default defineConfig(() => ({
  plugins: [
+   ccc3x(),
  ],
}));
```

#### 禁用代理

```diff
import { defineConfig } from "@ice/app";
import ccc3x from "@hoowu/build-plugin-ice-ccc3x-proxy";

export default defineConfig(() => ({
  plugins: [
    ccc3x({
+     proxy: false
    }),
  ],
}));
```

#### 修改代理地址

```diff
import { defineConfig } from "@ice/app";
import ccc3x from "@hoowu/build-plugin-ice-ccc3x-proxy";

export default defineConfig(() => ({
  plugins: [
    ccc3x({
+     proxyTarget: "http://192.168.1.17:7456"
    }),
  ],
}));
```

#### 修改代理规则

```diff
import { defineConfig } from "@ice/app";
import ccc3x from "@hoowu/build-plugin-ice-ccc3x-proxy";

export default defineConfig(() => ({
  plugins: [
    ccc3x({
+     proxyContext: ["/aaa", "/bbb"]
    }),
  ],
}));
```

#### 修改代理白名单

```diff
import { defineConfig } from "@ice/app";
import ccc3x from "@hoowu/build-plugin-ice-ccc3x-proxy";

export default defineConfig(() => ({
  plugins: [
    ccc3x({
+     allowedHosts: ["a.com", "sub.a.com", "b.com"]
    }),
  ],
}));
```

### 自定义配置

项目根目录下 `.cc3x.json` 文件, 定义的配置会强制覆盖 `ice.config.mts` 中的配置, 即优先级更高

比如:

```json
{
  "proxy": true,
  "proxyTarget": "http://192.168.1.17:7456",
  "proxyContext": ["/aaa", "/bbb"],
  "allowedHosts": ["a.com", "sub.a.com", "b.com"]
}
```
