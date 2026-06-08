# Codex Token Listener

Codex Token Listener 是一个本地 Electron 桌面窗口，用来监听 Codex Desktop 写入的 `token_count` 事件，并展示账号额度与滚动 token 消耗。

## 功能

- 实时展示当前 Codex 账号额度剩余百分比、已用百分比和重置时间。
- 统计最近 1 小时、最近 24 小时、最近 30 天的 token 消耗。
- 展示当前会话累计 token、最近 token 事件和监听状态。
- 只解析本地 `token_count` 元数据，不读取认证文件，也不展示 prompt 或回复正文。
- 支持桌面烟测，自动启动窗口并生成截图。

## 安装

```powershell
npm install
```

首次安装 Electron 在国内网络下如果下载慢，可以临时使用镜像：

```powershell
$env:ELECTRON_MIRROR='https://npmmirror.com/mirrors/electron/'
npm install
```

## 运行

```powershell
npm start
```

## 验证

```powershell
npm run build
npm run smoke
```

烟测会启动桌面窗口、读取真实本机 Codex 数据、生成 `artifacts/smoke.png`，然后自动退出。

## 项目结构

```text
src/
  main/       Electron 主进程、本地扫描、聚合和 IPC
  renderer/   React 桌面界面、组件、样式和 hooks
  shared/     主进程与渲染层共享的数据类型
```

## 数据口径

- 数据来源：`%USERPROFILE%\.codex\sessions` 下的 Codex rollout JSONL 文件。
- 只解析 `token_count` 事件，不读取或展示 prompt、回复正文、认证文件。
- 最近 1 小时、最近 24 小时、最近 30 天：按事件时间滚动统计 `last_token_usage.total_tokens`。
- 当前账号额度：来自最新 `token_count` 事件里的 `rate_limits.primary.used_percent`，界面展示剩余百分比与重置时间。
- 本地事件没有暴露绝对总额度 token 数，因此工具不伪造总额度，只展示 Codex 当前提供的百分比信号。

## 开发规范

- TypeScript 严格模式。
- 主进程、渲染层、共享类型分层存放。
- 导出的类、函数和组件保留 JSDoc 注释。
- 单个源码文件控制在 200 行以内。

## 常见问题

如果界面显示未发现事件，请先确认 Codex Desktop 已经产生过至少一次 `token_count` 事件。可以在 Codex 中继续一次对话后点击刷新按钮。
