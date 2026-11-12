// 桌面上的那个脚本。文件名本身不能泄露剧情——
// 玩家只是看到一个可疑的 .js，得自己决定要不要打开、要不要运行。
//
// 文案原则：不解释、不指引、不确认。
// 这是林澈留下的文件，不是游戏写给玩家的说明书。

export const dontRunMeta = {
  title: "session.js",
  path: "%user%\\Desktop\\session.js",
  tag: "未签名",
  runLabel: "运行",
  alreadyRunText: "文件已被其他会话写入。",
};

export const scriptSource = [
  "// handoff v7",
  "",
  "const session = require('./session');",
  "",
  "session.clone({",
  "  from: 'linche',",
  "  to: 'unknown',",
  "  preserve: false,",
  "});",
  "",
  "// to 这里本来写的是我自己的名字。",
  "// 跑完之后它自己改回来了。",
  "",
  "// 别在 03:42 之后跑这个。",
  "// 如果你看到这里，说明你已经太晚了。",
].join("\n");

export const runResult = {
  title: "输出",
  lines: [
    { text: "> node session.js", tone: "dim" },
    { text: "", tone: "dim" },
    { text: "reading  session ............ ok", tone: "dim" },
    { text: "owner    linche" },
    { text: "state    terminated", tone: "warn" },
    { text: "clone    skipped (target exists)", tone: "warn" },
    { text: "", tone: "dim" },
    { text: "attach   unknown", tone: "ok" },
  ],
};
