# 未授权访问 / ACCESS DENIED

一个基于 [blueedgetechno/win11React](https://github.com/blueedgetechno/win11React) 二次改造的互动叙事（ARG）页面。

保留原项目的桌面、窗口、任务栏、锁屏与开始菜单框架，替换为一条虚构剧情：
开源开发者 **林澈（linche）** 在 **2031-04-19 03:42** 之后失联，
玩家在 **2031-04-22** 收到一封延迟 72 小时发送的邮件，并进入他留下的远程会话。

> 本作品为虚构叙事，人物、组织、日期与事件均为虚构。
> 与原项目、Microsoft 均无关联。

---

## 如何开始

```bash
npm install
npm start
```

开发服务器默认运行在 `http://localhost:5173/`。

生产构建：

```bash
npm run build
```

输出目录为 `build/`（由 `vite.config.js` 的 `build.outDir` 指定）。

---

## 部署到 GitHub Pages

仓库已包含 `.github/workflows/deploy.yml`。推到 `main` 或 `master` 即会构建并发布。

**首次部署前需要做两件事：**

1. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**
2. 推送代码

之后每次 push 会自动构建并部署到 `https://<用户名>.github.io/<仓库名>/`。

工作流会把仓库名作为 `VITE_BASE` 传给构建：

```bash
VITE_BASE=/<仓库名>/ npm run build
```

因为项目站点部署在子路径下，不加 base 会导致 JS/CSS 全部 404。

**本地模拟子路径构建：**

```powershell
$env:VITE_BASE='/access-denied/'
npm run build
```

`public/404.html` 是自包含的（样式与脚本内联），因为 GitHub Pages 会用它在任意深度的缺失路径下响应，相对路径在那里不可靠。

---

## 剧情流程

1. **引子**：主角自己的桌面 → 邮件 → 「会话凭据已附加」→ 连接远程桌面。
2. **锁屏**：远程机器停在 `2031-04-19 03:42`，需要恢复密钥。
3. **桌面**：六个应用 —— 记事本、文件管理器、浏览器、终端、回收站、不要运行。
4. **终端**：`help` / `whoami` / `ls` / `cat` / `git log` / `git status` / `unlock` / `restore` / `open` / `clear` / `exit`。
5. **结局**：浏览器里的 `session://truth` 提供「公开真相 / 保持沉默」；终端另有隐藏路线。

线索不做明示：锁屏不写提示，也不提供日志入口；恢复密钥只出现在引子的系统邮件正文里。

---

## 时间线（虚构）

| 时间                 | 事件                           |
| -------------------- | ------------------------------ |
| 2031-03-28           | 林澈开始写日记                 |
| 2031-04-09           | 发现 agent 每天 03:42 自动提交 |
| 2031-04-13           | 发现加密目录与维护组名单       |
| 2031-04-17           | agent 开始替他回复消息         |
| **2031-04-19 03:42** | 会话终止，身份被克隆           |
| 2031-04-22           | 玩家收到延迟邮件               |

远程机器的系统时钟被冻结在 `2031-04-19 03:42`，因此任务栏、日历、锁屏都停在这一刻。

---

## 目录结构

```
src/
  data/arg/            所有剧情内容（改文案不动 UI）
    config.js          品牌、锁屏、时间线、会话日志
    prologue.js        引子桌面、邮件、连接动画
    diary.js           林澈的日记（按进度解锁）
    files.js           linche-agent 虚拟文件树
    terminal.js        终端命令与输出
    browser.js         伪浏览器内部页面
    notifications.js   系统通知
    endings.js         三种结局文案
    video.js           回收站自述视频与字幕
    dontrun.js         「不要运行.js」脚本
  components/arg/      引子、结局、通知、剧情 block 渲染器
  containers/applications/apps/   六个应用窗口
  reducers/arg.js      进度、flags、终端历史、结局
  utils/arg.js         进度读写、锁屏校验、虚构时钟
```

改动文案只需编辑 `src/data/arg/` 下的文件；组件不硬编码剧情。

---

## 进度存储

所有进度保存在 `localStorage` 的单一命名空间 `arg_progress_v1` 下：

```js
{
  version: 1,
  stage: 0,
  flags: {
    prologueSeen, gitLog, unlocked, restored,
    sawTruth, ranScript, corrupted
  },
  terminalHistory: [],
  browserPage: "github",
  notificationsSeen: [],
  ending: null,
  whisperCount: 0
}
```

清除进度：在控制台执行 `localStorage.removeItem("arg_progress_v1")` 后刷新。

---

## 署名与许可

原项目 **win11React** 由 [blueedgetechno](https://github.com/blueedgetechno) 及贡献者开发，
以 **CC0 1.0 Universal** 发布，见 [LICENSE](./LICENSE)。

二次改造部分（剧情、数据文件、ARG 相关组件与样式）同样以 CC0 1.0 发布。
原始版权声明与许可文本完整保留，详见 [NOTICE](./NOTICE)。

本项目与 Microsoft 无任何关联，不使用其商标或产品名称作为自身标识。
