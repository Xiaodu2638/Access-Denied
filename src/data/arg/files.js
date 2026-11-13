// 两台远程资产的文件树。
// 节点结构保持 { type, name, info, data }，归一化后每个节点有稳定 id。
// 组件只读 fileSystem，不在这里写界面逻辑。

const p = (text) => ({ type: "p", text });
const h = (text) => ({ type: "h", text });
const code = (text) => ({ type: "code", text });
const quote = (text) => ({ type: "quote", text });

const file = (name, kind, description, content, extra = {}) => ({
  type: "file",
  name,
  info: { kind, description, content, ...extra },
  data: "",
});

const folder = (name, data, extra = {}) => ({
  type: "folder",
  name,
  info: { icon: "folder", ...extra },
  data,
});

// ---------------------------------------------------------------------------
// CM-07 / 陈默
// ---------------------------------------------------------------------------

const chenmoTree = {
  type: "folder",
  name: "C:",
  info: { icon: "drive", label: "本地磁盘 (C:)" },
  data: {
    Users: folder("Users", {
      chenmo: folder("chenmo", {
        Desktop: folder("Desktop", {
          "待办.txt": file(
            "待办.txt",
            "txt",
            "184 B · 2031-06-12 08:12",
            [
              p("6 月"),
              p("- 把外业记录交回队里"),
              p("- 去学校拍最后一张合影"),
              p("- 给周宁回电话"),
              p("- 房租 6 月底到期"),
              p(""),
              p("王老师问能不能把孩子那张照片洗出来带过去，答应了。"),
            ],
          ),
        }),
        Documents: folder("Documents", {
          测绘二队: folder("测绘二队", {
            库区测绘_官方: folder("库区测绘_官方", {
              "技术设计书_摘录.txt": file(
                "技术设计书_摘录.txt",
                "txt",
                "3.2 KB · 2031-05-18 10:04",
                [
                  h("石桥水利枢纽 · 库区地形测绘技术设计书（摘录）"),
                  p("项目编号：SQ-2031-03"),
                  p("测绘范围：坝址上游 12.6 公里至老石桥断面。"),
                  p("控制点：3 个，沿用 2029 年埋石点。"),
                  p("居民点：库区范围内无永久居民，不设移民测绘内容。"),
                  p("成果形式：1:2000 地形图、控制点成果表、技术总结。"),
                  quote("设计书由建设单位提供，测绘单位按给定范围施测。"),
                ],
                { official: true },
              ),
              "成果表_官方.csv": file(
                "成果表_官方.csv",
                "csv",
                "412 B · 2031-06-09 16:22",
                [
                  h("控制点成果表"),
                  code(
                    [
                      "点号,类型,X,Y,高程,备注",
                      "SQ01,埋石点,3412887.442,512004.118,86.42,沿用",
                      "SQ02,埋石点,3412650.907,512688.550,84.17,沿用",
                      "SQ03,埋石点,3412114.233,513120.041,81.90,沿用",
                    ].join("\n"),
                  ),
                  p("居民点：0"),
                  p("学校：0"),
                  p("坟墓：0"),
                ],
                { official: true },
              ),
              "移交说明.txt": file(
                "移交说明.txt",
                "txt",
                "1.1 KB · 2031-06-12 09:30",
                [
                  h("资产移交说明"),
                  p("资产编号：CM-07"),
                  p("使用人：陈默（测绘二队，外业）"),
                  p("存放地点：石桥库区临时工作站"),
                  p("移交内容：主机一台、电源适配器一个、加密狗一个。"),
                  p("数据：以 C 盘「库区测绘_官方」目录为准。"),
                  p("备注：使用人自 6 月 12 日起未到岗，个人物品由队里代为打包。"),
                ],
                { official: true },
              ),
              "周报_0608.txt": file(
                "周报_0608.txt",
                "txt",
                "1.4 KB · 2031-06-08 18:05",
                [
                  h("测绘二队 · 第 23 周"),
                  p("1. 库区控制点复测完成，成果已入库。"),
                  p("2. 外业记录回收 2 份，缺 CM-07。"),
                  p("3. 陈默连续三日未提交外业记录，已电话联系，未接。"),
                  p("4. 周宁申请调回内业，待队里研究。"),
                  p("5. 建设单位催 1:2000 地形图，按原计划 6 月底交付。"),
                ],
                { official: true },
              ),
            }),
            "外业记录_0528.txt": file(
              "外业记录_0528.txt",
              "txt",
              "706 B · 2031-06-12 07:58",
              [
                h("外业记录 · 0528"),
                p("天气晴。沿村道进库区，过石桥后手机没有信号。"),
                p("设计书上写的是三个控制点，走完只要半天。"),
                p("桥那边有房子，烟囱是热的。"),
                p(
                  "晚上回站里，想把白天看到的东西记到电脑上。D 盘重装系统后一直没挂上，先记在本子里。",
                ),
              ],
            ),
          }),
          个人: folder("个人", {
            "体检报告.txt": file(
              "体检报告.txt",
              "txt",
              "1.6 KB · 2031-04-02 14:20",
              [
                h("职工体检结论"),
                p("姓名：陈默"),
                p("窦性心律，血压偏高。建议减少熬夜，三个月后复查。"),
                p("其余项目未见明显异常。"),
              ],
            ),
            "房租合同.txt": file(
              "房租合同.txt",
              "txt",
              "2.0 KB · 2031-01-05 19:41",
              [
                h("房屋租赁合同（摘要）"),
                p("租期：2031-01-01 至 2031-12-31。"),
                p("月租：¥1,150。押一付三。"),
                p("地址：河口区建设路 42 号 3 单元 502。"),
              ],
            ),
            "简历_陈默.txt": file(
              "简历_陈默.txt",
              "txt",
              "1.2 KB · 2030-10-11 21:03",
              [
                h("陈默"),
                p("29 岁。测绘工程专业。"),
                p("2030 年入职江河测绘院，一直在外业。"),
                p("能吃苦，会用水准仪和全站仪。"),
                p("上一份工作是在山区做土地确权。"),
              ],
            ),
          }),
        }),
        Downloads: folder("Downloads", {
          "库区影像_初稿.zip": file(
            "库区影像_初稿.zip",
            "bin",
            "486 MB · 2031-06-11 22:14",
            null,
          ),
          "石桥库区范围图.dwg": file(
            "石桥库区范围图.dwg",
            "bin",
            "18.4 MB · 2031-05-18 09:41",
            null,
          ),
          "无人机固件_v3.2.bin": file(
            "无人机固件_v3.2.bin",
            "bin",
            "62.8 MB · 2031-03-22 16:07",
            null,
          ),
        }),
        Pictures: folder("Pictures", {
          现场: folder("现场", {
            "01_石桥.txt": file(
              "01_石桥.txt",
              "photo",
              "2.1 MB · 2031-05-28 17:42",
              [
                p("过桥以后就是村子。桥面只有两米宽，栏杆是后来加的。"),
                p("拍摄位置：老石桥断面，朝上游。"),
              ],
              { plate: "valley", caption: "01 · 老石桥" },
            ),
            "02_学校.txt": file(
              "02_学校.txt",
              "photo",
              "1.8 MB · 2031-06-05 09:12",
              [
                p("石桥小学。操场是一块压平的土。"),
                p("去的时候正在上课，窗户里能看见十一张桌子。"),
              ],
              { plate: "school", caption: "02 · 石桥小学" },
            ),
            "03_水位线.txt": file(
              "03_水位线.txt",
              "photo",
              "2.4 MB · 2031-06-08 11:26",
              [
                p("设计水位线。刷在村口老槐树上。"),
                p("线底下是王秀兰家的灶房。"),
              ],
              { plate: "flooded", caption: "03 · 设计水位线" },
            ),
            "04_祖坟.txt": file(
              "04_祖坟.txt",
              "photo",
              "2.2 MB · 2031-06-08 15:03",
              [
                p("后山的三座祖坟。村里人说一共十四座。"),
                p("碑上的字已经看不清了。"),
              ],
              { plate: "valley", caption: "04 · 后山" },
            ),
          }),
        }),
      }),
    }),
    // 未挂载的分区。分区修复工具挂载后才出现在文件管理器里。
    "D:": {
      type: "folder",
      name: "D:",
      info: {
        icon: "drive",
        label: "数据 (D:)",
        requires: "partitionMounted",
        description: "未分配 · 12 GB",
      },
      data: {
        我的测绘: folder(
          "我的测绘",
          {
            "笔记本_CM07.txt": file(
              "笔记本_CM07.txt",
              "txt",
              "4.6 KB · 2031-06-12 17:40",
              [
                h("CM-07 · 外业笔记"),
                p("05-28"),
                p(
                  "第一次进库区。设计书上只有三个控制点，半天就能走完。过石桥以后有村子，烟囱是热的。",
                ),
                p("05-30"),
                p(
                  "数了一遍，37 户。报给刘工，他说按设计书范围记录，别写范围外的。",
                ),
                p("06-02"),
                p(
                  "石桥小学还在上课。一到六年级一个复式班，11 个学生，老师叫王秀兰。9 月要拆。",
                ),
                p("06-05"),
                p(
                  "村里人带我去后山，14 座祖坟。登记表上没有这一栏，刘工说不用管。",
                ),
                p("06-08"),
                p(
                  "又去了一次，把户表和照片补齐。公司的成果表还是 0。周宁说她不签，被调回内业了。",
                ),
                p("06-11"),
                p(
                  "跟项目办的人在现场碰了一次。他说库区范围内无永久居民。我把这句话录下来了。",
                ),
                p("06-12"),
                p(
                  "如果那封邮件发出去，我大概就回不去了。东西放在 D 盘，别用公司账号传。",
                ),
              ],
              { private: true, plate: null, readFlag: "readNotebook" },
            ),
            "户表.csv": file(
              "户表.csv",
              "csv",
              "2.9 KB · 2031-06-11 20:16",
              [
                h("石桥村 · 库区住户登记（私人记录）"),
                code(
                  [
                    "序号,户主,人口,房屋,备注",
                    "1,王秀兰,3,砖木,石桥小学教师",
                    "2,李长根,2,砖木,",
                    "3,赵德顺,4,土坯,",
                    "4,孙月娥,1,砖木,独居",
                    "5,周立平,3,砖木,",
                    "6,吴春生,2,土坯,",
                    "7,郑小满,4,砖木,",
                    "8,冯国栋,5,砖木,",
                    "9,陈玉兰,2,土坯,独居",
                    "10,褚建民,3,砖木,",
                    "11,卫红兵,2,砖木,",
                    "12,蒋秀英,1,砖木,独居",
                    "13,沈大勇,4,土坯,",
                    "14,韩桂芳,2,砖木,",
                    "15,杨志强,3,砖木,",
                    "16,朱巧云,3,土坯,",
                    "17,秦广林,2,砖木,",
                    "18,尤素珍,1,土坯,独居",
                    "19,许文斌,4,砖木,",
                    "20,何秀芝,2,砖木,",
                    "21,吕国平,3,土坯,",
                    "22,施小琴,2,砖木,",
                    "23,张德海,5,砖木,",
                    "24,孔令华,3,土坯,",
                    "25,曹玉梅,2,砖木,",
                    "26,严志刚,4,砖木,",
                    "27,华秀珍,1,土坯,独居",
                    "28,金大有,3,砖木,",
                    "29,魏淑芬,2,土坯,",
                    "30,陶立新,4,砖木,",
                    "31,姜桂英,2,砖木,",
                    "32,戚长顺,3,土坯,",
                    "33,谢小丽,3,砖木,",
                    "34,邹国华,2,砖木,",
                    "35,喻秀兰,1,土坯,独居",
                    "36,柏建军,4,砖木,",
                    "37,水根生,2,砖木,五保户",
                    ",合计,99,,37 户",
                  ].join("\n"),
                ),
                p("统计时间：2031-06-11。村内实际居住 99 人。"),
              ],
              { private: true, readFlag: "readHousehold" },
            ),
            "学校.txt": file(
              "学校.txt",
              "txt",
              "1.3 KB · 2031-06-05 10:02",
              [
                h("石桥小学"),
                p("校舍：两排砖房，1987 年建，2009 年翻修过一次屋顶。"),
                p("班级：一到六年级复式班，1 个班。"),
                p("学生：11 人，最小 6 岁，最大 12 岁。"),
                p("教师：王秀兰，1 人，教龄 24 年。"),
                p("计划：2031 年 9 月拆除，学生并入镇中心小学。"),
                p("镇中心小学距村里 11 公里，无校车。"),
              ],
              { private: true, readFlag: "readSchool" },
            ),
            "祖坟记录.txt": file(
              "祖坟记录.txt",
              "txt",
              "1.7 KB · 2031-06-05 16:44",
              [
                h("后山祖坟登记（实地清点）"),
                code(
                  [
                    "序号,位置,姓氏,可辨年代,备注",
                    "1,后山南坡,王,民国,王秀兰家",
                    "2,后山南坡,王,1958,无碑",
                    "3,后山南坡,李,1974,",
                    "4,后山南坡,李,1991,",
                    "5,后山南坡,赵,1962,",
                    "6,后山南坡,赵,1988,",
                    "7,后山北坡,周,1949,无碑",
                    "8,后山北坡,周,1977,",
                    "9,后山北坡,吴,1955,",
                    "10,后山北坡,郑,1983,",
                    "11,后山北坡,冯,1968,",
                    "12,后山北坡,冯,1996,",
                    "13,后山北坡,陈,1971,",
                    "14,后山北坡,陈,2004,",
                  ].join("\n"),
                ),
                p("村里老人说，还有几座更早的，碑已经平了，没法确认。"),
              ],
              { private: true, readFlag: "readGraves" },
            ),
            "照片说明.txt": file(
              "照片说明.txt",
              "txt",
              "2.6 KB · 2031-06-11 19:02",
              [
                h("现场照片说明（37 张）"),
                code(
                  [
                    "01 老石桥，朝上游",
                    "02 桥头村道",
                    "03 王秀兰家灶房",
                    "04 李长根家院门",
                    "05 赵德顺家猪圈",
                    "06 孙月娥家屋檐",
                    "07 周立平家二层",
                    "08 吴春生家土墙",
                    "09 郑小满家晒谷场",
                    "10 冯国栋家堂屋",
                    "11 陈玉兰家门口",
                    "12 褚建民家柴垛",
                    "13 卫红兵家水井",
                    "14 蒋秀英家窗花",
                    "15 沈大勇家牛棚",
                    "16 韩桂芳家灶台",
                    "17 杨志强家摩托",
                    "18 朱巧云家菜地",
                    "19 秦广林家门槛",
                    "20 尤素珍家竹椅",
                    "21 许文斌家新瓦",
                    "22 何秀芝家鸡笼",
                    "23 吕国平家院墙",
                    "24 施小琴家缝纫机",
                    "25 张德海家全家福",
                    "26 孔令华家粮仓",
                    "27 曹玉梅家灶房",
                    "28 严志刚家三轮车",
                    "29 华秀珍家木床",
                    "30 金大有家堂屋",
                    "31 魏淑芬家菜窖",
                    "32 陶立新家院门",
                    "33 姜桂英家水缸",
                    "34 戚长顺家农具",
                    "35 谢小丽家书桌",
                    "36 柏建军家屋顶",
                    "37 水根生家门前（五保户）",
                  ].join("\n"),
                ),
                p("另：石桥小学 6 张、后山祖坟 4 张、水位线 3 张，未编号。"),
              ],
              { private: true },
            ),
            "录音_0611.txt": file(
              "录音_0611.txt",
              "txt",
              "3.0 KB · 2031-06-12 17:32",
              [
                h("现场录音 · 0611 · 文字转录"),
                p("地点：石桥村村委会。时间：2031-06-11 15:20。"),
                code(
                  [
                    "陈默：刘工，户表我数完了，37 户，99 个人。",
                    "刘工：设计书上的范围你看了没有？",
                    "陈默：看了，可是人就在范围里。",
                    "刘工：设计书是建设单位给的。我们按给定的范围施测。",
                    "陈默：学校也在里面，11 个学生。",
                    "刘工：这个不归我们管。你把手上的点交了就回来。",
                    "陈默：那祖坟呢？后山 14 座。",
                    "刘工：成果表上没有这一栏。",
                    "陈默：所以我记的东西不算数？",
                    "刘工：陈默，我再跟你说一遍。库区范围内无永久居民。",
                    "（录音中断）",
                  ].join("\n"),
                ),
                p("文件名：REC_0611_1520.wav · 时长 06:42 · 已删除至回收站。"),
              ],
              { private: true },
            ),
            "给周宁.txt": file(
              "给周宁.txt",
              "txt",
              "402 B · 2031-06-12 17:38",
              [
                p("周宁："),
                p(
                  "东西我放在 D 盘了，不在公司的目录里。你要是能看到，帮我看一眼户表有没有漏的。",
                ),
                p("别用公司账号传，邮件我设了时间。"),
                p("陈默"),
              ],
              { private: true, readFlag: "readToZhou" },
            ),
            "交接说明.txt": file(
              "交接说明.txt",
              "txt",
              "512 B · 2031-06-12 17:39",
              [
                p("这个分区是重装系统前留下的，公司登记的资产表里没有它。"),
                p("里面是我自己拍的、自己记的，不算公司成果。"),
                p(
                  "如果机器被回收，D 盘会跟着一起擦掉。要是有人要，就只能现在拷走。",
                ),
              ],
              { private: true, readFlag: "readHandoverNote" },
            ),
            "后山坐标.txt": file(
              "后山坐标.txt",
              "txt",
              "688 B · 2031-06-08 15:30",
              [
                h("后山点位（手持 GPS，误差 ±5m）"),
                code(
                  [
                    "P01  3412408  512771  后山南坡",
                    "P02  3412416  512785  后山南坡",
                    "P03  3412421  512803  后山南坡",
                    "P04  3412430  512817  后山北坡",
                    "P05  3412438  512829  后山北坡",
                    "P06  3412445  512841  后山北坡",
                  ].join("\n"),
                ),
              ],
              { private: true },
            ),
          },
          { private: true, description: "个人测绘资料" },
        ),
      },
    },
  },
};

// ---------------------------------------------------------------------------
// ZJ-03 / 周宁
// ---------------------------------------------------------------------------

const zhouTree = {
  type: "folder",
  name: "C:",
  info: { icon: "drive", label: "本地磁盘 (C:)" },
  data: {
    Users: folder("Users", {
      zhouning: folder("zhouning", {
        Desktop: folder("Desktop", {
          "交接清单.txt": file(
            "交接清单.txt",
            "txt",
            "524 B · 2031-06-13 09:12",
            [
              h("ZJ-03 交接清单"),
              p("主机一台、显示器一台、键鼠一套。"),
              p("加密狗在抽屉里，编号 A-118。"),
              p("D 盘没有资料。"),
              p("个人文件已自行清理。"),
              p("—— 周宁"),
            ],
          ),
        }),
        Documents: folder("Documents", {
          "离职申请.txt": file(
            "离职申请.txt",
            "txt",
            "812 B · 2031-06-10 10:22",
            [
              h("离职申请"),
              p("院领导："),
              p(
                "本人因个人原因申请离职，最后工作日为 6 月 30 日。手头工作已与队里交接。",
              ),
              p(
                "另：库区成果表本人无法签字。相关外业记录由陈默保管，本人不再参与该项目。",
              ),
              p("申请人：周宁"),
              p("2031-06-10"),
            ],
          ),
          "库区复核记录.txt": file(
            "库区复核记录.txt",
            "txt",
            "2.2 KB · 2031-06-09 17:05",
            [
              h("库区复核 · 0609"),
              p("随镇里干部又进了一次石桥村。"),
              p("在册 37 户，实际在家 35 户。两户外出打工，房子还在。"),
              p("石桥小学正常上课，11 名学生，1 名教师。"),
              p("后山祖坟 14 座，与陈默记录一致。"),
              p("村口老槐树上有设计水位线，低于水位线的房屋 21 栋。"),
              p(
                "以上内容与建设单位提供的「库区范围内无永久居民」不一致。已口头向队里报告。",
              ),
            ],
            { readFlag: "readZhouReview" },
          ),
          "陈默_最后一条.txt": file(
            "陈默_最后一条.txt",
            "txt",
            "356 B · 2031-06-12 17:42",
            [
              p("周宁："),
              p(
                "如果明天我没来，别找我。我的东西在 D 盘，你看得到就拿走，看不到就算了。",
              ),
              p("你签不签是你的事，别把自己搭进去。"),
              p("陈默"),
            ],
            { readFlag: "readZhouNote" },
          ),
          "通讯录.txt": file(
            "通讯录.txt",
            "txt",
            "448 B · 2031-05-02 11:00",
            [
              p("队里：刘建国（项目办） 138****2041"),
              p("陈默 139****7712"),
              p("石桥村 王秀兰 137****6620"),
              p("镇中心小学 教务处 0746-****331"),
            ],
          ),
          "房租缴费记录.txt": file(
            "房租缴费记录.txt",
            "txt",
            "296 B · 2031-06-01 09:18",
            [
              p("6 月房租 ¥980，已转。"),
              p("房东说下个月可能不租了。"),
            ],
          ),
        }),
        Pictures: folder("Pictures", {
          "合影_0605.txt": file(
            "合影_0605.txt",
            "photo",
            "1.6 MB · 2031-06-05 11:40",
            [
              p("石桥小学全体合影。11 个学生，王老师站中间。"),
              p("拍照的人是陈默。"),
            ],
            { plate: "school", caption: "合影 · 0605" },
          ),
        }),
      }),
    }),
    "D:": folder("D:", {
      // 周宁的机器登记里 D 盘没有资料，这里是空的。
    }),
  },
};

// ---------------------------------------------------------------------------
// 归一化
// ---------------------------------------------------------------------------

const isDriveName = (node, key) =>
  /^[A-Za-z]:$/.test((node && node.name) || key || "");

const buildHost = (id, meta, raw) => {
  const nodes = {};

  const add = (node, parentId, key, skipKeys = []) => {
    const name = node.name || key;
    const nodeId = parentId ? `${parentId}/${name}` : key;
    const type = node.type || "folder";
    const info = node.info || {};

    nodes[nodeId] = {
      id: nodeId,
      name,
      type,
      parent: parentId,
      children: [],
      info,
      kind: type === "folder" ? "folder" : info.kind || "file",
      content: info.content || null,
      variants: info.variants || null,
      requires: info.requires || null,
      description: info.description || "",
      hidden: info.hidden === true,
      private: info.private === true,
      official: info.official === true,
      plate: info.plate || null,
      caption: info.caption || null,
      // 打开这个文件会点亮哪个进度标记。只在数据里写，组件不硬编码。
      readFlag: info.readFlag || null,
    };

    if (parentId && nodes[parentId]) nodes[parentId].children.push(nodeId);

    if (type === "folder" && node.data) {
      Object.keys(node.data).forEach((childKey) => {
        if (skipKeys.includes(childKey)) return;
        add(node.data[childKey], nodeId, childKey);
      });
    }

    return nodeId;
  };

  // 数据里盘符写在 C: 的 data 下面，这里把它们提升为同级根节点，
  // 这样 D: 的路径是 D:\我的测绘，而不是 C:\D:\我的测绘。
  const driveKeys = Object.keys(raw.data || {}).filter((key) =>
    isDriveName(raw.data[key], key),
  );

  const rootId = add(raw, null, raw.name, driveKeys);
  const roots = [
    rootId,
    ...driveKeys.map((key) => add(raw.data[key], null, key)),
  ];

  return {
    ...meta,
    id,
    nodes,
    rootId,
    roots,
    tree: raw,
  };
};

export const hosts = {
  chenmo: buildHost("chenmo", {}, chenmoTree),
  zhou: buildHost("zhou", {}, zhouTree),
};

export const getHost = (hostId) => hosts[hostId] || hosts.chenmo;

export const nodeOf = (hostId, nodeId) => {
  const host = getHost(hostId);
  return host.nodes[nodeId] || null;
};

// 分区未挂载时，整个 D: 不出现；隐藏文件按显示开关过滤。
export const availableChildren = (hostId, nodeId, flags, showHidden) => {
  const host = getHost(hostId);
  const node = host.nodes[nodeId];
  if (!node) return [];

  return node.children
    .map((id) => host.nodes[id])
    .filter((child) => {
      if (child.requires && !(flags || {})[child.requires]) return false;
      if (child.hidden && !showHidden) return false;
      return true;
    });
};

export const pathOf = (hostId, nodeId) => {
  const host = getHost(hostId);
  const chain = [];
  let node = host.nodes[nodeId];

  while (node) {
    chain.unshift(node);
    node = node.parent ? host.nodes[node.parent] : null;
  }

  return chain;
};

export const displayPath = (hostId, nodeId) =>
  pathOf(hostId, nodeId)
    .map((node) => node.name)
    .join("\\");

export const contentOf = (node, flags) => {
  if (!node) return null;
  if (node.variants && flags) {
    const hit = node.variants.find(
      (variant) =>
        variant.flag && flags[variant.flag] === true && variant.content,
    );
    if (hit) return hit.content;
  }
  return node.content;
};

// 把一个节点（含子目录）展开成文件列表。复制到交接盘时用。
export const collectFiles = (hostId, nodeId) => {
  const host = getHost(hostId);
  const node = host.nodes[nodeId];
  if (!node) return [];
  if (node.type === "file") return [node];

  const out = [];
  node.children.forEach((id) => {
    const child = host.nodes[id];
    if (!child) return;
    if (child.requires) return;
    if (child.type === "file") out.push(child);
    else out.push(...collectFiles(hostId, child.id));
  });
  return out;
};

// 交接盘里的说明文件。公司给的回收流程，回收码也在这里。
export const handoverReadme = {
  name: "说明.txt",
  kind: "txt",
  description: "1.1 KB · 2031-06-14 09:00",
  blocks: [
    h("交接盘使用说明"),
    p("1. 本盘只接收正式成果。个人文件请勿放入。"),
    p("2. 放入后即视为已交接，回收流程不再另行确认。"),
    p("3. 回收码由工单下发，不要转告他人。"),
    p("4. 本资产回收码：4471。"),
    p("5. 回收完成后，本机所有分区将被擦除，不可恢复。"),
    p("—— 云图数据服务 · 资产组"),
  ],
};
