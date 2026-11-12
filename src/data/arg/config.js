// 「未授权访问」全局配置。
// 剧情文案与可调参数集中在这里，组件只读取，不硬编码。

export const ARG_VERSION = 1;

// 剧情进度**不写** localStorage：刷新页面即从引子重新开始。
// 这里保留 key 仅作为历史命名说明，以及方便调试时清理旧数据。
export const ARG_STORAGE_KEY = "arg_progress_v1";

export const brand = {
  title: "未授权访问",
  codename: "ACCESS DENIED",
  session: "会话恢复中",
  user: "linche",
  currentUser: "unknown",
  lastLogin: "2031-04-19 03:42",
  hostname: "LIN-DESKTOP",
  project: "linche-agent",
  tagline: "有人替你保留了这台机器的会话。",
};

export const lock = {
  user: brand.user,
  currentUser: brand.currentUser,
  lastLogin: brand.lastLogin,
  session: brand.session,
  wallpaper: "arg/127.0.0.1.png",
  puzzle: {
    // 不在锁屏上解释谜题。恢复令牌只出现在引子的会话日志里。
    mode: "credential",
    answerHash: "c797c778", // FNV-1a 32bit of "834"
    hashAlgo: "fnv1a32",
    placeholder: "输入恢复密钥",
    submit: "恢复会话",
    wrongText: "恢复密钥错误。",
    successText: "会话已恢复。",
    successDelay: 1200,
    hint: "",
    hintAfter: 99,
    notice: {
      title: "系统提示",
      body: "远程会话未正常结束。",
    },
  },
};

// 会话连接日志。引子邮件里展示的是这份内容。
// 这里刻意不写恢复密钥：密码只能在本机的旧终端记录里找到。
export const sessionLog = [
  "[03:41:58] 解析 rdp://03:42.unknown",
  "[03:42:00] 目标主机 LIN-DESKTOP",
  "[03:42:02] 会话 0x0342 已建立",
  "[03:42:03] 用户 linche",
  "[03:42:07] 恢复凭据 已校验",
  "[03:42:07] 会话未正常结束",
];

// 桌面与任务栏的默认应用名，模块 3 会用到。
export const shell = {
  // 桌面上只放系统应用。session.js 不在这里：
  // 脚本在 linche-agent 仓库里，玩家得自己翻进去。
  desktop: ["记事本", "文件管理器", "浏览器", "终端", "回收站"],
  taskbar: ["文件管理器", "浏览器", "终端", "记事本"],
  pinned: ["记事本", "文件管理器", "浏览器", "终端"],
  recent: ["记事本", "文件管理器", "终端"],
};

// 剧情时间线，界面上的“系统时间”和日志都以它为准。
// 全部为虚构日期：事故发生在 2031-04-19 03:42（星期六），
// 主角在 2031-04-22（星期二）从自己的电脑连进来。
// 远程机器被挂起在事故那一刻，所以桌面与锁屏的时钟都停在 04-19 03:42。
export const timeline = {
  incident: "2031-04-19 03:42",
  incidentLabel: "2031 年 4 月 19 日 · 星期六",
  lastCommit: "2031-04-19 03:42:07",
  lastCommitHash: "4f1c0de",
  lastCommitMessage: "chore(agent): 清理维护者痕迹",
  daysMissing: 3,
  // 主角自己的电脑：引子邮件与延迟发送都以这一天为准。
  today: "2031-04-22",
  todayLabel: "2031 年 4 月 22 日 · 星期二",
  // 远程桌面的时钟：停在会话恢复的那一刻。
  desktopClock: { hour: 3, minute: 42 },
  desktopClockLabel: "04/19/31",
};
