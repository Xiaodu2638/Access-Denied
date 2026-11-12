import icons from "./apps";
import { shell } from "../data/arg/config";

// 读取 ARG 自己的命名空间，避免旧版 win11React 的
// desktop / taskbar / pinned / recent 把已删除的应用带回来。
const readList = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch (err) {
    return fallback;
  }
};

const taskbar = readList("arg_taskbar", shell.taskbar);
// session.js 不再属于桌面。旧 localStorage 里可能还留着它，这里强制剔除。
const desktop = readList("arg_desktop", shell.desktop).filter(
  (name) => name !== "session.js",
);
const pinned = readList("arg_pinned", shell.pinned);
const recent = readList("arg_recent", shell.recent);

const pick = (names) =>
  icons
    .filter((x) => names.includes(x.name))
    .sort((a, b) => names.indexOf(a.name) - names.indexOf(b.name));

export const taskApps = pick(taskbar);

export const desktopApps = pick(desktop);

export const pinnedApps = pick(pinned);

export const recentApps = pick(recent);

export const allApps = icons.filter((app) => {
  return app.type === "app";
});

export const dfApps = {
  taskbar,
  desktop,
  pinned,
  recent,
};
