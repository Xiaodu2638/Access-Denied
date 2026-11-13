// 四种结果由玩家做过的事决定，不出现选择菜单。
//   official    只把正式成果放进交接盘
//   private     把「我的测绘」里的东西也放进了交接盘
//   empty       什么都没交，直接回收
//   unrecovered 没有跑回收就断开，资产还挂在系统里
//
// 结果只影响后续邮件、新闻与回执措辞；画面始终是玩家自己的桌面。

import { nodeOf } from "./files";

const p = (text) => ({ type: "p", text });
const h = (text) => ({ type: "h", text });
const code = (text) => ({ type: "code", text });

export const outcomeMeta = {
  official: {
    id: "official",
    label: "官方交接",
  },
  private: {
    id: "private",
    label: "私人交接",
  },
  empty: {
    id: "empty",
    label: "空手回收",
  },
  unrecovered: {
    id: "unrecovered",
    label: "资产未回收",
  },
};

export const handoverFiles = (progress) => progress.handover || [];

const hasPrivate = (progress) =>
  handoverFiles(progress).some((entry) => {
    const node = nodeOf(entry.host, entry.id);
    return node && node.private === true;
  });

export const outcomeOf = (progress) => {
  const flags = (progress && progress.flags) || {};

  if (!flags.jobClosed) return "unrecovered";

  const files = handoverFiles(progress);
  if (!files.length) return "empty";
  if (hasPrivate(progress)) return "private";
  return "official";
};

// 回执邮件。只陈述系统实际收到/没收到的东西。
export const aftermathReceipt = (outcome, progress) => {
  const files = handoverFiles(progress);
  const minutes = (progress && progress.flags && progress.flags.elapsed) || 0;

  if (outcome === "official") {
    return {
      subject: "回收完成：CM-07",
      tag: "回执",
      blocks: [
        p("资产 CM-07 已完成回收，主机状态变更为「已退役」。"),
        code(
          [
            `交接文件   ${files.length} 个`,
            "交接位置   Z:\\交接",
            "擦除范围   C:",
            "完成时间   2031-06-15 18:00",
          ].join("\n"),
        ),
        p("成果清单与交接内容一致，本单已归档。"),
      ],
    };
  }

  if (outcome === "private") {
    return {
      subject: "回收完成：CM-07（内容待核对）",
      tag: "回执",
      blocks: [
        p("资产 CM-07 已完成回收，主机状态变更为「已退役」。"),
        code(
          [
            `交接文件   ${files.length} 个`,
            "交接位置   Z:\\交接",
            "擦除范围   C:、D:",
            "完成时间   2031-06-15 18:00",
          ].join("\n"),
        ),
        p("交接盘内有资料不在本单成果清单中，已转内审核对。"),
      ],
    };
  }

  if (outcome === "empty") {
    return {
      subject: "回收完成：CM-07",
      tag: "回执",
      blocks: [
        p("资产 CM-07 已完成回收，主机状态变更为「已退役」。"),
        code(
          [
            "交接文件   0 个",
            "交接位置   Z:\\交接",
            "擦除范围   C:",
            "完成时间   2031-06-15 18:00",
          ].join("\n"),
        ),
        p("本单未收到交接文件。"),
      ],
    };
  }

  return {
    subject: "资产状态：CM-07 仍为待回收",
    tag: "系统",
    blocks: [
      p("未收到 CM-07 的回收完成信号。"),
      code(
        [
          "资产状态   待回收",
          "最后连接   2031-06-15 17:4x",
          "回收窗口   2031-06-18 前",
          "交接文件   " + files.length + " 个",
        ].join("\n"),
      ),
      p("资产仍在线，可继续连接。"),
      minutes ? p(`会话时长 ${minutes} 分钟。`) : null,
    ].filter(Boolean),
  };
};

// 本机新闻页。
// 稿子只在记者线真的发出去之后才出现；其余情况按结局给一条中性本地新闻，
// 让玩家自己撞见后果，而不是由系统写一段总结告诉他发生了什么。
export const newsArticle = {
  title: "库区测绘成果里的空白",
  byline: "河口晚报 · 林嘉 · 2031-06-15 18:40",
  blocks: [
    p(
      "石桥库区下闸蓄水前，测绘成果表上写着：库区范围内无永久居民，居民点 0，学校 0，坟墓 0。",
    ),
    p(
      "但记者拿到的另一份记录显示，坝址上游仍有 37 户、99 人居住，石桥小学有一个复式班 11 名学生，后山有 14 座祖坟。",
    ),
    p(
      "这份记录来自一台已被回收的测绘工作站。资料显示，外业人员曾在 6 月 11 日与项目办人员现场交涉，质疑成果表与实地不符。",
    ),
    p("江河测绘院截至发稿未回应。建设管理单位表示，将按程序核查库区实物指标。"),
    p("云图数据服务未对回收流程作出说明。"),
  ],
};

// 记者线没发出去时，本地版面上留下的东西。
const quietNews = (outcome) => {
  if (outcome === "unrecovered") {
    return {
      title: "河口晚报 · 本地",
      byline: "2031-06-15",
      blocks: [
        p("今日要闻：城区三处积水点完成改造。"),
        p("石桥水利枢纽下闸蓄水进入倒计时，库区周边道路将实施临时管制。"),
        p("本地招聘会本周三在体育馆举行。"),
      ],
    };
  }

  if (outcome === "empty") {
    return {
      title: "河口晚报 · 本地",
      byline: "2031-06-15",
      blocks: [
        p("今日要闻：城区三处积水点完成改造。"),
        p("石桥水利枢纽下闸蓄水进入倒计时，库区周边道路将实施临时管制。"),
        h("分类广告"),
        p("单位报废电脑一批，已由回收方清运，无数据留存。"),
      ],
    };
  }

  if (outcome === "private") {
    return {
      title: "河口晚报 · 本地",
      byline: "2031-06-15",
      blocks: [
        p("今日要闻：城区三处积水点完成改造。"),
        p("石桥水利枢纽下闸蓄水进入倒计时，库区周边道路将实施临时管制。"),
        h("读者来信"),
        p(
          "一位不愿具名的读者致电本报，询问库区实物指标复核何时公示。编辑部已转交相关部门。",
        ),
      ],
    };
  }

  // official
  return {
    title: "河口晚报 · 本地",
    byline: "2031-06-15",
    blocks: [
      p("今日要闻：城区三处积水点完成改造。"),
      p("石桥水利枢纽下闸蓄水进入倒计时，库区周边道路将实施临时管制。"),
      h("公告"),
      p(
        "石桥库区实物指标复核结果将于近期公示。建设管理单位表示，库区范围内无永久居民。",
      ),
    ],
  };
};

export const localNews = (progress) => {
  const flags = (progress && progress.flags) || {};
  if (flags.mailSent) return newsArticle;
  return quietNews(outcomeOf(progress));
};
