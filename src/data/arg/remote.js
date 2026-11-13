// 远程会话期间的内容：调度聊天、资产盘点、分区信息、回收工具文案。

import { machines, retireCode, timeline } from "./config";

export const dispatchName = "调度 · 老赵";

// 调度只陈述他那边看到的真实状态，不发任务清单，也不告诉玩家下一步。
export const dispatchChatter = [
  {
    id: "c-hello",
    host: "chenmo",
    delay: 2200,
    text: "连上了？资产编号对一下，CM-07。",
  },
  {
    id: "c-hello-zhou",
    host: "zhou",
    delay: 2200,
    text: "ZJ-03 也连上了。这台明天才排，你先看状态。",
  },
  {
    id: "c-scan",
    host: "chenmo",
    flags: ["assetScanned"],
    text: "资产平台那边只登记了一个 C 盘。",
  },
  {
    id: "c-mount",
    host: "chenmo",
    flags: ["partitionMounted"],
    text: "台账里没有 D 盘。回头我改一下，你按流程走。",
  },
  {
    id: "c-notebook",
    host: "chenmo",
    flags: ["readNotebook"],
    text: "个人文件别带走。协议第 2 条你签过。",
  },
  {
    id: "c-transcript",
    host: "chenmo",
    flags: ["readTranscript"],
    text: "回收站里的东西也算数据，别漏。",
  },
  {
    id: "c-draft",
    host: "chenmo",
    flags: ["mailDraftOpen"],
    text: "院里的邮箱是他们的，别在里面发东西。",
  },
  {
    id: "c-copy",
    host: "chenmo",
    flags: ["handoverCopied"],
    text: "Z 盘有文件进来了。",
  },
  {
    id: "c-retire",
    host: "chenmo",
    flags: ["retireReady"],
    text: "回收码对上了就跑，窗口快到了。",
  },
  {
    id: "c-zhou",
    host: "zhou",
    flags: ["readZhouReview"],
    text: "内业机里没什么东西，D 盘是空的。",
  },
  {
    id: "c-zhou-note",
    host: "zhou",
    flags: ["readZhouNote"],
    text: "周宁已经提离职了，这台不用动。",
  },
];

export const dispatchMessages = (progress, elapsed) => {
  const flags = progress.flags || {};
  const host = progress.host || "chenmo";

  return dispatchChatter.filter((item) => {
    if (item.host && item.host !== host) return false;
    if (item.flags && !item.flags.every((flag) => flags[flag] === true)) {
      return false;
    }
    if (typeof item.delay === "number") return elapsed >= item.delay;
    return true;
  });
};

// ---------------------------------------------------------------------------
// 资产盘点
// ---------------------------------------------------------------------------

const chenmoAsset = (flags) => ({
  assetId: "CM-07",
  owner: "陈默",
  department: "测绘二队 · 外业",
  site: "石桥库区临时工作站",
  status: "待回收",
  window: "2031-06-15 18:00 前",
  lastSeen: timeline.remoteLastWrite,
  volumes: [
    {
      drive: "C:",
      label: "系统",
      size: "118 GB",
      fs: "NTFS",
      registered: true,
      note: "登记在资产表内",
    },
    ...(flags.assetScanned
      ? [
          {
            drive: "—",
            label: "未分配空间",
            size: "12.0 GB",
            fs: "NTFS",
            registered: false,
            note: "扫描到 1 个未登记卷",
          },
        ]
      : []),
  ],
  note: flags.assetScanned
    ? "本机磁盘数量与资产登记不一致。"
    : "上次扫描：2031-06-12 09:12。",
});

const zhouAsset = () => ({
  assetId: "ZJ-03",
  owner: "周宁",
  department: "测绘二队 · 内业",
  site: "测绘二队内业机房",
  status: "在用",
  window: "—",
  lastSeen: "2031-06-13 09:12",
  volumes: [
    {
      drive: "C:",
      label: "系统",
      size: "256 GB",
      fs: "NTFS",
      registered: true,
      note: "登记在资产表内",
    },
    {
      drive: "D:",
      label: "数据",
      size: "64 GB",
      fs: "NTFS",
      registered: true,
      note: "登记在资产表内",
    },
  ],
  note: "本资产未分配回收任务。",
});

export const assetProfile = (hostId, progress) => {
  const flags = (progress && progress.flags) || {};
  return hostId === "zhou" ? zhouAsset() : chenmoAsset(flags);
};

// ---------------------------------------------------------------------------
// 分区
// ---------------------------------------------------------------------------

export const partitionProfile = (hostId, progress) => {
  const flags = (progress && progress.flags) || {};

  if (hostId === "zhou") {
    return {
      assetId: "ZJ-03",
      unallocated: null,
      volumes: [
        { drive: "C:", size: "256 GB", fs: "NTFS", status: "正常" },
        { drive: "D:", size: "64 GB", fs: "NTFS", status: "正常" },
      ],
      note: "未发现需要修复的分区。",
    };
  }

  return {
    assetId: "CM-07",
    unallocated: flags.partitionMounted ? null : "12.0 GB",
    volumes: [
      { drive: "C:", size: "118 GB", fs: "NTFS", status: "正常" },
      ...(flags.partitionMounted
        ? [{ drive: "D:", size: "12.0 GB", fs: "NTFS", status: "已挂载" }]
        : []),
    ],
    label: "我的测绘",
    note: flags.partitionMounted
      ? "分区已挂载，可在文件管理器中访问 D:。"
      : "扫描到 1 个未挂载卷。",
  };
};

// ---------------------------------------------------------------------------
// 回收
// ---------------------------------------------------------------------------

export const retireInfo = (hostId, progress) => {
  const machine = machines[hostId] || machines.chenmo;
  const flags = (progress && progress.flags) || {};
  const hasTask = machine.retireTask !== false;

  return {
    assetId: machine.hostname,
    owner: machine.owner,
    hasTask,
    code: retireCode,
    volumes: [
      "C:",
      ...(hostId !== "zhou" && flags.partitionMounted ? ["D:"] : []),
    ],
    note: hasTask
      ? "回收完成后，本机所有分区将被擦除，交接盘不受影响。"
      : "该资产未分配回收任务。",
  };
};

// ---------------------------------------------------------------------------
// 回收站
// ---------------------------------------------------------------------------

// 陈默删掉的现场录音。还原后才能听到内容；回收站里不解释它是什么。
export const recycleItem = {
  name: "REC_0611_1520.wav",
  kind: "audio",
  size: "30.2 MB",
  deletedAt: "2031-06-11 18:20",
  deletedBy: "chenmo",
  origin: "D:\\我的测绘",
  duration: 402,
  recLabel: "REC",
  lines: [
    { at: 0, text: "（推门声，椅子挪动）" },
    { at: 6, text: "陈默：刘工，户表我数完了，37 户，99 个人。" },
    { at: 18, text: "刘工：设计书上的范围你看了没有？" },
    { at: 24, text: "陈默：看了，可是人就在范围里。" },
    { at: 31, text: "刘工：设计书是建设单位给的。我们按给定的范围施测。" },
    { at: 44, text: "陈默：学校也在里面，11 个学生。" },
    { at: 52, text: "刘工：这个不归我们管。你把手上的点交了就回来。" },
    { at: 63, text: "陈默：那祖坟呢？后山 14 座。" },
    { at: 70, text: "刘工：成果表上没有这一栏。" },
    { at: 77, text: "陈默：所以我记的东西不算数？" },
    { at: 85, text: "刘工：陈默，我再跟你说一遍。库区范围内无永久居民。" },
    { at: 98, text: "（录音中断）" },
  ],
};

export const toolText = {
  assetTitle: "资产盘点",
  assetScan: "重新扫描",
  assetScanning: "正在读取磁盘信息…",
  partitionTitle: "分区修复",
  partitionScan: "重新扫描",
  partitionMount: "挂载分区",
  retireTitle: "回收工具",
  retireSubmit: "继续",
  retireConfirm: "确认回收",
  retireCancel: "取消",
  retireWrong: "回收码不正确。",
};
