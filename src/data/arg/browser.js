// 远程机器上的内部网站：院 OA、网页邮件、资产平台、本地新闻。
// 没有 iframe，也不请求外网；地址栏只接受这里定义的地址与别名。

import { companies, machines, timeline } from "./config";
import { localNews } from "./endings";

const p = (text) => ({ type: "p", text });
const h = (text) => ({ type: "h", text });
const code = (text) => ({ type: "code", text });

export const browserMeta = {
  home: "oa",
  notFound: {
    title: "无法访问此页面",
    blocks: [p("这个地址不在当前网络的白名单里。")],
  },
};

// ---------------------------------------------------------------------------
// 网页邮件
// ---------------------------------------------------------------------------

export const chenmoDraft = {
  id: "draft-reporter",
  to: "reporter@hekouwanbao.com",
  toName: "河口晚报 · 采访部",
  subject: "石桥库区测绘记录（附件）",
  // 陈默设过定时，但机器 6 月 12 日就断线了，这个任务没有执行。
  // 玩家看到的是「没发出去」的草稿，按不按由他自己决定。
  time: "草稿 · 定时 17:40 未执行",
  scheduled: timeline.mailScheduled,
  attachments: [
    "户表.csv",
    "学校.txt",
    "祖坟记录.txt",
    "照片说明.txt",
    "录音_0611.txt",
  ],
  blocks: [
    p("张记者："),
    p(
      "附件是我在石桥村记的东西。公司在成果表上写库区范围内无永久居民，我签不了这个字。",
    ),
    p(
      "37 户，99 个人，一所小学 11 个学生，后山 14 座祖坟。照片和录音都在附件里。",
    ),
    p("如果我没再联系你，东西就按这个发。"),
    p("陈默"),
  ],
};

const commonMessages = [
  {
    id: "m-liu",
    from: "刘建国",
    fromName: "刘建国 · 项目办",
    subject: "成果表按设计书出",
    time: "6月9日 16:41",
    blocks: [
      p("陈默："),
      p(
        "成果表按建设单位给的设计书出，居民点、学校、坟墓都填 0。你手上的外业点交了就行，别在表里加栏目。",
      ),
      p("月底要交图，别再拖。"),
    ],
  },
  {
    id: "m-system",
    from: "system@jhch.cn",
    fromName: "院邮件系统",
    subject: "6 月成果提交提醒",
    time: "6月12日 08:00",
    blocks: [
      p("测绘二队：石桥库区 1:2000 地形图尚未提交。"),
      p("请于 2031-06-30 前完成成果归档。"),
    ],
  },
];

export const mailboxes = {
  chenmo: {
    account: "chenmo@jhch.cn",
    label: "院邮件系统",
    messages: [
      ...commonMessages,
      {
        id: "m-zhou",
        from: "zhouning@jhch.cn",
        fromName: "周宁",
        subject: "复核记录我放你机器上了",
        time: "6月10日 09:12",
        blocks: [
          p("陈默："),
          p("我又跟镇里进了一次村，数出来和你说的一样。37 户，11 个学生，14 座坟。"),
          p("我把复核记录放在你机器的文档里了。成果表我不签，已经跟队里说了。"),
          p("你自己小心。"),
        ],
      },
    ],
    draft: chenmoDraft,
  },
  zhou: {
    account: "zhouning@jhch.cn",
    label: "院邮件系统",
    messages: [
      {
        id: "m-chen",
        from: "chenmo@jhch.cn",
        fromName: "陈默",
        subject: "最后一条",
        time: "6月12日 17:42",
        blocks: [
          p("周宁："),
          p(
            "如果明天我没来，别找我。我的东西在 D 盘，你看得到就拿走，看不到就算了。",
          ),
          p("你签不签是你的事，别把自己搭进去。"),
        ],
      },
      ...commonMessages,
    ],
    draft: null,
  },
};

export const draftState = (progress) => {
  const flags = (progress && progress.flags) || {};
  if (flags.mailSent) return "sent";
  if (flags.mailDiscarded) return "discarded";
  if (flags.mailDestroyed) return "destroyed";
  return "draft";
};

// ---------------------------------------------------------------------------
// 页面
// ---------------------------------------------------------------------------

const oaPage = {
  id: "oa",
  address: "oa.jhch.cn",
  title: "江河测绘院 · 协同办公",
  links: [
    { label: "院邮件", page: "mail" },
    { label: "资产平台", page: "asset" },
    { label: "本地新闻", page: "news" },
  ],
  blocks: [
    h("通知公告"),
    p("关于开展 2031 年“安全生产月”活动的通知"),
    p("关于石桥水利枢纽库区地形测绘成果提交的通知"),
    p("测绘二队外业记录回收情况（第 23 周）"),
    h("项目动态"),
    p(
      "石桥库区 1:2000 地形图：控制点复测完成，成果编制中，计划 6 月底交付。",
    ),
    p("库区实物指标复核：由建设单位另行组织。"),
    h("待办"),
    p("成果表签字：测绘二队 2 人未签。"),
    p("外业记录：CM-07 未交回。"),
  ],
};

const newsPage = (progress) => ({
  id: "news",
  address: "news.hekou.local",
  title: "河口晚报 · 本地",
  // 远程机器上的这份只是当天的本地版，稿子还没发。
  blocks: [
    h("今日要闻"),
    p("城区三处积水点完成改造。"),
    p("石桥水利枢纽下闸蓄水进入倒计时，库区周边道路将实施临时管制。"),
    p("本地招聘会本周三在体育馆举行。"),
    h("分类广告"),
    p("出租：建设路两室一厅，家电齐全。"),
    p("招聘：测绘外业辅助，能吃苦。"),
  ],
});

const assetPage = (hostId) => {
  const machine = machines[hostId] || machines.chenmo;
  const zhou = hostId === "zhou";

  return {
    id: "asset",
    address: "asset.yuntu.data",
    title: "云图资产平台",
    blocks: [
      h("资产详情"),
      code(
        [
          `资产编号   ${machine.hostname}`,
          `使用人     ${machine.owner}`,
          `部门       ${machine.role}`,
          `存放地点   ${machine.site}`,
          `当前状态   ${zhou ? "在用" : "待回收"}`,
          `最后上报   ${zhou ? "2031-06-13 09:12" : "2031-06-12 17:40"}`,
        ].join("\n"),
      ),
      h("登记磁盘"),
      code(
        zhou
          ? ["C:   256 GB   系统", "D:    64 GB   数据"].join("\n")
          : ["C:   118 GB   系统", "登记分区   无"].join("\n"),
      ),
      zhou
        ? p("本资产未分配回收任务。")
        : p("回收窗口：2031-06-15 18:00 前。"),
    ],
  };
};

const mailPage = (hostId) => ({
  id: "mail",
  address: "mail.jhch.cn",
  title: mailboxes[hostId] ? mailboxes[hostId].label : "院邮件系统",
  kind: "mail",
  blocks: [],
});

export const pagesFor = (hostId, progress) => {
  const id = hostId || "chenmo";
  return {
    oa: oaPage,
    mail: mailPage(id),
    news: newsPage(progress),
    asset: assetPage(id),
  };
};

const normalizeAddress = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");

export const resolvePage = (hostId, progress, input) => {
  const pages = pagesFor(hostId, progress);
  const value = normalizeAddress(input);
  if (!value) return pages[browserMeta.home];

  if (pages[value]) return pages[value];

  return (
    Object.keys(pages)
      .map((key) => pages[key])
      .find((page) => normalizeAddress(page.address) === value) || null
  );
};

// 本机浏览器只看得到新闻页。
export const localNewsPage = (progress) => {
  const news = localNews(progress);
  return {
    id: "news",
    address: "news.hekou.local",
    title: news.title,
    byline: news.byline,
    blocks: news.blocks,
  };
};

export const localPortalPage = {
  id: "portal",
  address: "portal.local",
  title: "新标签页",
  links: [{ label: "河口晚报", page: "news" }],
  recent: [
    { label: "河口晚报 · 本地", page: "news" },
    { label: "市政务服务平台", page: "portal" },
    { label: "天气预报", page: "portal" },
  ],
};

export const companyLine = `${companies.vendor} · 资产组`;
