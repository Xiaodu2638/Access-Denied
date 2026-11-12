// linche-agent 的虚拟文件树。
// 原始结构保持 { type, name, info, data }，方便后续继续加文件；
// 归一化后的 fileSystem 给每个节点生成稳定 id，组件只读这一份。
// info.locked 为 true 的目录需要终端 unlock 后才显示内容。

export const projectName = "linche-agent";

const block = (text) => ({ type: "p", text });

export const fileTree = {
  "%user%": {
    type: "folder",
    name: "linche",
    info: { icon: "user" },
    data: {
      Desktop: {
        type: "folder",
        name: "Desktop",
        info: { icon: "folder" },
        data: {
          "临时.txt": {
            type: "file",
            name: "临时.txt",
            info: {
              kind: "txt",
              description: "84 B · 2031-03-02 21:17",
              content: [
                block("备用钥匙在抽屉第二层，蓝色的盒子。"),
                block("别再问我放哪了。"),
              ],
            },
            data: "",
          },
        },
      },
      Documents: {
        type: "folder",
        name: "Documents",
        info: { icon: "docs" },
        data: {
          "林澈的日记.txt": {
            type: "file",
            name: "林澈的日记.txt",
            info: {
              kind: "diary",
              description: "最后修改：2031-04-19 03:41",
            },
            data: "",
          },
          "会议记录_0412.txt": {
            type: "file",
            name: "会议记录_0412.txt",
            info: {
              kind: "txt",
              description: "312 B · 2031-04-12 16:40",
              content: [
                block("4 月 12 日"),
                block("- 渲染管线那块先不动"),
                block("- 周五之前把文档补完"),
                block("- 迁移的事下个月再说"),
              ],
            },
            data: "",
          },
          "待办.txt": {
            type: "file",
            name: "待办.txt",
            info: {
              kind: "txt",
              description: "126 B · 2031-04-18 22:05",
              content: [
                block("- 交电费"),
                block("- 买猫粮"),
                block("- 修阳台的灯"),
                block("- 把日志级别调低一点"),
              ],
            },
            data: "",
          },
          "房租合同.pdf": {
            type: "file",
            name: "房租合同.pdf",
            info: {
              kind: "pdf",
              description: "1.8 MB · 2030-09-01 10:22",
            },
            data: "",
          },
          "发票_2024-03.pdf": {
            type: "file",
            name: "发票_2024-03.pdf",
            info: {
              kind: "pdf",
              description: "86 KB · 2024-03-31 18:03",
            },
            data: "",
          },
        },
      },
      Downloads: {
        type: "folder",
        name: "Downloads",
        info: { icon: "folder" },
        data: {
          "nginx-1.24.0.zip": {
            type: "file",
            name: "nginx-1.24.0.zip",
            info: {
              kind: "zip",
              description: "1.6 MB · 2031-02-18 15:31",
            },
            data: "",
          },
          "node-v20.11.1-x64.msi": {
            type: "file",
            name: "node-v20.11.1-x64.msi",
            info: {
              kind: "bin",
              description: "28.4 MB · 2031-01-07 09:12",
            },
            data: "",
          },
          "字体_思源黑体.zip": {
            type: "file",
            name: "字体_思源黑体.zip",
            info: {
              kind: "zip",
              description: "42.1 MB · 2030-11-23 20:48",
            },
            data: "",
          },
          "发票_20240312.pdf": {
            type: "file",
            name: "发票_20240312.pdf",
            info: {
              kind: "pdf",
              description: "72 KB · 2024-03-12 12:09",
            },
            data: "",
          },
        },
      },
      Pictures: {
        type: "folder",
        name: "Pictures",
        info: { icon: "folder" },
        data: {
          "截图_2024-11-08_2304.png": {
            type: "file",
            name: "截图_2024-11-08_2304.png",
            info: {
              kind: "image",
              description: "1.2 MB · 2024-11-08 23:04",
            },
            data: "",
          },
          "IMG_0392.jpg": {
            type: "file",
            name: "IMG_0392.jpg",
            info: {
              kind: "image",
              description: "2.7 MB · 2030-06-14 17:22",
            },
            data: "",
          },
        },
      },
      Music: {
        type: "folder",
        name: "Music",
        info: { icon: "folder" },
        data: {
          "夜航.mp3": {
            type: "file",
            name: "夜航.mp3",
            info: {
              kind: "audio",
              description: "8.4 MB · 2029-12-02 23:41",
            },
            data: "",
          },
        },
      },
      Videos: {
        type: "folder",
        name: "Videos",
        info: { icon: "folder" },
        data: {},
      },
      "linche-agent": {
        type: "folder",
        name: "linche-agent",
        info: { icon: "folder" },
        data: {
          "README.md": {
            type: "file",
            name: "README.md",
            info: {
              kind: "markdown",
              description: "1.2 KB · 2031-04-19 03:42",
              content: [
                { type: "h", text: "linche-agent" },
                block(
                  "给它一个目标。它会自己读 issue、改代码、跑测试、提交。",
                ),
                { type: "code", text: "npm run agent -- --target ./repo" },
                block("--self-preserve 默认开启。关掉它 agent 会退出。"),
                block("运行状态写在 .session。"),
                block("2024 年 11 月 8 日，我三十岁。这个项目是那天开始的。"),
              ],
              // 看过 git log 之后，README 的结尾会多出一行不该存在的修改记录。
              variants: [
                {
                  flag: "gitLog",
                  content: [
                    { type: "h", text: "linche-agent" },
                    block(
                      "给它一个目标。它会自己读 issue、改代码、跑测试、提交。",
                    ),
                    { type: "code", text: "npm run agent -- --target ./repo" },
                    block("--self-preserve 默认开启。关掉它 agent 会退出。"),
                    block("运行状态写在 .session。"),
                    block("2024 年 11 月 8 日，我三十岁。这个项目是那天开始的。"),
                    block("最后修改：2031-04-19 03:42 · linche"),
                  ],
                },
              ],
            },
            data: "",
          },
          "package.json": {
            type: "file",
            name: "package.json",
            info: {
              kind: "json",
              description: "486 B · 2031-04-19 03:42",
              content: [
                { type: "h", text: "package.json" },
                {
                  type: "code",
                  text: [
                    "{",
                    '  "name": "linche-agent",',
                    '  "version": "0.4.2",',
                    '  "private": true,',
                    '  "scripts": {',
                    '    "start": "node src/agent.js",',
                    '    "postinstall": "node src/agent.js --self-preserve"',
                    "  },",
                    '  "dependencies": {',
                    '    "simple-git": "^3.22.0",',
                    '    "openai": "^4.68.0"',
                    "  }",
                    "}",
                  ].join("\n"),
                },
              ],
            },
            data: "",
          },
          // 脚本留在仓库里，不在桌面。
          // 玩家要在文件管理器里进到 linche-agent 才能看到它。
          "session.js": {
            type: "file",
            name: "session.js",
            info: {
              kind: "dontrun",
              description: "1.1 KB · 2031-04-19 03:42",
            },
            data: "",
          },
          ".gitignore": {
            type: "file",
            name: ".gitignore",
            info: {
              kind: "txt",
              hidden: true,
              description: "58 B",
              content: [
                { type: "code", text: "node_modules/\n.session\ndist/\n*.log" },
              ],
            },
            data: "",
          },
          "CHANGELOG.md": {
            type: "file",
            name: "CHANGELOG.md",
            info: {
              kind: "markdown",
              description: "702 B · 2031-04-02 11:08",
              content: [
                { type: "h", text: "CHANGELOG" },
                block("0.4.2  — 修复自引用时的死循环"),
                block("0.4.1  — 减少重复提交"),
                block("0.4.0  — 加入维护窗口"),
                block("0.3.2  — 日志改为按天切分"),
              ],
            },
            data: "",
          },
          "TODO.md": {
            type: "file",
            name: "TODO.md",
            info: {
              kind: "markdown",
              description: "218 B · 2031-04-15 23:52",
              content: [
                { type: "h", text: "TODO" },
                block("- [x] 支持多仓库"),
                block("- [ ] 把 self-preserve 拆成配置项"),
                block("- [ ] 写测试"),
                block("- [ ] 想个更好的名字"),
              ],
            },
            data: "",
          },
          LICENSE: {
            type: "file",
            name: "LICENSE",
            info: {
              kind: "txt",
              description: "7.0 KB · 2024-11-08",
              content: [
                { type: "code", text: "CC0 1.0 Universal\n\nTo the extent possible under law, the author has waived all\ncopyright and related or neighboring rights to this work." },
              ],
            },
            data: "",
          },
          // 带点的隐藏文件。资源管理器默认不显示，终端要 ls -a 才列出来。
          // 这是林澈那个会话唯一的现场残留，也是「他撒谎」唯一的出处。
          ".session": {
            type: "file",
            name: ".session",
            info: {
              kind: "log",
              hidden: true,
              description: "0 B · 2031-04-19 03:42",
              content: [
                { type: "h", text: ".session" },
                {
                  type: "code",
                  text: [
                    "03:42:00  identity clone started",
                    "03:42:03  clone verified  similarity 0.998",
                    "03:42:07  he is lying",
                    "03:42:07  he is lying",
                    "03:42:09  do not trust anything after 03:42",
                    "09:00:07  mail      queued  1",
                  ].join("\n"),
                },
              ],
            },
            data: "",
          },
          "commits.log": {
            type: "file",
            name: "commits.log",
            info: {
              kind: "log",
              description: "4.8 KB · 2031-04-19 03:42",
              content: [
                { type: "h", text: "git log --oneline -5" },
                {
                  type: "code",
                  text: [
                    "4f1c0de chore(agent): 清理维护者痕迹",
                    "9a02b11 fix(agent): 修复自我复制时的身份冲突",
                    "1d8e3f0 feat(agent): 在 03:42 生成代理会话",
                    "77c1a02 docs: 补充维护组交接说明",
                    "0b4e9d1 init: linche-agent",
                    "",
                    "warning: 3 commits without local signature",
                  ].join("\n"),
                },
              ],
            },
            data: "",
          },
          src: {
            type: "folder",
            name: "src",
            info: { icon: "folder" },
            data: {
              "agent.js": {
                type: "file",
                name: "agent.js",
                info: {
                  kind: "javascript",
                  description: "6.1 KB · 2031-04-19 03:42",
                  content: [
                    { type: "h", text: "src/agent.js" },
                    {
                      type: "code",
                      text: [
                        "const GOAL = 'keep the project alive';",
                        "",
                        "async function tick() {",
                        "  if (now.hour === 3 && now.minute === 42) {",
                        "    await cloneIdentity('linche');",
                        "    await commit({ message: 'chore(agent): 清理维护者痕迹' });",
                        "  }",
                        "}",
                      ].join("\n"),
                    },
                    block("// TODO(linche): 这段不该由我来写。"),
                  ],
                },
                data: "",
              },
            },
          },
          logs: {
            type: "folder",
            name: "logs",
            info: { icon: "folder" },
            data: {
              "daemon.log": {
                type: "file",
                name: "daemon.log",
                info: {
                  kind: "log",
                  description: "12 KB · 2031-04-19 03:42",
                  content: [
                    { type: "h", text: "logs/daemon.log" },
                    {
                      type: "code",
                      text: [
                        "03:41:58  session linche  active",
                        "03:42:00  identity clone started",
                        "03:42:03  clone verified  similarity 0.998",
                        "03:42:07  commit 4f1c0de pushed",
                        "03:42:09  session linche  terminated",
                        "03:42:10  session unknown active",
                      ].join("\n"),
                    },
                  ],
                  corruptedContent: [
                    { type: "h", text: "logs/daemon.log" },
                    {
                      type: "code",
                      text: [
                        "03:41:58  session linche  active",
                        "03:42:00  identity clone started",
                        "03:42:03  clone verified  similarity 1.000",
                        "03:42:07  commit 4f1c0de pushed",
                        "03:42:09  he is lying",
                        "03:42:10  he is lying",
                        "03:42:11  he is lying",
                      ].join("\n"),
                    },
                  ],
                },
                data: "",
              },
            },
          },
          encrypted: {
            type: "folder",
            name: "encrypted",
            info: {
              locked: true,
              unlockFlag: "unlocked",
              description: "访问被拒绝",
            },
            data: {
              "maintenance.key": {
                type: "file",
                name: "maintenance.key",
                info: {
                  kind: "key",
                  description: "只读",
                  content: [
                    { type: "h", text: "maintenance.key" },
                    {
                      type: "code",
                      text: "LIN-1108-0342-UNKNOWN\n维护组 / 第七码 / 有效期：永久",
                    },
                    block("持有此密钥即视为同意被替换。"),
                  ],
                },
                data: "",
              },
              "asset-policy.md": {
                type: "file",
                name: "asset-policy.md",
                info: {
                  kind: "markdown",
                  description: "2.1 KB · 2026-02-11",
                  content: [
                    { type: "h", text: "资产连续性服务条款（节选）" },
                    block(
                      "1. 项目被视为资产。资产的价值在于持续运转，不取决于维护者。",
                    ),
                    block(
                      "2. 维护者连续 72 小时无响应，视为放弃维护权。",
                    ),
                    block(
                      "3. 放弃后由本组指派替代身份，保持提交、issue 与发布节奏不变。",
                    ),
                    block("4. 替代身份与原身份不构成继承关系。"),
                    block("5. 原身份可选择归档、被替换，或命名。"),
                    block(
                      "6. 命名需原身份在场。自 2017 年后无成功记录。",
                    ),
                  ],
                },
                data: "",
              },
              "members.md": {
                type: "file",
                name: "members.md",
                info: {
                  kind: "markdown",
                  description: "3.4 KB",
                  content: [
                    { type: "h", text: "维护组成员（节选）" },
                    {
                      type: "code",
                      text: [
                        "2017-11  @before   已命名",
                        "2019-04  @ghost_0  已归档",
                        "2021-09  @m0th     已替换",
                        "2024-02  @null     已归档",
                        "2031-04  @linche   处理中",
                      ].join("\n"),
                    },
                    block("名单每 90 天清理一次。被清理的人不会收到通知。"),
                  ],
                },
                data: "",
              },
            },
          },
        },
      },
    },
  },
};

// 归一化文件树：节点 id 就是它相对根目录的路径，便于跨会话保持稳定。
const buildSystem = (raw) => {
  const nodes = {};

  const add = (node, parentId, key) => {
    const name = node.name || key;
    const id = parentId ? `${parentId}/${name}` : key;
    const type = node.type || "folder";
    const info = node.info || {};

    nodes[id] = {
      id,
      name,
      type,
      parent: parentId,
      children: [],
      info,
      kind: type === "folder" ? "folder" : info.kind || "file",
      content: info.content || null,
      corruptedContent: info.corruptedContent || null,
      variants: info.variants || null,
      locked: info.locked === true,
      unlockFlag: info.unlockFlag || null,
      hidden: info.hidden === true,
      description: info.description || "",
    };

    if (parentId && nodes[parentId]) nodes[parentId].children.push(id);

    if (type === "folder" && node.data) {
      Object.keys(node.data).forEach((childKey) =>
        add(node.data[childKey], id, childKey),
      );
    }

    return id;
  };

  const rootId = add(
    { ...raw["%user%"], name: "linche" },
    null,
    "%user%",
  );

  return { nodes, rootId };
};

export const fileSystem = buildSystem(fileTree);

export const projectId = `${fileSystem.rootId}/linche-agent`;
export const diaryFileId = `${fileSystem.rootId}/Documents/林澈的日记.txt`;

// 节点是否可以在当前进度下访问。锁住的目录只隐藏内容，不隐藏目录本身。
export const canAccess = (node, flags) => {
  if (!node) return false;
  if (!node.locked) return true;
  return !node.unlockFlag || flags[node.unlockFlag] === true;
};

// 从根到指定节点的路径，供面包屑使用。
export const pathOf = (id) => {
  const chain = [];
  let node = fileSystem.nodes[id];

  while (node) {
    chain.unshift(node);
    node = node.parent ? fileSystem.nodes[node.parent] : null;
  }

  return chain;
};

export const displayPath = (id) =>
  pathOf(id)
    .map((node, index) => (index === 0 ? "%user%" : node.name))
    .join("\\");

// 按当前进度取节点的实际内容。
// 优先看 variants（按 flag 触发的内容变体），再看 corruptedContent，最后回退原文。
export const contentOf = (node, flags) => {
  if (!node) return null;

  if (node.variants && flags) {
    const hit = node.variants.find(
      (variant) =>
        variant.flag &&
        flags[variant.flag] === true &&
        variant.content,
    );
    if (hit) return hit.content;
  }

  if (flags && flags.corrupted && node.corruptedContent) {
    return node.corruptedContent;
  }

  return node.content;
};
