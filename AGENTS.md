# AGENTS.md

`未授权访问 / ACCESS DENIED` —— 在 [win11React](https://github.com/blueedgetechno/win11React) 的桌面框架上套了一层互动叙事（ARG）。
React 18 + Redux（`createStore`，无 middleware）+ Vite 3 + Sass；`src-tauri/` 是可选的桌面打包壳。

## Commands

`node` 通常不在 PATH 上，仓库自带便携版 Node：先加载 `.\scripts\use-node.ps1`（或直接 `.\scripts\start-arg.ps1` 起服务）。

- `npm start` — Vite dev server，http://localhost:5173/
- `npm run build` — 输出到 `build/`（被 `.gitignore` 忽略，不要手改里面任何文件）
- `npm run prettier` — `prettier --write .`；CI（`.github/workflows/prettier.yml`）会在 push 后自动格式化并提交，所以本地 `--check` 本来就有大量存量差异，不要顺手重排无关文件
- 没有 `test` / `lint` / `typecheck` 脚本。改完只用 `npm run build` 验证
- `npm run tauri dev` 不可用：`src-tauri/tauri.conf.json` 的 `beforeDevCommand` 写的是不存在的 `npm run dev`

## 内容与代码的边界

剧情文案、文件名、终端输出、结局全部在 `src/data/arg/*.js`，统一从 `src/data/arg/index.js` 导出。组件不硬编码剧情 —— 改文案只动数据层。

新增进度标记时同步改 `createDefaultProgress()`（`src/data/arg/index.js`）；`isUnlocked()` / `visibleDiaryEntries()` / `collectTrail()` 都按 flag 名取内容。

## 不要"修"的两处设计

- 进度只存在 `src/utils/arg.js` 的模块级变量里，刷新即从引子重开。`ARG_STORAGE_KEY` 只是历史命名，**刻意不写 localStorage**（见 `src/data/arg/config.js` 注释）。
- 锁屏密码用 `fnv1a32` 哈希比对（`config.js` 的 `puzzle.answerHash`），终端 `unlock` 用的是另一个密钥（`terminal.js` 的 `unlockKey`）。两者故意不同，别合并。

## 结构要点

`src/App.jsx` 按 `state.arg` 叠三层覆盖层：`!flags.prologueSeen` → `Prologue`（完整假桌面，覆盖真实 UI），`flags.prologueSeen && booted && !locked && !ending` → `ArgNotification`，`arg.ending` → `Ending`。引子里的窗口是 `src/components/arg/PrologueWindows.jsx` 的模拟窗口，靠 `state.arg.flags.rdpAuthed` 交接给锁屏，不经过 `state.apps`。

真实桌面应用由 `state.apps` 驱动，**key 是图标文件名**（`defState[allApps[i].icon]`），组件里写死 `useSelector((s) => s.apps.notepad)` / `s.apps.bin0` / `s.apps.code` 这类取值。改 `src/utils/apps.js` 的某个 `icon` 就必须同步改所有 selector 和 `public/img/icon/` 文件名，否则窗口永远打不开。

`data-action` 走两条路（`src/actions` 的 `clickDispatch`）：全大写去 redux（匹配 app 的 `action`，如 `NOTEPAD` / `MSEDGE` / `TERMINAL` / `RECYCLE` / `DONTRUN`），混合大小写调用 `src/actions/index.js` 里同名函数。新增应用要同时给 `utils/apps.js` 条目和 `containers/applications/index.jsx` 的 `export *`。

## 资源

`vite.config.js` 用了 `base: ""`，JSX/SCSS 里的图片路径必须是相对形式（`img/icon/x.png`），写成 `/img/...` 会在部署子路径下 404。图标按文件名放在 `public/img/icon/<id>.png`（多数 64×64）。

文件管理器读的是 `src/data/arg/files.js` 归一化后的 `fileSystem`；`info.locked: true` + `unlockFlag` 的目录在 `canAccess()` 通过前不显示内容（目录本身仍显示）。
