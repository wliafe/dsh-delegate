# 派活 · dsh-delegate

DeepSeek Harness（DSH）的一个插件：**命中工作目录的主会话只负责派活，不自己动手。**

长时间埋头干活的主会话容易顾不上回用户。这个插件让指定目录下的根会话退成"调度者"——保留派活和定时任务的工具，把实际执行交给持久子会话。

## 行为

- **目录命中**：只有会话的工作目录等于配置目录之一、或在其子目录下时才生效（`/data` 不会命中 `/data-backup`）。只作用于根会话，子会话不再套一层。
- **收窄工具**：命中后，除下列工具外逐一挡掉：
  `list_agents`、`send_message`、`subagent`、`schedule_create`、`schedule_edit`、`schedule_list`、`schedule_view`。
- **强制起名**：新建子会话必须显式给 `name`，1–32 位小写字母/数字/连字符、以字母开头，不能叫 `lead`，也不能用 `agent-1` 这种默认名。
- **闲置清理**：子会话超过 `idleDays` 天没被主会话发过消息，就从 `list_agents` 结果里隐去（没有活动记录的新会话不会被误伤）。
- **设置页**：在「设置 → 派活」里配工作目录（一行一个，留空即全关）和闲置天数。

## 配置

| 字段 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `directories` | `string[]` | `[]` | 命中的工作目录。空表示全关。 |
| `idleDays` | `number` | `14` | 子会话闲置多少天后从列表隐去。最小 1。 |

设置页通过宿主端路由 `GET/POST /delegate/config` 读写，写回走平台 `configEditor`，因此宿主策略读到的始终是同一份平台配置。

## 安装

作为本地 bundle 装进某个 profile：

```sh
# 在目标 profile 的目录里，把包作为依赖安装并列入 bundles
pnpm add dsh-delegate@file:/path/to/dsh-delegate --offline --ignore-scripts
```

并在该 profile 的 `package.json` 的 `dsh.profile.bundles` 里加上 `dsh-delegate`。`cordis.patch.yml` 会插入一个 `id: delegate` 入口，默认关闭（目录为空）。

## 开发

浏览器半边（`client.js`）必须打成官方 `clientBundle` 的惰性 CJS 工厂格式，否则页面不会加载它。该预设未随发布包提供，`tsdown.config.ts` 复刻了一份：把平台共享模块外置，其余内联，并用 `window.__ModuleLoader__.load` 包裹。

```sh
pnpm install
./node_modules/.bin/tsdown        # 产出 lib/client.js
```

> 直接 `pnpm exec tsdown` 会因为 pnpm 去解析未发布的 `@deepseek-ai/dsh-type-meta` 而报 404，改用 `./node_modules/.bin/tsdown`。

## 结构

- `index.js` — 宿主侧插件：工具收窄、起名守卫、闲置隐藏、配置路由。
- `policy.js` — 纯函数：目录命中、名字校验、过期判断，便于单独测试。
- `client.js` → `lib/client.js` — 设置侧边栏一节（构建产物）。
- `cordis.patch.yml` — bundle 插入的默认入口。
- `locale/` — 中英文显示名与描述。

## License

MIT
