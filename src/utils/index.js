import icons from "./apps";
import { shell } from "../data/arg/config";

// 读取 ARG 自己的命名空间。key 升到 v2，避免旧的 win11React / 旧版剧情
// 把已经删除的应用（session.js 等）带回桌面。
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

const taskbar = readList("arg_taskbar_v2", shell.taskbar);
const desktop = readList("arg_desktop_v2", shell.desktop);
const pinned = readList("arg_pinned_v2", shell.pinned);
const recent = readList("arg_recent_v2", shell.recent);

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
