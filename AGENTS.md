# AGENTS.md

`未授权访问 / ACCESS DENIED` —— 在 [win11React](https://github.com/blueedgetechno/win11React) 的桌面框架上套了一层互动叙事（ARG）。
React 18 + Redux（`createStore`，无 middleware）+ Vite 3 + Sass；`src-tauri/` 是可选的桌面打包壳。
无后端，所有状态在前端；不要为剧情引入重型依赖或外部服务。

故事是《石桥》：玩家是接单的 IT 外包，去石桥库区回收一台测绘工作站。

## Commands

`node` 通常不在 PATH 上。仓库自带便携版 Node（`.tools/node-v22.23.4-win-x64`，被 gitignore，只在本机）：

```powershell
. .\scripts\use-node.ps1      # 只影响当前 PowerShell 会话
.\scripts\start-arg.ps1       # 起 dev server
```

PowerShell 里把下面的 `npm` 写成 `npm.cmd`（`npm.ps1` 可能被执行策略拦住）。

- `npm start` — Vite dev server，http://localhost:5173/
- `npm run build` — 输出到 `build/`（被 gitignore，不要手改）
- `npm run prettier` — 没有 prettier 配置，存量差异很大；只格式化自己改的文件，不要全仓重排
- 没有 `test` / `lint` / `typecheck` 脚本。改完只用 `npm run build` 验证
- `npm run tauri dev` 不可用：`src-tauri/tauri.conf.json` 的 `beforeDevCommand` 是 `npm run dev`，这个脚本不存在

## Deploy

push 到 `main` 会触发 `.github/workflows/deploy.yml`，以 `VITE_BASE=/<repo>/` 构建并发到 GitHub Pages
（线上：https://Xiaodu2638.github.io/Access-Denied/）。
本地验证子路径：`$env:VITE_BASE='/Access-Denied/'; npm.cmd run build`。
`public/404.html` 会被 Pages 在任意深度返回，样式和脚本必须自包含。

## 内容与代码的边界

剧情文案、文件名、终端输出、网页、邮件、聊天全部在 `src/data/arg/*.js`，统一从
`src/data/arg/index.js` 导出（新增数据文件要加一行 `export *`）。组件不硬编码剧情 —— 改文案只动数据层。

- `config.js` — 品牌、时间线、机器表、回收码、shell 列表、交接盘
- `files.js` — 双主机文件树（含官方/私人标记、`requires`、`hidden`、`plate`、`readFlag`）
  与 `getHost / nodeOf / availableChildren / pathOf / displayPath / contentOf / collectFiles`
- `prologue.js` — 玩家本机的桌面图标、本地文件夹、邮件、RDP 机器列表
- `browser.js` — 院 OA、网页邮箱（含定时草稿）、资产平台、本地新闻
- `remote.js` — 调度聊天、资产盘点、分区、回收工具文案、回收站录音
- `endings.js` — `outcomeOf()`、回执邮件、本机新闻稿
- `notifications.js` / `terminal.js` — 通知与终端文案

新增进度标记时同步改 `createDefaultProgress()`（`src/data/arg/index.js`）。

进度只能通过 `ARG_*` action 改（`src/reducers/arg.js`）。不要给组件加本地进度 state，
否则刷新和结局判定会不同步。

## 叙事约束

- 不写提示、不写指令式文案；线索只能靠玩家主动发现。
- 通知只陈述真实状态，不做引导。
- 结局在桌面里发生：擦除后窗口收起、回到玩家本机、回执在收件箱里。不要用文字总结面板。
- 玩家是外包，不是测绘员，也不是调查者。终端只是可选的查看方式，不承担解谜。
- 普通文件操作和邮件操作本身就是选择（复制到 Z: / 发送 / 取消 / 直接回收 / 断开）。

## 不要"修"的设计

- 进度只存在 `src/utils/arg.js` 的模块级变量里，刷新即从引子重开。
  `ARG_STORAGE_KEY` 只是历史命名，**刻意不写 localStorage**；不要加持久化。
- `arg.phase` 是 `prologue | remote | aftermath`，只有这三个值。
- 四种结果由 `outcomeOf()` 从实际状态推出，**没有选择菜单**：
  `official`（只交正式成果）、`private`（交接盘里有 `private` 文件）、
  `empty`（回收了但没交文件）、`unrecovered`（没跑回收就断开）。
- 离开 `remote` 会销毁未发送的草稿（`ARG_PHASE` 里写 `mailDestroyed`）。已发送的不受影响。
- 定时邮件使用真实倒计时，时长是 `timeline.mailWindowMinutes`。
- RDP 密码与回收码是不同的东西，都只做字符串比对，没有任何哈希或谜题。
- 本机与远程是两台机器：`Prologue` 是玩家本机，`state.apps` + 真实桌面是远程机。

## 结构要点

`src/App.jsx` 按 `arg.phase` 渲染：`phase !== "remote"` → `Prologue`（玩家本机，覆盖真实 UI）；
`phase === "remote"` → `ArgNotification` + `RemoteLayer`（连接栏、调度聊天、邮件倒计时）。

`RemoteLayer.jsx` 负责断开与定时邮件的到点发送。`ArgNotification.jsx` 只在
`phase === "remote" && host` 时排期。

引子有自己的一套 shell：任务栏、开始菜单、窗口拖动/吸附/层级全在 `src/components/arg/Prologue.jsx`，
窗口内容在 `PrologueWindows.jsx`。改引子不要去动 `src/components/start` / `src/components/taskbar`
—— 那是远程桌面/通关后的真实桌面。引子不经过 `state.apps`。

真实桌面应用由 `state.apps` 驱动，**key 是图标文件名**（`defState[allApps[i].icon]`），
组件里写死 `useSelector((s) => s.apps.explorer)` / `s.apps.notepad` / `s.apps.bin0` /
`s.apps.taskmanager`（资产盘点）/ `s.apps.settings`（分区修复）/ `s.apps.security`（回收工具）。
改 `src/utils/apps.js` 的 `icon` 必须同步改所有 selector 和 `public/img/icon/` 文件名，否则窗口永远打不开。
`src/reducers/apps.js` 顶部把所有应用默认设成浮动窗口（`min(820px, 82vw)` × `min(560px, 72vh)`），
并提供 `APPS_HIDE_ALL` 用于切换资产 / 断开时收起窗口。

`data-action`：全大写直接进 redux（匹配 app 的 `action`，如 `NOTEPAD` / `MSEDGE` / `TERMINAL` /
`RECYCLE` / `ASSET` / `PARTITION` / `RETIRE`）；混合大小写会被当成 `src/actions/index.js` 里的函数名调用。
只有两处实现这条规则 —— 上下文菜单 `src/components/menu/index.jsx` 和任务栏/开始菜单
`src/components/start/index.jsx`。新增应用要同时给 `utils/apps.js` 条目和
`containers/applications/index.jsx` 的 `export *`。

## 资源与文件系统

`vite.config.js` 的 `base` 取 `VITE_BASE`，默认空；部署时是 `/<repo>/`。
JSX/SCSS 里写死的图片路径必须是相对形式（`img/icon/x.png`），`/img/...` 不会经过 Vite 重写，
部署到子路径会 404。图标在 `public/img/icon/<id>.png`（多数 64×64）。

没有美术素材。照片与远程桌面壁纸都是内联 SVG（`src/components/arg/Plates.jsx`：
`valley / school / flooded / night / default`）。不要新增图片、音频、视频文件。

文件管理器读 `src/data/arg/files.js` 归一化后的 `fileSystem`。
`data` 里写在 `C:` 下面的盘符节点（如 `D:`）会被 `buildHost` 提升为同级根节点，
所以路径是 `D:\我的测绘`，不是 `C:\D:\我的测绘`。

- `requires: "partitionMounted"` 的节点在分区修复前不出现（D: 整个不显示）。
- `hidden: true` 的节点默认不出现，文件管理器要开「显示隐藏项目」，终端要 `dir /a`。
- `private: true` 决定 `outcomeOf()` 是否判为私人交接。
- `readFlag` 是打开该文件时点亮的进度标记，组件不按文件名判断。

`Z:` 只在 `hostId === "chenmo"` 时出现，内容是 `handoverReadme` + `arg.handover`。

`public/arg/linche.mp4` 不存在，也不要用；回收站已改成转录播放器（无音频文件）。
