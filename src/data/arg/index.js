// ARG 数据层统一出口。组件一律从这里取剧情内容。
export * from "./config";
export * from "./files";
export * from "./browser";
export * from "./remote";
export * from "./notifications";
export * from "./endings";
export * from "./terminal";
export * from "./prologue";

// 进度默认值。新增标记时只改这里。
// 进度只存在内存里：刷新页面从引子重新开始，不写 localStorage。
export const createDefaultProgress = () => ({
  version: 2,
  // prologue = 玩家本机；remote = 远程资产；aftermath = 回收后回到本机
  phase: "prologue",
  host: null,
  flags: {
    // 资产盘点 / 分区
    assetScanned: false,
    partitionMounted: false,

    // 远程读过的东西。打开即算读过。
    readNotebook: false,
    readHousehold: false,
    readSchool: false,
    readGraves: false,
    readHandoverNote: false,
    readTranscript: false,
    readToZhou: false,

    // ZJ-03
    zhouVisited: false,
    readZhouReview: false,
    readZhouNote: false,

    // 记者线
    mailDraftOpen: false,
    mailSent: false,
    mailDiscarded: false,
    mailDestroyed: false,

    // 交接与回收
    handoverCopied: false,
    retireReady: false,
    jobClosed: false,
  },
  terminalHistory: [],
  browserPage: "oa",
  notificationsSeen: [],
  // 玩家实际打开过的邮件 id。未读标志只认这个。
  readMail: [],
  // 已经提示过的邮件 id，避免切换阶段时重复弹提示。
  mailSeen: [],
  // 运行期的提示条（调度消息、新邮件等）。静态提示见 notifications.js。
  toasts: [],
  // 复制到 Z: 的文件：[{ host, id, name, path }]
  handover: [],
  // 记事本当前打开的文件：{ host, id }
  openFile: null,
  chatSeen: [],
  outcome: null,
  updatedAt: null,
});
