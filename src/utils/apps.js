export const gene_name = () =>
  Math.random().toString(36).substring(2, 10).toUpperCase();

// 「未授权访问」只保留六个应用 + 三个系统 action。
// icon 同时是窗口状态在 state.apps 里的 key。
const apps = [
  {
    name: "Start",
    icon: "home",
    type: "action",
    action: "STARTMENU",
  },
  {
    name: "Search",
    icon: "search",
    type: "action",
    action: "SEARCHMENU",
  },
  {
    name: "Widget",
    icon: "widget",
    type: "action",
    action: "WIDGETS",
  },
  {
    name: "记事本",
    icon: "notepad",
    type: "app",
    action: "NOTEPAD",
  },
  {
    name: "文件管理器",
    icon: "explorer",
    type: "app",
    action: "EXPLORER",
  },
  {
    name: "浏览器",
    icon: "edge",
    type: "app",
    action: "MSEDGE",
  },
  {
    name: "终端",
    icon: "terminal",
    type: "app",
    action: "TERMINAL",
  },
  {
    name: "回收站",
    icon: "bin0",
    type: "app",
    action: "RECYCLE",
  },
  {
    name: "session.js",
    icon: "code",
    type: "app",
    action: "DONTRUN",
  },
];

export default apps;
