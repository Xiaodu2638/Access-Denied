// 引子：主角自己的桌面与那封延迟邮件。
// 这是玩家进入「未授权访问」之前的唯一入口，也解释了远程会话的来源。

import { sessionLog } from "./config";

export const prologue = {
  host: {
    label: "我的电脑",
    user: "you",
    account: "you@local",
    date: "2031-04-22",
    time: "09:12",
  },

  desktopIcons: [
    { id: "vscode", label: "VS Code", icon: "code" },
    { id: "terminal", label: "终端", icon: "terminal" },
    { id: "github", label: "GitHub", icon: "github" },
    { id: "browser", label: "浏览器", icon: "edge" },
    { id: "mail", label: "邮件", icon: "mail" },
    { id: "pc", label: "此电脑", icon: "explorer" },
    { id: "bin", label: "回收站", icon: "bin1" },
  ],

  // 只在开始菜单里出现、不占桌面位置的应用。
  startMenuOnly: [
    { id: "rdp", label: "远程桌面连接", icon: "rdp" },
    { id: "settings", label: "设置", icon: "settings" },
  ],

  // 本机「此电脑」里的内容。
  // linche.cred 是真实 Windows 凭据导出格式，密码是其中一个普通字段。
  // 不要在这里加任何"这就是答案"式的注释。
  localFolders: {
    文档: [
      {
        name: "linche.cred",
        kind: "cred",
        meta: "1 KB · 2031-04-21 03:42",
        lines: [
          "; exported 2031-04-21 03:42",
          "",
          "[Credentials]",
          "Target=TERMSRV/10.24.7.31",
          "UserName=linche",
          "Password=834",
          "Persist=LocalMachine",
        ],
      },
      {
        // Windows 每次连接都会留下这样的文件。修改时间是关键。
        name: "10.24.7.31.rdp",
        kind: "txt",
        meta: "2 KB · 2031-04-21 03:42",
        lines: [
          "full address:s:10.24.7.31",
          "username:s:linche",
          "prompt for credentials:i:0",
          "authentication level:i:2",
          "screen mode id:i:2",
        ],
      },
      {
        name: "会议记录.txt",
        kind: "txt",
        meta: "2.4 KB · 2031-04-20 14:10",
        lines: [
          "4 月 20 日 周会",
          "",
          "1. render-lab 的帧率问题还没定位，下周继续。",
          "2. 域名续费这周处理掉。",
          "3. 有人问 linche 怎么最近没动静，我先没回。",
        ],
      },
    ],
    下载: [
      {
        name: "node-v22.23.4-x64.msi",
        kind: "bin",
        meta: "28.1 MB · 2031-04-18 21:03",
        lines: ["（安装包，无法预览）"],
      },
      {
        name: "mdn-html-reference.zip",
        kind: "bin",
        meta: "6.8 MB · 2031-04-12 10:22",
        lines: ["（压缩包，无法预览）"],
      },
    ],
    桌面: [
      {
        name: "render-lab.code-workspace",
        kind: "txt",
        meta: "412 B · 2031-04-21 23:20",
        lines: [
          "{",
          '  "folders": [{ "path": "D:\\\\code\\\\render-lab" }],',
          '  "settings": { "editor.fontSize": 13 }',
          "}",
        ],
      },
    ],
    图片: [],
    音乐: [],
    视频: [],
  },

  mailbox: {
    title: "邮件",
    folders: ["收件箱", "已发送", "草稿", "垃圾邮件"],
    activeFolder: "收件箱",
    unreadLabel: "未读",
  },

  emails: [
    {
      id: "linche",
      from: "linche@linche.dev",
      fromName: "林澈",
      subject: "如果你看到这封信",
      time: "4月19日 03:41",
      tag: "延迟发送",
      unread: true,
      // 原始邮件头。发件人、排队时间都是真的。
      headers: [
        "Return-Path: <linche@linche.dev>",
        "Received: from linche.dev by local; 2031-04-22 09:12:04 +0800",
        "From: 林澈 <linche@linche.dev>",
        "To: you@local",
        "Message-ID: <0341.72h@linche.dev>",
        "X-Queued-At: 2031-04-19 03:41:07 +0800",
        "X-Delayed-Send: 72h",
        "X-Delivered: 2031-04-22 09:12:04 +0800",
        "Subject: 如果你看到这封信",
      ],
      blocks: [
        {
          type: "p",
          text: "这封信设置了 72 小时延迟。你收到它，说明我已经三天没登录任何账号了。",
        },
        {
          type: "p",
          text: "我的远程会话还挂在那台机器上。地址：",
        },
        { type: "code", text: "10.24.7.31" },
        { type: "p", text: "用户名 linche。密码不在信里。" },
        { type: "p", text: "—— 林澈" },
      ],
    },
    {
      id: "system",
      from: "remote@local",
      fromName: "远程桌面",
      subject: "会话凭据已附加",
      time: "4月22日 09:00",
      tag: "系统",
      unread: true,
      // 9:00:07 只是远端排队时间；到你机器上是 09:12:04，和开机同一秒。
      headers: [
        "Return-Path: <remote@local>",
        "Received: from LIN-DESKTOP (10.24.7.31)",
        "          by local; 2031-04-22 09:12:04 +0800",
        "From: 远程桌面 <remote@local>",
        "To: you@local",
        "Message-ID: <4f1c0de.0342@lin-desktop>",
        "X-Queued-At: 2031-04-22 09:00:07 +0800",
        "X-Session: 0x0342",
        "X-Source: file:///var/session/0x0342.dump",
        "Subject: 会话凭据已附加",
      ],
      blocks: [
        { type: "p", text: "检测到当前离线会话可以恢复。" },
        {
          type: "code",
          text: [
            "主机：LIN-DESKTOP",
            "地址：10.24.7.31",
            "用户：linche",
            "会话：0x0342",
          ].join("\n"),
        },
        {
          type: "h",
          text: "连接日志",
        },
        {
          type: "code",
          text: sessionLog.join("\n"),
        },
        { type: "p", text: "恢复凭据需要在本机会话中确认。" },
      ],
    },
    {
      id: "maintainer",
      from: "no-reply@maintenance.group",
      fromName: "维护组",
      subject: "请忽略上一封邮件",
      time: "4月22日 08:59",
      tag: "无签名",
      unread: false,
      blocks: [
        { type: "p", text: "林澈的会话已经结束。请不要尝试恢复它。" },
        {
          type: "p",
          text: "如果你已经打开了那台机器，请关闭它，并删除这封邮件。",
        },
        { type: "p", text: "维护组会记得你的配合。" },
        { type: "quote", text: "这封邮件没有发件人签名。" },
      ],
    },
    {
      id: "maintenance-digest",
      from: "ops@maintenance.group",
      fromName: "维护组 · 运营",
      subject: "【周报】第 187 期 · 资产与排期",
      time: "4月21日 18:00",
      tag: "内部",
      unread: false,
      blocks: [
        { type: "p", text: "本周完成：" },
        {
          type: "code",
          text: [
            "替换完成      2（@l1nux, @bitrot）",
            "归档          1（@ghost_0）",
            "待处理        1（@linche）",
            "资产表更新    已提交，等待复核",
          ].join("\n"),
        },
        { type: "p", text: "下周排期：" },
        {
          type: "code",
          text: [
            "周二    @linche 交接（第 1 次）",
            "周三    资产表复核",
            "周四    例常清理",
          ].join("\n"),
        },
        {
          type: "p",
          text: "另外提醒：上季度差旅报销还有 3 笔未提交，请在 4 月底前补齐。发票抬头写全称。",
        },
        { type: "p", text: "有问题找运营，不要直接找负责人。" },
      ],
    },
    {
      id: "maintenance-reminder",
      from: "no-reply@maintenance.group",
      fromName: "维护组",
      subject: "资产表待复核（第 2 次提醒）",
      time: "4月20日 09:12",
      tag: "系统",
      unread: false,
      blocks: [
        { type: "p", text: "你有一条资产表更新等待复核，已超期 3 天。" },
        {
          type: "p",
          text: "记录编号：MT-2031-0419-0342",
        },
        {
          type: "code",
          text: [
            "资产：linche-agent",
            "归属：@linche",
            "状态：待处理",
            "负责人空缺，已自动分配",
          ].join("\n"),
        },
        { type: "p", text: "如已处理，请忽略本提醒。" },
      ],
    },
    {
      id: "github-digest",
      from: "digest@github.com",
      fromName: "GitHub",
      subject: "你关注的仓库有 3 条新动态",
      time: "4月22日 08:12",
      tag: "订阅",
      unread: false,
      blocks: [
        {
          type: "p",
          text: "blueedgetechno/win11React 发布了 v2.1.0。",
        },
        {
          type: "p",
          text: "linche-agent 有 1 个未读 issue：关于 03:42 的定时任务。",
        },
        {
          type: "quote",
          text: "你可以在通知设置中关闭此类摘要。",
        },
      ],
    },
    {
      id: "cloud-bill",
      from: "billing@cloud.dev",
      fromName: "云服务",
      subject: "4 月账单已生成",
      time: "4月22日 07:30",
      tag: "账单",
      unread: false,
      blocks: [
        {
          type: "p",
          text: "本月费用 ¥42.00，将于 4 月 26 日自动扣款。",
        },
        {
          type: "p",
          text: "资源：1 台云主机、1 个对象存储桶、1 个快照。",
        },
      ],
    },
    {
      id: "calendar",
      from: "calendar@local",
      fromName: "日历",
      subject: "提醒：周四 10:00 项目同步",
      time: "4月22日 08:45",
      tag: "日历",
      unread: true,
      blocks: [
        { type: "p", text: "会议主题：linche-agent 周会" },
        { type: "p", text: "组织者：linche" },
        {
          type: "p",
          text: "状态：组织者已 3 天未响应。会议可能自动取消。",
        },
      ],
    },
    {
      id: "delivery",
      from: "noreply@express.local",
      fromName: "快递",
      subject: "你的包裹已到达驿站",
      time: "4月22日 08:03",
      tag: "通知",
      unread: false,
      blocks: [
        {
          type: "p",
          text: "取件码 3-2-4719。请于 18:00 前领取。",
        },
      ],
    },
  ],

  connect: {
    title: "远程桌面连接",
    address: "10.24.7.31",
    lines: [
      "正在连接 10.24.7.31 …",
      "正在协商会话 0x0342 …",
      "正在复用用户 linche 的桌面 …",
      "警告：该会话未正常结束。",
      "正在进入 …",
    ],
    stepDelay: 480,
    holdDelay: 700,
    fadeDelay: 450,
  },
};
