// 玩家自己的桌面：工单邮件、聊天、远程连接。
// 也是回收完成后的「回到本机」。

import { machines, player, timeline, companies } from "./config";
import { contentOf, handoverReadme, nodeOf } from "./files";
import { aftermathReceipt, outcomeOf } from "./endings";

export const prologue = {
  host: {
    label: "我的电脑",
    user: player.user,
    account: player.account,
    hostname: player.hostname,
    date: "2031-06-15",
    time: "17:34",
    // 回收结束回到本机时，时间已经过去了。
    aftermathTime: "18:12",
  },

  desktopIcons: [
    { id: "mail", label: "邮件", icon: "mail" },
    { id: "pc", label: "此电脑", icon: "explorer" },
    { id: "browser", label: "浏览器", icon: "edge" },
    { id: "terminal", label: "终端", icon: "terminal" },
    { id: "notes", label: "工时记录", icon: "notepad" },
    { id: "bin", label: "回收站", icon: "bin1" },
  ],

  // 只在开始菜单里出现、不占桌面位置的应用。
  startMenuOnly: [
    { id: "rdp", label: "远程桌面连接", icon: "rdp" },
    { id: "settings", label: "设置", icon: "settings" },
  ],

  mailbox: {
    title: "邮件",
    folders: ["收件箱", "已发送", "草稿", "垃圾邮件"],
    activeFolder: "收件箱",
  },

  connect: {
    stepDelay: 460,
    holdDelay: 640,
    fadeDelay: 420,
    scripts: {
      chenmo: {
        title: "远程桌面连接",
        address: machines.chenmo.address,
        lines: [
          "正在解析 10.24.7.31 …",
          "正在协商远程会话 …",
          "正在挂载用户 chenmo 的桌面 …",
          "警告：该资产已被标记为待回收。",
          "正在进入 …",
        ],
      },
      zhou: {
        title: "远程桌面连接",
        address: machines.zhou.address,
        lines: [
          "正在解析 10.24.7.44 …",
          "正在协商远程会话 …",
          "正在挂载用户 zhouning 的桌面 …",
          "该资产未分配回收任务。",
          "正在进入 …",
        ],
      },
    },
  },
};

// ---------------------------------------------------------------------------
// 本机文件
// ---------------------------------------------------------------------------

const localFile = (name, kind, meta, lines, blocks = null) => ({
  name,
  kind,
  meta,
  lines: lines || [],
  blocks,
});

const handoverFileEntries = (progress) => {
  const entries = progress.handover || [];
  if (!entries.length) return [];

  return entries.map((entry) => {
    const node = nodeOf(entry.host, entry.id);
    const blocks = node ? contentOf(node, progress.flags) : null;
    return localFile(
      entry.name,
      node ? node.kind : "txt",
      `${entry.path} · 已复制`,
      [],
      blocks || [{ type: "p", text: "（副本为空）" }],
    );
  });
};

const jobOrderLines = [
  "云图数据服务 · 资产回收工单",
  "工单号：YH-2031-0615-07",
  "",
  "资产：CM-07",
  "地址：10.24.7.31",
  "用户：chenmo",
  "密码：CM-07-3117",
  "",
  "交接盘：Z:\\交接",
  "回收码：4471",
  "",
  "要求：今天内完成回收，回执自动归档。",
];

export const localFoldersFor = (phase, progress) => {
  const folders = {
    文档: [
      localFile(
        "工单_YH-2031-0615-07.txt",
        "txt",
        "1.1 KB · 2031-06-15 17:21",
        jobOrderLines,
      ),
      localFile(
        "外包服务协议_2026.txt",
        "txt",
        "3.4 KB · 2026-03-01 09:00",
        [
          "甲方：云图数据服务",
          "乙方：个人承包方",
          "",
          "1. 乙方按工单完成资产清点、数据交接与回收。",
          "2. 乙方不得复制、留存或对外提供甲方客户的数据。",
          "3. 交接盘内的文件视为已完成交接。",
          "4. 回收完成后，甲方按单结算。",
        ],
      ),
      localFile(
        "CM-07.rdp",
        "txt",
        "2 KB · 2031-06-15 17:22",
        [
          "full address:s:10.24.7.31",
          "username:s:chenmo",
          "prompt for credentials:i:1",
          "authentication level:i:2",
          "screen mode id:i:2",
        ],
      ),
    ],
    下载: [
      localFile(
        "云图资产工具包_v4.2.zip",
        "bin",
        "12.8 MB · 2031-06-14 18:03",
        ["（压缩包，无法预览）"],
      ),
      localFile(
        "回收流程_2026版.pdf",
        "bin",
        "860 KB · 2026-03-01 09:04",
        ["（PDF，无法预览）"],
      ),
    ],
    桌面: [
      localFile(
        "工时表_六月.txt",
        "txt",
        "412 B · 2031-06-15 12:10",
        [
          "6 月工时",
          "",
          "06-03  网络整改      4h",
          "06-07  打印机维护    2h",
          "06-11  机房盘点      6h",
          "06-15  CM-07 回收    ?",
        ],
      ),
    ],
    图片: [],
    音乐: [],
    视频: [],
  };

  if (phase === "aftermath") {
    folders.交接 = [
      localFile(
        "说明.txt",
        "txt",
        handoverReadme.description,
        [],
        handoverReadme.blocks,
      ),
      ...handoverFileEntries(progress),
    ];

    folders.文档.unshift(
      localFile(
        "ZJ-03.rdp",
        "txt",
        "2 KB · 2031-06-15 18:02",
        [
          "full address:s:10.24.7.44",
          "username:s:zhouning",
          "prompt for credentials:i:1",
          "authentication level:i:2",
          "screen mode id:i:2",
        ],
      ),
    );
  }

  return folders;
};

// ---------------------------------------------------------------------------
// 本机邮件
// ---------------------------------------------------------------------------

const baseEmails = [
  {
    id: "job",
    from: "dispatch@yuntu.data",
    fromName: "调度 · 老赵",
    subject: "工单：CM-07 今天回收",
    time: "6月15日 17:21",
    tag: "工单",
    unread: true,
    headers: [
      "Return-Path: <dispatch@yuntu.data>",
      "From: 调度 · 老赵 <dispatch@yuntu.data>",
      "To: you@local",
      "Date: Sun, 15 Jun 2031 17:21:06 +0800",
      "Subject: 工单：CM-07 今天回收",
      "X-Job: YH-2031-0615-07",
    ],
    blocks: [
      { type: "p", text: "工单发你了，今天必须收完。" },
      {
        type: "p",
        text: "客户是江河测绘院，机器在石桥库区的临时工作站。人已经一个礼拜没来了，院里去把个人物品收走了，主机留给我们。",
      },
      {
        type: "code",
        text: [
          "资产：CM-07",
          "地址：10.24.7.31",
          "用户：chenmo",
          "密码：CM-07-3117",
          "交接盘：Z:\\交接",
          "回收码：4471",
        ].join("\n"),
      },
      {
        type: "p",
        text: "流程你熟：连上去，核对资产，把该交的交到 Z 盘，跑回收，回执自动传。",
      },
      {
        type: "p",
        text: "还有，资产表上这台只登记了一个 C 盘。上个人自己在机器上装过东西，要是看到别的分区，别管它，回头我这边改登记。",
      },
      { type: "p", text: "—— 老赵" },
    ],
  },
  {
    id: "job-follow",
    from: "dispatch@yuntu.data",
    fromName: "调度 · 老赵",
    subject: "补充：CM-07 联系人电话打不通",
    time: "6月15日 17:26",
    tag: "工单",
    unread: true,
    blocks: [
      { type: "p", text: "测绘院给的紧急联系人电话打不通，关机。" },
      {
        type: "p",
        text: "他们那边说人请假了，具体什么时候回来不知道。你不用管，按流程走。",
      },
      { type: "p", text: "交接盘只收正式成果，别的别往里面放。" },
    ],
  },
  {
    id: "asset-notice",
    from: "asset@yuntu.data",
    fromName: "资产系统",
    subject: "资产状态变更：CM-07 → 待回收",
    time: "6月15日 17:18",
    tag: "系统",
    unread: false,
    blocks: [
      {
        type: "p",
        text: "资产 CM-07 已从「在用」变更为「待回收」。",
      },
      {
        type: "code",
        text: [
          "使用人     陈默",
          "部门       测绘二队",
          "登记磁盘   C: 118 GB",
          "登记分区   无",
          "回收窗口   2031-06-15 18:00 前",
        ].join("\n"),
      },
      { type: "p", text: "超期未回收将自动升级为异常工单。" },
    ],
  },
  {
    id: "calendar",
    from: "calendar@local",
    fromName: "日历",
    subject: "提醒：明天 09:00 机房巡检",
    time: "6月15日 16:40",
    tag: "日历",
    unread: false,
    blocks: [
      { type: "p", text: "地点：河口区电信机房 3 楼。" },
      { type: "p", text: "联系人：王工。" },
    ],
  },
  {
    id: "bill",
    from: "billing@cloud.local",
    fromName: "云服务",
    subject: "6 月账单已生成",
    time: "6月15日 07:30",
    tag: "账单",
    unread: false,
    blocks: [
      { type: "p", text: "本月费用 ¥38.00，将于 6 月 20 日自动扣款。" },
      { type: "p", text: "资源：1 台云主机、1 个对象存储桶。" },
    ],
  },
  {
    id: "delivery",
    from: "noreply@express.local",
    fromName: "快递",
    subject: "你的包裹已到达驿站",
    time: "6月15日 12:03",
    tag: "通知",
    unread: false,
    blocks: [{ type: "p", text: "取件码 7-4-1026。请于 20:00 前领取。" }],
  },
];

const receiptEmail = (progress) => {
  const outcome = outcomeOf(progress);
  const receipt = aftermathReceipt(outcome, progress);

  return {
    id: "receipt",
    from: "asset@yuntu.data",
    fromName: "资产系统",
    subject: receipt.subject,
    time: "6月15日 18:01",
    tag: receipt.tag || "回执",
    unread: true,
    blocks: receipt.blocks,
  };
};

const aftermathExtraEmails = (progress) => {
  const list = [];
  const outcome = outcomeOf(progress);

  if (progress.flags.jobClosed && outcome === "private") {
    list.push({
      id: "audit",
      from: "audit@yuntu.data",
      fromName: "内审",
      subject: "关于 CM-07 交接盘内容的说明",
      time: "6月16日 09:14",
      tag: "内部",
      unread: true,
      blocks: [
        {
          type: "p",
          text: "交接盘 Z:\\交接 中出现了未登记在资产成果清单内的资料，共 9 个文件。",
        },
        {
          type: "p",
          text: "请说明来源，以及是否获得资产使用人授权。回复期限：6 月 18 日。",
        },
        { type: "p", text: "在说明完成前，本单暂不结算。" },
      ],
    });
  }

  if (progress.flags.jobClosed && progress.flags.mailSent) {
    list.push({
      id: "media",
      from: "brand@yuntu.data",
      fromName: "品牌部",
      subject: "有没有媒体联系过你",
      time: "6月16日 10:02",
      tag: "内部",
      unread: true,
      blocks: [
        {
          type: "p",
          text: "《河口晚报》今天发了一篇库区测绘的稿子，提到了一台被回收的工作站。",
        },
        {
          type: "p",
          text: "稿子里没有写公司名字。你先不要对外回应，也不要把工单截图发出去。",
        },
        { type: "p", text: "如果有人问，就说按流程处理，其他不清楚。" },
      ],
    });
  }

  if (progress.flags.jobClosed) {
    list.push({
      id: "dispatch-close",
      from: "dispatch@yuntu.data",
      fromName: "调度 · 老赵",
      subject: progress.flags.zhouVisited
        ? "回执收到，ZJ-03 也辛苦了"
        : "回执收到",
      time: "6月15日 18:04",
      tag: "工单",
      unread: false,
      blocks: [
        {
          type: "p",
          text: progress.flags.zhouVisited
            ? "CM-07 的回执收到了。ZJ-03 那台也谢谢你，明天我这边走流程关单。"
            : "CM-07 的回执收到了，这单结了。明天还有一台 ZJ-03，地址和口令发你邮箱了。",
        },
        {
          type: "p",
          text: "今天到这，早点回去。",
        },
      ],
    });
  }

  if (!progress.flags.jobClosed) {
    list.push({
      id: "dispatch-open",
      from: "dispatch@yuntu.data",
      fromName: "调度 · 老赵",
      subject: "CM-07 还在线",
      time: "6月15日 18:06",
      tag: "工单",
      unread: true,
      blocks: [
        {
          type: "p",
          text: "系统里 CM-07 还是「待回收」，你那边是不是没跑完？",
        },
        {
          type: "p",
          text: "机器还在线，你随时能连回去。今天收不掉就明天，别拖过 18 号。",
        },
      ],
    });
  }

  return list;
};

const zhouMail = {
  id: "zhou-job",
  from: "dispatch@yuntu.data",
  fromName: "调度 · 老赵",
  subject: "下一台：ZJ-03（周宁）",
  time: "6月15日 18:02",
  tag: "工单",
  unread: true,
  headers: [
    "From: 调度 · 老赵 <dispatch@yuntu.data>",
    "To: you@local",
    "Date: Sun, 15 Jun 2031 18:02:11 +0800",
    "Subject: 下一台：ZJ-03（周宁）",
  ],
  blocks: [
    { type: "p", text: "明天还有一台，今天顺手看一眼也行，不算回收任务。" },
    {
      type: "code",
      text: [
        "资产：ZJ-03",
        "地址：10.24.7.44",
        "用户：zhouning",
        "密码：ZJ-03-4482",
      ].join("\n"),
    },
    {
      type: "p",
      text: "使用人周宁，测绘二队内业，刚提了离职。机器里没什么东西，D 盘是空的。",
    },
    { type: "p", text: "这台没有回收码，登记表上也没排回收，你连上去确认一下状态就行。" },
  ],
};

// 邮件按发送时间倒序：后到的在上面。
// time 是世界里给玩家看的格式（6月15日 17:21），这里解析成可比较的数字。
const sentAt = (email) => {
  const hit = /^(\d+)月(\d+)日 (\d{2}):(\d{2})$/.exec(email.time || "");
  if (!hit) return 0;
  return (
    Number(hit[1]) * 1e8 +
    Number(hit[2]) * 1e6 +
    Number(hit[3]) * 1e4 +
    Number(hit[4]) * 1e2
  );
};

const byNewest = (list) =>
  [...list].sort((a, b) => sentAt(b) - sentAt(a) || 0);

// 未读只由玩家真的打开过那封信决定，不看 data 里的初始值。
// 打开过就记在 arg.readMail，刷新后从引子重开，自然也会重置。
const isUnread = (email, readMail) =>
  email.unread === true && !readMail.includes(email.id);

const aftermathEmails = (progress) => {
  const closed = progress.flags.jobClosed === true;
  const list = [receiptEmail(progress)];

  if (closed) list.push(zhouMail);
  list.push(...aftermathExtraEmails(progress));

  return [...list, ...baseEmails];
};

export const emailsFor = (phase, progress) => {
  const readMail = (progress && progress.readMail) || [];
  const list = phase === "aftermath" ? aftermathEmails(progress) : baseEmails;

  return byNewest(list).map((email) => ({
    ...email,
    unread: isUnread(email, readMail),
  }));
};

export const rdpMachinesFor = (phase, progress) => {
  // 回收完成后 CM-07 已经从资产表里退役：邮件只会再给 ZJ-03。
  if (progress.flags.jobClosed) return [machines.zhou];
  return [machines.chenmo];
};
