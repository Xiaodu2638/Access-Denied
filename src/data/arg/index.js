// ARG 数据层统一出口。组件一律从这里取剧情内容。
export * from "./config";
export * from "./diary";
export * from "./files";
export * from "./terminal";
export * from "./browser";
export * from "./notifications";
export * from "./endings";
export * from "./video";
export * from "./dontrun";
export * from "./prologue";

import { diaryEntries } from "./diary";
import { trailLabels } from "./endings";

// 进度默认值。新增标记时只改这里。
export const createDefaultProgress = () => ({
  version: 1,
  stage: 0,
  flags: {
    prologueSeen: false,
    // RDP 登录框已经验证过密码，锁屏不再重复询问。
    rdpAuthed: false,
    gitLog: false,
    unlocked: false,
    restored: false,
    // 完整读过 0x0342.dump（不只是打开页面）。
    readDump: false,
    ranScript: false,
    corrupted: false,
    // 玩家真的读过 .session。dump 最后一行只有在这之后才会显出来。
    readSession: false,
  },
  terminalHistory: [],
  browserPage: "github",
  notificationsSeen: [],
  ending: null,
  // 结局后锁屏上显示的时间/状态会被改写。
  lockOverride: null,
  updatedAt: null,
});

const stageOf = (progress) => (progress && progress.stage) || 0;
const flagsOf = (progress) => (progress && progress.flags) || {};

export const isUnlocked = (entry, progress) => {
  const unlock = entry && entry.unlock;
  if (!unlock) return true;

  if (typeof unlock.stage === "number" && stageOf(progress) < unlock.stage) {
    return false;
  }

  if (unlock.flags) {
    const flags = flagsOf(progress);
    return unlock.flags.every((flag) => flags[flag] === true);
  }

  return true;
};

export const visibleDiaryEntries = (progress) =>
  diaryEntries.filter((entry) => isUnlocked(entry, progress));

// 公开信里的调查轨迹，由进度标记生成，保持固定顺序。
export const collectTrail = (progress) => {
  const flags = flagsOf(progress);
  return Object.keys(trailLabels)
    .filter((flag) => flags[flag] === true)
    .map((flag) => trailLabels[flag]);
};
