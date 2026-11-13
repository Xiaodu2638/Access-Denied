// 终端文案。终端只是可选的查看方式，不承担任何开锁或推进剧情的职责。
// 具体命令解析在 containers/applications/apps/terminal.jsx。

import { machines } from "./config";

export const terminalMeta = {
  title: "终端",
  welcome: (machine) => [
    { text: "Microsoft Windows [版本 10.0.22000.51]", tone: "dim" },
    { text: "(c) Microsoft Corporation。保留所有权利。", tone: "dim" },
    { text: "" },
    {
      text: `${machine.user} 登录到 ${machine.hostname}。`,
      tone: "dim",
    },
  ],
};

export const commandHelp = [
  { text: "可用命令：" },
  { text: "  help            显示这份列表", tone: "dim" },
  { text: "  whoami          显示当前身份", tone: "dim" },
  { text: "  hostname        显示计算机名", tone: "dim" },
  { text: "  dir [/a]        列出当前目录（/a 含隐藏项）", tone: "dim" },
  { text: "  cd <目录>       切换目录（.. 返回上一级）", tone: "dim" },
  { text: "  type <文件>     查看文件内容", tone: "dim" },
  { text: "  ipconfig        显示网络配置", tone: "dim" },
  { text: "  cls             清屏", tone: "dim" },
  { text: "  exit            关闭终端", tone: "dim" },
];

export const promptOf = (machine, cwdLabel) =>
  `${machine.user}@${machine.hostname} ${cwdLabel}>`;

export const unknownCommand = (cmd) =>
  `'${cmd}' 不是内部或外部命令，也不是可运行的程序。`;

export const ipconfigLines = (machine) => [
  { text: "" },
  { text: "Windows IP 配置", tone: "dim" },
  { text: "" },
  { text: "以太网适配器 本地连接：" },
  { text: "" },
  { text: `   IPv4 地址 . . . . . . . . . . . . : ${machine.address}` },
  { text: "   子网掩码  . . . . . . . . . . . . : 255.255.255.0" },
  { text: "   默认网关. . . . . . . . . . . . . : 10.24.7.1" },
];

export const machineOf = (hostId) => machines[hostId] || machines.chenmo;
