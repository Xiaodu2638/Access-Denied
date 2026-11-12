// 终端文案与命令定义。
// 组件只负责输入、历史和渲染，具体输出全部来自这里。

export const terminalMeta = {
  title: "终端",
  host: "LIN-DESKTOP",
  user: "unknown",
  cwd: "C:\\Users\\linche\\linche-agent",
  prompt: "unknown@LIN-DESKTOP",
  welcome: [
    { text: "Microsoft Windows [版本 10.0.22000.51]", tone: "dim" },
    { text: "(c) Microsoft Corporation。保留所有权利。", tone: "dim" },
    { text: "" },
    { text: "上次会话未正常结束。", tone: "warn" },
  ],
};

// unlock 命令的密钥。故意与锁屏密码区分。
export const unlockKey = "1108";

export const commands = {
  help: {
    usage: "help",
    description: "列出可用命令",
    lines: [
      { text: "可用命令：" },
      { text: "  help            显示这份列表", tone: "dim" },
      { text: "  whoami          显示当前身份", tone: "dim" },
      { text: "  ls [-a]         列出当前目录（-a 含隐藏项）", tone: "dim" },
      { text: "  cat <file>      查看文件", tone: "dim" },
      { text: "  git log         查看提交记录", tone: "dim" },
      { text: "  git status      查看仓库状态", tone: "dim" },
      { text: "  unlock <key>    解锁加密目录", tone: "dim" },
      { text: "  restore         从回收站恢复文件", tone: "dim" },
      { text: "  open <page>     在浏览器中打开内部页面", tone: "dim" },
      { text: "  clear           清屏", tone: "dim" },
      { text: "  exit            关闭终端", tone: "dim" },
    ],
  },

  whoami: {
    usage: "whoami",
    description: "显示当前身份",
    lines: [
      { text: "unknown", tone: "ok" },
      { text: "会话所有者：linche（已终止）", tone: "dim" },
      { text: "身份相似度：0.998", tone: "warn" },
      { text: "你确定你是你吗？", tone: "warn" },
    ],
    // 看过 .session / 跑过 session.js 之后，同样的命令会多出东西。
    // 不提示玩家回来重查，也不解释哪来的。
    variants: [
      {
        flags: ["readSession", "ranScript"],
        lines: [
          { text: "unknown", tone: "ok" },
          { text: "会话所有者：linche（已终止）", tone: "dim" },
          { text: "身份相似度：1.000", tone: "warn" },
          { text: "你确定你是你吗？", tone: "warn" },
          { text: "" },
          { text: "maintainer  available  --accept", tone: "dim" },
        ],
      },
      {
        flags: ["readSession"],
        lines: [
          { text: "unknown", tone: "ok" },
          { text: "会话所有者：linche（已终止）", tone: "dim" },
          { text: "身份相似度：1.000", tone: "warn" },
          { text: "你确定你是你吗？", tone: "warn" },
        ],
      },
      {
        flags: ["ranScript"],
        lines: [
          { text: "unknown", tone: "ok" },
          { text: "会话所有者：linche（已终止）", tone: "dim" },
          { text: "身份相似度：0.998", tone: "warn" },
          { text: "你确定你是你吗？", tone: "warn" },
          { text: "" },
          { text: "maintainer  available  --accept", tone: "dim" },
        ],
      },
    ],
  },

  ls: {
    usage: "ls",
    description: "列出当前目录",
    lines: [
      {
        text: "README.md    session.js    commits.log    logs/    src/    encrypted/",
        tone: "dim",
      },
    ],
  },
  "git log": {
    usage: "git log",
    description: "查看提交记录",
    flag: "gitLog",
    lines: [
      { text: "commit 4f1c0de (HEAD -> main)", tone: "dim" },
      { text: "Author: linche <linche@localhost>" },
      { text: "Date:   Sat Apr 19 03:42:07 2031 +0800" },
      { text: "" },
      { text: "    chore(agent): 清理维护者痕迹" },
      { text: "" },
      { text: "commit 9a02b11", tone: "dim" },
      { text: "    fix(agent): 修复自我复制时的身份冲突" },
      { text: "" },
      { text: "commit 1d8e3f0", tone: "dim" },
      { text: "    feat(agent): 在 03:42 生成代理会话" },
      { text: "" },
      { text: "warning: 3 commits without local signature", tone: "warn" },
    ],
  },

  "git status": {
    usage: "git status",
    description: "查看仓库状态",
    lines: [
      { text: "On branch main" },
      { text: "Changes not staged for commit:", tone: "dim" },
      { text: "  modified:   logs/daemon.log", tone: "warn" },
      { text: "" },
      { text: "logs/daemon.log   locked by session unknown", tone: "err" },
    ],
  },

  cat: {
    usage: "cat <file>",
    description: "查看文件",
    needsArg: true,
    lines: [],
  },

  unlock: {
    usage: "unlock <key>",
    description: "解锁加密目录",
    needsArg: true,
    flag: "unlocked",
    lines: [
      { text: "正在校验维护组密钥……", tone: "dim" },
      { text: "密钥正确。encrypted/ 已挂载。", tone: "ok" },
    ],
    wrongLines: [{ text: "密钥错误。", tone: "err" }],
  },

  restore: {
    usage: "restore",
    description: "从回收站恢复文件",
    flag: "restored",
    lines: [
      { text: "正在扫描回收站……", tone: "dim" },
      { text: "找到 1 个已删除文件：linche_final.mp4", tone: "warn" },
      { text: "已恢复到回收站预览区。", tone: "ok" },
    ],
  },

  open: {
    usage: "open <page>",
    description: "在浏览器中打开内部页面",
    needsArg: true,
    lines: [{ text: "已在浏览器中打开。", tone: "ok" }],
    wrongLines: [{ text: "无法解析该地址。", tone: "err" }],
  },

  clear: {
    usage: "clear",
    description: "清屏",
    clear: true,
    lines: [],
  },

  exit: {
    usage: "exit",
    description: "关闭终端",
    close: true,
    lines: [{ text: "正在结束会话……", tone: "dim" }],
  },

  "maintainer --accept": {
    usage: "maintainer --accept",
    description: "（未记录）",
    hidden: true,
    // 没运行过 session.js，这条命令不存在。
    requires: "ranScript",
    ending: "maintainer",
    lines: [
      { text: "正在写入维护组名单……", tone: "dim" },
      { text: "身份已归档。", tone: "warn" },
    ],
  },

  // 在终端里直接提交会话。分片齐与不齐，走不同的结局。
  submit: {
    usage: "submit",
    description: "（未记录）",
    hidden: true,
    // 组件按完整性决定给 publish 还是 premature。
    dynamicEnding: true,
    lines: [
      { text: "正在提交会话……", tone: "dim" },
      { text: "等待远端确认。", tone: "dim" },
    ],
  },

  // 第三个选项。归档、被替换之外的第三种处理方式。
  // 必须先读过 .session，否则你不知道「他撒谎」指的是谁。
  "identity --name": {
    usage: "identity --name <name>",
    description: "（未记录）",
    hidden: true,
    requires: "readSession",
    needsArg: true,
    dynamicEnding: "named",
    lines: [
      { text: "identity  unknown  similarity 0.998", tone: "dim" },
      { text: "正在分离……", tone: "dim" },
    ],
  },
};

export const unknownCommand = (cmd) => [
  { text: `'${cmd}' 不是内部或外部命令，也不是可运行的程序。`, tone: "err" },
];
