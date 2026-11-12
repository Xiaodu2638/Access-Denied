// 伪浏览器的内部页面。没有 iframe，也不请求外网。
// 地址栏只接受这里定义的 address / alias。
//
// 这里刻意不用「镜像」「真相」这类给答案起的名字。
// 10.24.7.31 就是一个没关掉的会话存储，里面躺着一个 dump 文件。

export const browserMeta = {
  title: "浏览器",
  home: "github",
  notFound: {
    title: "无法访问此页面",
    blocks: [
      { type: "p", text: "这个地址不在当前会话的白名单里。" },
    ],
  },
};

export const bookmarks = [
  { label: "linche-agent", page: "github" },
  { label: "项目文档", page: "docs" },
];

// dump 里被打码的段落。每一段对应玩家在别处做过的一件事。
// 这里没有计数器，也不写「缺失」：页面上就是一块黑的，补上了就变成正文。
export const dumpFragments = [
  { id: "commit", flag: "gitLog" },
  { id: "members", flag: "unlocked" },
  { id: "media", flag: "restored" },
  { id: "clone", flag: "ranScript" },
  // 最后一行只有当玩家真的读过 .session 才会显出来。
  { id: "lie", flag: "readSession" },
];

export const recoveredCount = (flags) => {
  const f = flags || {};
  return dumpFragments.filter((item) => f[item.flag] === true).length;
};

export const dumpReady = (flags) =>
  recoveredCount(flags) === dumpFragments.length;

const REDACTED = "████████████████████████████████████";

const line = (flags, flag, text) =>
  flags && flags[flag] === true ? text : REDACTED;

// 10.24.7.31：一个目录列表，不是一扇门。
// 没有链接、没有按钮，只有文件名和大小。
export const listingBlocks = () => [
  { type: "h", text: "/var/session/" },
  {
    type: "code",
    text: [
      "0x0342.dump     12.4 MB   2031-04-19 03:42",
      "index            0.2 KB   2031-04-19 03:42",
    ].join("\n"),
  },
  { type: "p", text: "2 个文件。" },
];

// session dump 本体。缺的部分是黑的，不是待办事项。
export const dumpBlocks = (flags) => {
  const f = flags || {};

  return [
    { type: "h", text: "0x0342.dump" },
    {
      type: "code",
      text: [
        "session  linche",
        "target   TERMSRV/10.24.7.31",
        "state    terminated",
        "",
        "03:41:52  rec     linche_final.mp4   48s",
        "03:42:00  identity clone started",
        "03:42:03  clone verified  similarity 0.998",
        "03:42:05  git     4f1c0de  chore(agent): 清理维护者痕迹",
        "03:42:06  members 7 entries   @linche 处理中",
        "03:42:07  he is lying",
      ]
        .map((row) => {
          if (row.startsWith("03:41:52")) return line(f, "restored", row);
          if (row.startsWith("03:42:00")) return line(f, "ranScript", row);
          if (row.startsWith("03:42:03")) return line(f, "ranScript", row);
          if (row.startsWith("03:42:05")) return line(f, "gitLog", row);
          if (row.startsWith("03:42:06")) return line(f, "unlocked", row);
          if (row.startsWith("03:42:07")) return line(f, "readSession", row);
          return row;
        })
        .join("\n"),
    },
    { type: "meta", text: "last write  2031-04-22 09:00:07" },
  ];
};

export const pages = {
  github: {
    id: "github",
    address: "github.com/linche/linche-agent",
    aliases: ["github", "repo"],
    title: "linche/linche-agent",
    kind: "web",
    favicon: "github",
    blocks: [
      { type: "h", text: "linche / linche-agent" },
      { type: "p", text: "Public archive · 最后一次提交 3 天前" },
      { type: "quote", text: "一个会自己维护开源仓库的 agent。" },
      {
        type: "code",
        text: [
          "4f1c0de  chore(agent): 清理维护者痕迹        03:42",
          "9a02b11  fix(agent): 修复自我复制时的身份冲突",
          "1d8e3f0  feat(agent): 在 03:42 生成代理会话",
        ].join("\n"),
      },
      {
        type: "p",
        text: "仓库已被归档。协作者列表为空。最近一次 issue 由 @unknown 提交，内容是：“他还在吗？”",
      },
    ],
    links: [{ label: "阅读项目文档", page: "docs" }],
  },

  docs: {
    id: "docs",
    address: "linche.dev/agent/docs",
    aliases: ["docs", "documentation"],
    title: "linche-agent · 文档",
    kind: "web",
    favicon: "docs",
    blocks: [
      { type: "h", text: "安装" },
      { type: "code", text: "npm install linche-agent" },
      { type: "h", text: "配置" },
      {
        type: "code",
        text: [
          "{",
          '  "target": "./repo",',
          '  "window": "03:42",',
          '  "selfPreserve": true',
          "}",
        ].join("\n"),
      },
      {
        type: "p",
        text: "window 为低负载时段，格式 HH:MM。默认为 03:42。改这个值不会改变调度周期。",
      },
      { type: "h", text: "selfPreserve" },
      {
        type: "p",
        text: "开启后，agent 在维护者不可用时保留当前工作副本。关闭后，未提交的改动会在下一个窗口被丢弃。",
      },
      {
        type: "code",
        text: "npm run agent -- --target ./repo --window 03:42",
      },
      {
        type: "p",
        text: "文档更新于 2031-04-19 03:41 · linche",
      },
    ],
    links: [{ label: "返回仓库", page: "github" }],
  },

  store: {
    id: "store",
    address: "10.24.7.31",
    aliases: ["store", "10.24.7.31"],
    title: "10.24.7.31",
    kind: "store",
    favicon: "warning",
    dynamic: "listing",
    // 没有 links。这里只列出文件，进不进得去靠玩家自己敲路径。
  },

  dump: {
    id: "dump",
    address: "file:///var/session/0x0342.dump",
    aliases: ["0x0342.dump"],
    title: "0x0342.dump",
    kind: "dump",
    favicon: "warning",
    dynamic: "dump",
    ending: true,
  },
};

// 地址栏输入解析：支持完整地址、id、alias。
export const resolvePage = (input) => {
  const value = (input || "").trim().toLowerCase();
  if (!value) return null;

  const ids = Object.keys(pages);
  for (const id of ids) {
    const page = pages[id];
    if (page.address.toLowerCase() === value) return id;
    if (page.aliases && page.aliases.includes(value)) return id;
  }

  return null;
};
