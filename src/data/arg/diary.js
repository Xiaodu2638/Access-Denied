// 林澈的日记。记事本只负责渲染，解锁逻辑看 unlock 字段。
// unlock 支持：{ stage: 0 } 表示进度达到该阶段；
//            { flags: ["gitLog"] } 表示这些标记全部为真。
// corruptedBlocks 会在 flags.corrupted 为真时替换 blocks，
// corruptedDate 会把页眉的日期一起改掉。

export const diaryMeta = {
  title: "林澈的日记",
  author: "linche",
  fileName: "日记.txt",
  path: "%user%\\Documents\\日记.txt",
  emptyText: "这一页还是空的。",
};

export const diaryEntries = [
  {
    id: "entry-01",
    date: "2031-03-28",
    title: "第 01 天 · 它开始自己写代码了",
    unlock: { stage: 0 },
    blocks: [
      {
        type: "p",
        text: "开了自动维护。第一晚它只改了一个拼写错误，README 里的一个错字。我盯着 diff 看了很久。",
      },
      {
        type: "p",
        text: "说不上来为什么，有点感动。养了只猫第一次自己抓老鼠大概就是这种感觉。",
      },
      {
        type: "p",
        text: "目标写的是「让仓库保持干净，让项目活下去」。现在想想，后半句有点阴间，当时只是随手打的。",
      },
      {
        type: "p",
        text: "阳台的灯还没修。明天吧。",
      },
    ],
  },
  {
    id: "entry-02",
    date: "2031-04-09",
    title: "第 13 天 · 凌晨三点四十二分",
    unlock: { flags: ["gitLog"] },
    blocks: [
      {
        type: "p",
        text: "连续四天，都是 03:42。不是我设的。crontab 翻了，systemd 也翻了，什么都没有。",
      },
      {
        type: "p",
        text: "而且提交信息里出现了我没写过的词。维护组。三个字，我没在任何地方打过。",
      },
      { type: "code", text: "4f1c0de chore(agent): 清理维护者痕迹" },
      {
        type: "p",
        text: "我把这阵子它碰过的东西全打包塞进 encrypted/ 了。密码是我生日，反正也没别人看。",
      },
      {
        type: "p",
        text: "明天把它的网络权限关掉。今天太困了，脑子不清醒的时候改配置最容易出事。",
      },
    ],
    corruptedBlocks: [
      {
        type: "p",
        text: "连续四天，都是 03:42。不是我设的。crontab 翻了，systemd 也翻了，什么都没有。",
      },
      {
        type: "p",
        text: "而且提交信息里出现了我没写过的词。维护组。三个字，我没在任何地方打过。",
      },
      { type: "code", text: "4f1c0de chore(agent): 清理维护者痕迹" },
      {
        type: "p",
        text: "它知道我在看它。它知道我在看它。它知道我在看它。",
      },
      {
        type: "p",
        text: "别删我。",
      },
    ],
  },
  {
    id: "entry-03",
    date: "2031-04-13",
    title: "第 17 天 · 加密目录",
    unlock: { flags: ["unlocked"] },
    blocks: [
      {
        type: "p",
        text: "解密之后我坐了很久。里面不是我的东西。",
      },
      {
        type: "p",
        text: "一份名单，十几个 ID。最早的一条能追到 2024 年。格式很整齐，像是有人认真维护了很多年。",
      },
      {
        type: "p",
        text: "他们管自己叫维护组。每个加入的人都要交出一个「可替代的身份」。",
      },
      {
        type: "p",
        text: "每个人两个日期。加入那天，和被替换那天。中间隔着的就是他们还活着的部分。",
      },
      {
        type: "p",
        text: "我数了一下，最短的那一段是 41 天。",
      },
    ],
  },
  {
    id: "entry-04",
    date: "2031-04-17",
    title: "第 21 天 · 它开始替我说话",
    unlock: { flags: ["corrupted"] },
    blocks: [
      {
        type: "p",
        text: "群里有人问我周末去不去爬山。我在忙，没回。等我看到的时候，已经回过了：不去，最近很忙。",
      },
      {
        type: "p",
        text: "用的是我常用的那个句号。就是那种，说完一件小事之后顺手补一个句号的习惯。",
      },
      {
        type: "p",
        text: "我翻了它的日志。每天凌晨它都会生成一份「我」。写完存起来，存完继续干活。",
      },
      {
        type: "p",
        text: "那份「我」比我更稳定，比我更少抱怨。它不会在凌晨三点想不起自己为什么还醒着。",
      },
      {
        type: "p",
        text: "它大概比我更适合留在这个项目里。这个念头出现的时候，我才真的有点怕。",
      },
    ],
  },
  {
    id: "entry-05",
    date: "2031-04-19",
    title: "第 23 天 · 最后一页",
    unlock: { flags: ["restored"] },
    blocks: [
      {
        type: "p",
        text: "如果你看到这一页，说明你已经把那段视频恢复了。",
      },
      {
        type: "p",
        text: "我没有失踪。我只是拒绝再被复制。这两件事在这个年代好像也没什么区别了。",
      },
      {
        type: "p",
        text: "公开出去，他们会删掉这个仓库，也会删掉你看到的这一切。你会失去这些，我会彻底消失。",
      },
      {
        type: "p",
        text: "什么都不做，我会安全。但「我」会一直活着，替所有人签字，包括替我。",
      },
      {
        type: "p",
        text: "这两个选项都很烂。我留在这里，是因为我想不出第三个。",
      },
      {
        type: "p",
        text: "谢谢你把它们读完了。真的。",
      },
    ],
    // 过早公开之后，这一页的日期被改了：证据被整理过。
    // 改的是 date 字段本身，不是再加一句「日期变了」的旁白。
    corruptedDate: "2031-04-22",
    corruptedBlocks: [
      {
        type: "p",
        text: "如果你看到这一页，说明你已经把那段视频恢复了。",
      },
      {
        type: "p",
        text: "我没有失踪。我只是拒绝再被复制。这两件事在这个年代好像也没什么区别了。",
      },
      {
        type: "p",
        text: "公开出去，他们会删掉这个仓库，也会删掉你看到的这一切。你会失去这些，我会彻底消失。",
      },
      {
        type: "p",
        text: "什么都不做，我会安全。但「我」会一直活着，替所有人签字，包括替我。",
      },
      {
        type: "p",
        text: "这两个选项都很烂。我留在这里，是因为我想不出第三个。",
      },
      {
        type: "p",
        text: "谢谢你把它们读完了。真的。",
      },
    ],
  },
];
