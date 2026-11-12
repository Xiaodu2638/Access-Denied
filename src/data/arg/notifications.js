// 系统通知。两种触发方式：
//   delay  —— 桌面解锁后经过多少毫秒弹出
//   flags  —— 当这些进度标记全部为真时弹出
// 同一个 id 只会弹一次，记录在 arg.notificationsSeen。

export const notifications = [
  {
    id: "n-boot-01",
    delay: 12000,
    title: "系统",
    body: "检测到上次会话未正常结束。",
    tone: "warn",
  },
  {
    id: "n-gitlog-01",
    flags: ["gitLog"],
    title: "Git",
    body: "检测到 3 条无签名提交。是否信任当前仓库？",
    tone: "warn",
  },
  {
    id: "n-unlock-01",
    flags: ["unlocked"],
    title: "安全中心",
    body: "加密目录已被挂载。此操作已被记录。",
    tone: "danger",
  },
  {
    id: "n-corrupt-01",
    flags: ["corrupted"],
    title: "文件校验",
    body: "校验失败：logs/daemon.log 已被其他会话修改。",
    tone: "danger",
  },
  {
    id: "n-restore-01",
    flags: ["restored"],
    title: "回收站",
    body: "linche_final.mp4 已恢复。",
    tone: "info",
  },
  {
    id: "n-dump-01",
    flags: ["readDump"],
    title: "磁盘",
    body: "0x0342.dump 写入完成。",
    tone: "danger",
  },
  {
    id: "n-dontrun-01",
    flags: ["ranScript"],
    title: "身份服务",
    body: "检测到未授权的身份操作。此设备已被标记。",
    tone: "danger",
  },
];

export const notificationTone = {
  info: "info",
  warn: "warn",
  danger: "danger",
};

// 持续时间由组件控制；这里只放文案侧的可调项。
export const notificationMeta = {
  maxVisible: 3,
  duration: 9000,
};
