# AGENTS.md

`未授权访问 / ACCESS DENIED` —— 在 [win11React](https://github.com/blueedgetechno/win11React) 的桌面框架上套了一层互动叙事（ARG）。
React 18 + Redux（`createStore`，无 middleware）+ Vite 3 + Sass；`src-tauri/` 是可选的桌面打包壳。
无后端，所有状态在前端；不要为剧情引入重型依赖或外部服务。

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

剧情文案、文件名、终端输出、结局全部在 `src/data/arg/*.js`，统一从 `src/data/arg/index.js` 导出
（新增数据文件要加一行 `export *`）。组件不硬编码剧情 —— 改文案只动数据层。

新增进度标记时同步改 `createDefaultProgress()`（`src/data/arg/index.js`）；
`isUnlocked()` / `visibleDiaryEntries()` / `collectTrail()` 都按 flag 名取内容。

进度只能通过 `ARG_*` action 改（`src/reducers/arg.js`）。不要给组件加本地进度 state，
否则刷新和结局判定会不同步。

## 叙事约束

- 不写提示、不写指令式文案；线索只能靠玩家主动发现，且不能藏在它自己要打开的那把锁后面。
- 通知只陈述真实状态，不做引导。
- 结局在桌面里发生，由 `endings.js` 的 `steps` 改桌面/锁屏，不要用文字总结面板。
- `session.js` 只能放在 `linche-agent` 仓库里，不要加到主角桌面。
- 锁屏不解释谜题、不泄露答案。

## 不要"修"的设计

- 进度只存在 `src/utils/arg.js` 的模块级变量里，刷新即从引子重开。
  `ARG_STORAGE_KEY` 只是历史命名，**刻意不写 localStorage**；不要加持久化。
- RDP 凭据框和锁屏都用 `fnv1a32` 比对 `config.js` 的 `puzzle.answerHash`；
  终端 `unlock` 用的是另一个密钥（`terminal.js` 的 `unlockKey`）。两者故意不同，别合并。
- `rdpAuthed` 为真时锁屏只做交接、不再问密码（`containers/background/index.jsx`）；
  `postEnding` 为真时故意不再自动解锁。这是剧情，不是 bug。

## 结构要点

`src/App.jsx` 按 `state.arg` 叠三层覆盖层：`!flags.prologueSeen` → `Prologue`（完整假桌面，覆盖真实 UI），
`flags.prologueSeen && booted && !locked && !ending` → `ArgNotification`，`arg.ending` → `Ending`。

引子有自己的一套 shell：任务栏、开始菜单、窗口拖动/吸附/层级全在 `src/components/arg/Prologue.jsx`，
窗口内容在 `PrologueWindows.jsx`。改引子不要去动 `src/components/start` / `src/components/taskbar`
—— 那是通关后的真实桌面。引子不经过 `state.apps`。

真实桌面应用由 `state.apps` 驱动，**key 是图标文件名**（`defState[allApps[i].icon]`），
组件里写死 `useSelector((s) => s.apps.notepad)` / `s.apps.bin0` / `s.apps.code`。
改 `src/utils/apps.js` 的 `icon` 必须同步改所有 selector 和 `public/img/icon/` 文件名，否则窗口永远打不开。
`src/reducers/apps.js` 顶部把所有应用默认设成浮动窗口（`min(820px, 82vw)` × `min(560px, 72vh)`）。

`data-action`：全大写直接进 redux（匹配 app 的 `action`，如 `NOTEPAD` / `MSEDGE` / `TERMINAL` /
`RECYCLE` / `DONTRUN`）；混合大小写会被当成 `src/actions/index.js` 里的函数名调用。
只有两处实现这条规则 —— 上下文菜单 `src/components/menu/index.jsx` 和任务栏/开始菜单
`src/components/start/index.jsx`。新增应用要同时给 `utils/apps.js` 条目和
`containers/applications/index.jsx` 的 `export *`。

## 资源与文件系统

`vite.config.js` 的 `base` 取 `VITE_BASE`，默认空；部署时是 `/<repo>/`。
JSX/SCSS 里写死的图片路径必须是相对形式（`img/icon/x.png`），`/img/...` 不会经过 Vite 重写，
部署到子路径会 404。图标在 `public/img/icon/<id>.png`（多数 64×64）。

文件管理器读 `src/data/arg/files.js` 归一化后的 `fileSystem`。
`locked: true` + `unlockFlag` 的目录在 `canAccess()` 通过前不显示内容（目录本身仍显示）；
`hidden: true` 的节点默认不出现，文件管理器要开「显示隐藏项目」，终端要 `ls -a`。

`public/arg/linche.mp4` 没有提供，回收站会降级成字幕/占位，不是播放器坏了。
