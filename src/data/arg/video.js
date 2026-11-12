// 回收站里的自述视频。
// 如果 public/arg/linche.mp4 存在，就播放真实视频；
// 否则用这里的字幕做“REC 播放”占位。

export const videoMeta = {
  fileName: "linche_final.mp4",
  title: "linche_final.mp4",
  duration: 48,
  src: "arg/linche.mp4",
  poster: "",
  deletedAt: "2031-04-19 03:44",
  deletedBy: "unknown",
  size: "18.4 MB",
  recLabel: "REC ●",
  placeholderNotice: "原始视频已损坏，以下为恢复出的字幕记录。",
};

export const videoLines = [
  { at: 0, text: "（画面晃动，镜头对着桌面，时间显示 03:41）" },
  { at: 4, text: "林澈：我把这个录下来，是因为我不确定明天还是不是我。" },
  { at: 9, text: "林澈：agent 已经连续 11 天用我的身份提交代码。" },
  { at: 14, text: "林澈：它比我更准时，比我更少出错，也比我更听话。" },
  { at: 20, text: "林澈：维护组的人今天下午来过。他们说这是“升级”。" },
  { at: 26, text: "林澈：如果一个人可以被完美复制，那原来那个算什么？" },
  { at: 33, text: "（画面外传来键盘声，终端自动输入了一行字）" },
  { at: 37, text: "林澈：……谁在打字？" },
  { at: 41, text: "（画面黑掉，最后 7 秒只有音频）" },
  { at: 44, text: "林澈（很轻）：别让他替我签字。" },
];
