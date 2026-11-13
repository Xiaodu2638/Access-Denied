// 系统通知。两种触发方式：
//   delay  —— 进入远程桌面后经过多少毫秒弹出
//   flags  —— 当这些进度标记全部为真时弹出
// 同一个 id 只会弹一次，记录在 arg.notificationsSeen。

export const notificationMeta = {
  duration: 6400,
  maxVisible: 3,
};

export const notifications = [
  {
    id: "n-window-01",
    delay: 45000,
    title: "资产平台",
    body: "CM-07 的回收窗口将在 18:00 关闭。",
    tone: "warn",
  },
  {
    id: "n-scan-01",
    flags: ["assetScanned"],
    title: "磁盘",
    body: "本机磁盘数量与资产登记不一致。",
    tone: "warn",
  },
  {
    id: "n-mount-01",
    flags: ["partitionMounted"],
    title: "分区",
    body: "卷「我的测绘」已挂载到 D:。",
    tone: "info",
  },
  {
    id: "n-copy-01",
    flags: ["handoverCopied"],
    title: "交接盘",
    body: "Z:\\交接 已写入文件。",
    tone: "info",
  },
  {
    id: "n-draft-01",
    flags: ["mailDraftOpen"],
    title: "邮件",
    body: "草稿箱里有 1 封未发出的邮件。",
    tone: "warn",
  },
  {
    id: "n-mail-01",
    flags: ["mailSent"],
    title: "邮件",
    body: "1 封邮件已从本机发出。",
    tone: "info",
  },
  {
    id: "n-zhou-01",
    flags: ["zhouVisited"],
    title: "资产平台",
    body: "ZJ-03 状态已上报。",
    tone: "info",
  },
  {
    id: "n-retire-01",
    flags: ["retireReady"],
    title: "回收工具",
    body: "回收码已校验。",
    tone: "warn",
  },
];
