import { useEffect } from "react";
import { lock, timeline } from "../data/arg/config";

// FNV-1a 32bit，用于校验锁屏谜题答案。
// 只在前端做防剧透，不是真正的安全机制。
export const fnv1a32 = (input) => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};

export const verifyLockAnswer = (answer) =>
  fnv1a32(String(answer || "").trim()) === lock.puzzle.answerHash;

// 虚构时间线里的“现在”。
// 远程机器被挂起在事故那一刻，所以桌面、任务栏、日历、设置页统一停在
// 2031-04-19 03:42，不再受真实系统时间影响。
export const argClockDate = () => {
  const [year, month, day] = timeline.incident
    .split(" ")[0]
    .split("-")
    .map(Number);
  const date = new Date();
  date.setFullYear(year, month - 1, day);
  date.setHours(timeline.desktopClock.hour, timeline.desktopClock.minute, 0, 0);
  return date;
};

// 进度只存在内存里：刷新页面就等于从头开始。
// 这样玩家每次都能从引子完整走一遍，不会被上一次的进度跳过线索。
// 仍然保留和原来一致的读写接口，避免改动调用方。
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
