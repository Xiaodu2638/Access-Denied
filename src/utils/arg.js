import { useEffect } from "react";
import { timeline } from "../data/arg/config";

// 虚构时间线里的“现在”。桌面、任务栏、日历、设置页统一停在
// 2031-06-15 17:34，不受真实系统时间影响。
export const argClockDate = () => {
  const [year, month, day] = timeline.now
    .split(" ")[0]
    .split("-")
    .map(Number);
  const date = new Date();
  date.setFullYear(year, month - 1, day);
  date.setHours(timeline.clock.hour, timeline.clock.minute, 0, 0);
  return date;
};

// 进度只存在内存里：刷新页面就等于从头开始。
// 这样玩家每次都能从引子完整走一遍，不会被上一次的进度跳过线索。
let memoryProgress = null;

export const loadArgProgress = (defaults) => {
  if (!memoryProgress) return defaults;

  return {
    ...defaults,
    ...memoryProgress,
    flags: { ...defaults.flags, ...(memoryProgress.flags || {}) },
    terminalHistory: Array.isArray(memoryProgress.terminalHistory)
      ? memoryProgress.terminalHistory
      : defaults.terminalHistory,
    notificationsSeen: Array.isArray(memoryProgress.notificationsSeen)
      ? memoryProgress.notificationsSeen
      : defaults.notificationsSeen,
    handover: Array.isArray(memoryProgress.handover)
      ? memoryProgress.handover
      : defaults.handover,
    chatSeen: Array.isArray(memoryProgress.chatSeen)
      ? memoryProgress.chatSeen
      : defaults.chatSeen,
    readMail: Array.isArray(memoryProgress.readMail)
      ? memoryProgress.readMail
      : defaults.readMail,
  };
};

export const saveArgProgress = (progress) => {
  memoryProgress = { ...progress, updatedAt: new Date().toISOString() };
};

export const clearArgProgress = () => {
  memoryProgress = null;
};

// 按 Esc 关闭窗口。onEscape 为 null 时不绑定。
// 只在窗口可见时生效，避免隐藏窗口抢占按键。
export const useEscape = (active, onEscape) => {
  useEffect(() => {
    if (!active || typeof onEscape !== "function") return;
    const handler = (event) => {
      if (event.key === "Escape") onEscape();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, onEscape]);
};
