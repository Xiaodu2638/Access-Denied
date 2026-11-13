// 《石桥》全局配置。
// 剧情文案与可调参数集中在这里，组件只读取，不硬编码。

export const ARG_VERSION = 2;

// 剧情进度**不写** localStorage：刷新页面即从引子重新开始。
// 这里保留 key 仅作为历史命名说明，以及方便调试时清理旧数据。
export const ARG_STORAGE_KEY = "arg_progress_v2";

export const brand = {
  title: "石桥",
  codename: "THE BRIDGE",
  tagline: "库区测绘 · 资产回收",
};

// 主角本机的账号。玩家是接单的 IT 外包，不参与测绘。
export const player = {
  user: "you",
  account: "you@local",
  hostname: "YOU-PC",
  company: "作为外包 · 资产回收组",
};

// 世界里两家公司：一家做数据回收，一家是项目业主。
export const companies = {
  vendor: "云图数据服务",
  client: "石桥水利枢纽建设管理局",
  survey: "江河测绘院",
  paper: "河口晚报",
};

// 退休工具需要的回收码。和 RDP 密码不是同一个东西。
export const retireCode = "4471";

// 剧情时间线。玩家在 2031-06-15 傍晚接单，
// 远程机器的最后一次本地操作停在 06-12 17:40 —— 陈默离开的那天。
export const timeline = {
  now: "2031-06-15 17:34",
  nowLabel: "2031 年 6 月 15 日 · 星期日",
  clock: { hour: 17, minute: 34 },
  clockLabel: "06/15/31",
  remoteLastWrite: "2031-06-12 17:40",
  // 陈默给邮件设过这个时间，但机器从 6 月 12 日就断线了，任务没有执行。
  mailScheduled: "2031-06-15 17:40",
};

// 远程资产。address / user / password 都能在工单邮件里找到。
export const machines = {
  chenmo: {
    id: "chenmo",
    hostname: "CM-07",
    address: "10.24.7.31",
    user: "chenmo",
    password: "CM-07-3117",
    owner: "陈默",
    role: "测绘二队 · 外业",
    site: "石桥库区",
    label: "石桥库区测绘工作站",
  },
  zhou: {
    id: "zhou",
    hostname: "ZJ-03",
    address: "10.24.7.44",
    user: "zhouning",
    password: "ZJ-03-4482",
    owner: "周宁",
    role: "测绘二队 · 内业",
    site: "石桥库区",
    label: "测绘二队内业机",
    // 第二台资产没有分配回收任务，回收工具里只显示这一句。
    retireTask: false,
  },
};

// 桌面与任务栏的默认应用名。名字必须和 utils/apps.js 里的条目一致。
export const shell = {
  desktop: [
    "文件管理器",
    "浏览器",
    "记事本",
    "资产盘点",
    "分区修复",
    "回收工具",
    "回收站",
  ],
  taskbar: ["文件管理器", "浏览器", "记事本", "终端", "回收工具"],
  pinned: ["文件管理器", "浏览器", "终端", "资产盘点", "回收工具"],
  recent: ["文件管理器", "浏览器", "终端"],
};

// 交接盘在网络位置，不占本地磁盘。放在这里方便两头引用。
export const handoverDrive = {
  id: "Z:",
  name: "Z:",
  label: "交接盘 (Z:)",
  path: "Z:\\交接",
};
