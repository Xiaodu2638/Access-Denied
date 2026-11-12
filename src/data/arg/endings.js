// 四种结果。这里不写「结局海报」，只写世界接下来会做什么。
// 具体的画面变化由 Ending 按 steps 逐条施加到桌面上。
//
// 可用步骤：
//   flag     —— 置一个进度标记
//   close    —— 关掉某个窗口
//   lock     —— 回到锁屏
//
// publish / maintainer 会锁屏：会话结束，玩家只能看着被改写的登录界面。
// silence / premature 不锁屏：世界还开着，变化留在桌面上，玩家可以自己回去看。

export const outcomes = {
  // 四个分片齐了，选择公开。
  publish: {
    id: "publish",
    steps: [
      { after: 0, close: "edge" },
      { after: 300, flag: "submitted" },
      { after: 1400, flag: "archived" },
      { after: 2600, close: "explorer" },
      { after: 3200, close: "notepad" },
      { after: 3800, close: "terminal" },
      { after: 4600, flag: "postEnding" },
      { after: 6200, lock: true },
    ],
    lockLastLogin: "2031-04-26 04:12",
    lockSession: "会话已终止",
    lockNote: "会话已终止。",
  },

  // 四个分片齐了，选择什么都不做。
  // 桌面留着，但桌上的东西变了。
  silence: {
    id: "silence",
    steps: [
      { after: 0, close: "edge" },
      { after: 900, flag: "returned" },
      { after: 2600, flag: "postEnding" },
    ],
    lockLastLogin: "2031-04-19 03:42",
    lockSession: "会话仍在使用中",
  },

  // 运行了 session.js，然后在终端里接受维护组身份。
  maintainer: {
    id: "maintainer",
    steps: [
      { after: 0, flag: "joined" },
      { after: 1800, close: "notepad" },
      { after: 2400, close: "explorer" },
      { after: 3000, close: "edge" },
      { after: 3600, flag: "postEnding" },
      { after: 5200, lock: true },
    ],
    lockLastLogin: "2031-04-19 03:42",
    lockSession: "维护组 · 第七码",
    lockNote: "身份已归档。",
  },

  // 分片不齐就想公开。
  // 没有戏剧性后果：仓库还在，但证据被动过。玩家可以再进去自己发现。
  premature: {
    id: "premature",
    steps: [
      { after: 0, close: "edge" },
      { after: 800, flag: "rejected" },
      { after: 2000, flag: "premature" },
      { after: 3000, flag: "postEnding" },
    ],
    lockLastLogin: "2031-04-22 09:36",
    lockSession: "会话恢复中",
  },

  // 第三个选项：不销毁、不容忍，而是区分。
  // 不锁屏。桌面还在，但「他」有了自己的名字。
  named: {
    id: "named",
    steps: [
      { after: 0, close: "edge" },
      { after: 900, flag: "named" },
      { after: 2400, flag: "postEnding" },
    ],
    lockLastLogin: "2031-04-19 03:42",
    lockSession: "会话进行中",
    lockNote: "命名已记录。",
  },
};

// 公开信里的“调查轨迹”，由终端历史与进度标记生成。
export const trailLabels = {
  gitLog: "查看了提交记录",
  unlocked: "解锁了加密目录",
  restored: "恢复了被删除的视频",
  readSession: "读取了 .session",
  readDump: "完整读取了 0x0342.dump",
  ranScript: "运行了 session.js",
  named: "为副本命名",
};
