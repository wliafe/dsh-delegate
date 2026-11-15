# 派活 · dsh-delegate

DeepSeek Harness（DSH）的一个插件：命中指定工作目录的**根会话**被收成「调度者」，只保留派活类工具，实际执行交给持久子会话。

## 它做什么

- 给该会话注入一段系统提示，要求它只派活、把执行交给子会话。
- 固定保留 7 个工具：派活 `list_agents`、`send_message`、`subagent`，定时 `schedule_create`、`schedule_edit`、`schedule_list`、`schedule_view`。其它工具默认对该会话不可用，需要放行的通过配置项 `keepTools` 追加。
- 只作用于根会话，且会话工作目录等于配置目录之一、或在其子目录下（`/data` 不命中 `/data-backup`）。
- 子会话不受此限制，照常使用全部工具。

## 安装

```sh
dsh plugin --profile <profile> add github:wliafe/dsh-delegate
```

在源码仓库里开发时，改完用 `node scripts/sync.mjs` 同步到 profile；宿主改动关/开插件，页面改动刷新浏览器。

## 配置

| 字段 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `directories` | `string[]` | `[]` | 命中的工作目录。空表示全部不生效。 |
| `idleDays` | `number` | `14` | 子会话闲置多少天后从列表隐藏。最小 1。 |
| `skipScheduled` | `boolean` | `true` | 定时任务投递到的会话不接管，照常使用全部工具。 |
| `keepTools` | `string[]` | `[]` | 在固定 7 个之外，额外要放行的工具名（如 IM 的 `dsh_im_return_file`）。 |

- 配置存在 `<profile>/cordis.patch.yml` 里 `include:delegate` 条目的 `config` 下。
- 设置界面在 **设置 → 派活**（设置弹窗左侧导航里的一节）；「额外保留的工具」一节对应 `keepTools`。
- 也可以直接 `POST /delegate/config`，JSON 就是上面四个字段。

## 行为细节

- 新建子会话必须带明确名字：1–32 位小写字母/数字/连字符、以字母开头；不能叫 `lead`，也不能用 `agent-1` 这类默认名。
- 子会话超过 `idleDays` 天没收到主会话消息，就从 `list_agents` 结果里隐藏。只是隐藏：会话文件仍在磁盘，名字仍被占用，列表里也难再找回。
- 子智能体属于创建它的那个主会话树，不同主会话之间不能共用。

## 子会话的局限

新建的子会话每次是全新上下文，不记得上一次做过什么。它适合「执行」，不适合需要连续记忆的工作。

## 关闭与回滚

- 在插件管理里停用（或关闭）`include:delegate` 条目；或从 `<profile>/cordis.patch.yml` 删掉 `id: delegate` 那段。
- 停用插件会卸载它，撤销已加的提示与工具屏蔽，已接管会话当场恢复全部工具。
- 只手动改 `cordis.patch.yml` 删条目，要重载/重启宿主后才生效；重载前旧会话仍受限。

## 故障排查

- 插件没生效：在插件管理里看 `include:delegate` 的 `fiberPhase` 是否 `active`；或访问 `GET /delegate/config`，应返回 JSON。
- 工具突然不可用：多半是当前会话被接管了，去「设置 → 派活」确认 `directories` 是否命中它的工作目录。

## 许可证与仓库

MIT。仓库：https://github.com/wliafe/dsh-delegate
