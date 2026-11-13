export const gene_name = () =>
  Math.random().toString(36).substring(2, 10).toUpperCase();

// 远程桌面上的应用。icon 同时是窗口状态在 state.apps 里的 key，
// 也是 public/img/icon/ 下的文件名。
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
    name: "记事本",
    icon: "notepad",
    type: "app",
    action: "NOTEPAD",
  },
  {
    name: "终端",
    icon: "terminal",
    type: "app",
    action: "TERMINAL",
  },
  {
    name: "资产盘点",
    icon: "taskmanager",
    type: "app",
    action: "ASSET",
  },
  {
    name: "分区修复",
    icon: "settings",
    type: "app",
    action: "PARTITION",
  },
  {
    name: "回收工具",
    icon: "security",
    type: "app",
    action: "RETIRE",
  },
  {
    name: "回收站",
    icon: "bin0",
    type: "app",
    action: "RECYCLE",
  },
];

export default apps;
