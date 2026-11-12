import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useEscape, verifyLockAnswer } from "../../utils/arg";
import { prologue } from "../../data/arg/prologue";

// 引子里的普通应用窗口。它们不参与主线，只负责让这台电脑看起来像真的。
// 标题栏右侧统一三个按钮：最小化 / 最大化 / 关闭。
export const PrologueWindow = ({
  title,
  subtitle,
  icon,
  onClose,
  onMinimize,
  className = "",
  children,
}) => {
  useEscape(true, onClose);

  return (
    <div
      className={"arg-app-window " + className}
    >
      <div className="arg-app-titlebar">
        <img className="arg-app-icon" src={`img/icon/${icon}.png`} alt="" />
        <span className="arg-app-title">{title}</span>
        {subtitle ? <span className="arg-app-subtitle">{subtitle}</span> : null}

        <div className="arg-app-controls">
          <button
            type="button"
            className="arg-app-ctl"
            aria-label="最小化"
            title="最小化"
            onClick={onMinimize}
          >
            <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true">
              <path d="M1 5h8" stroke="currentColor" strokeWidth="1.1" />
            </svg>
          </button>

          <button
            type="button"
            className="arg-app-ctl arg-app-ctl-close"
            aria-label="关闭"
            title="关闭"
            onClick={onClose}
          >
            <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true">
              <path
                d="M1.5 1.5l7 7M8.5 1.5l-7 7"
                stroke="currentColor"
                strokeWidth="1.1"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="arg-app-content">{children}</div>
    </div>
  );
};

const pcFolders = ["文档", "下载", "图片", "桌面", "音乐", "视频"];

const pcSidebar = [
  { group: "快速访问", items: ["桌面", "下载", "文档", "图片"] },
  { group: "此电脑", items: ["本地磁盘 (C:)", "数据 (D:)"] },
];

// 引子里的「此电脑」：左侧导航 + 右侧文件列表 + 底部状态。
// 「文档」里放着 linche.cred —— 玩家要去这里找到它，才能拿到恢复密钥。
export const PcWindow = ({ onClose, onMinimize }) => {
  const [active, setActive] = useState("文档");
  const [opened, setOpened] = useState(null);

  const folders = prologue.localFolders || {};
  const currentFiles = folders[active] || [];
  const isRoot = !folders[active];

  return (
    <PrologueWindow
      title="此电脑"
      subtitle="YOU-PC"
      icon="explorer"
      onClose={onClose}
      onMinimize={onMinimize}      className="arg-pc-window"
    >
      <div className="arg-pc-main">
        <aside className="arg-pc-side">
          {pcSidebar.map((group) => (
            <React.Fragment key={group.group}>
              <div className="arg-pc-side-title">{group.group}</div>
              {group.items.map((name) => (
                <button
                  key={name}
                  type="button"
                  className="arg-pc-side-item"
                  data-active={active === name ? "true" : "false"}
                  onClick={() => {
                    setActive(name);
                    setOpened(null);
                  }}
                >
                  {name}
                </button>
              ))}
            </React.Fragment>
          ))}
        </aside>

        <section className="arg-pc-content">
          <div className="arg-pc-breadcrumb">此电脑 &gt; {active}</div>

          {opened ? (
            <div className="arg-pc-viewer">
              <div className="arg-pc-viewer-head">
                <span>{opened.name}</span>
                <button
                  type="button"
                  className="arg-pc-viewer-back"
                  onClick={() => setOpened(null)}
                >
                  返回
                </button>
              </div>
              <pre className="arg-pc-viewer-body">
                {opened.lines.join("\n")}
              </pre>
            </div>
          ) : isRoot ? (
            <div className="arg-pc-grid">
              {pcFolders.map((name) => (
                <button
                  key={name}
                  type="button"
                  className="arg-pc-folder"
                  onClick={() => setActive(name)}
                >
                  <img src="img/icon/explorer.png" alt="" />
                  <span>{name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="arg-pc-filelist">
              {currentFiles.length ? (
                currentFiles.map((file) => (
                  <button
                    key={file.name}
                    type="button"
                    className="arg-pc-file"
                    onClick={() => setOpened(file)}
                  >
                    <span className="arg-pc-file-icon" data-kind={file.kind}>
                      {file.kind === "cred" ? "🔑" : "📄"}
                    </span>
                    <span className="arg-pc-file-name">{file.name}</span>
                    <span className="arg-pc-file-meta">{file.meta}</span>
                  </button>
                ))
              ) : (
                <div className="arg-pc-empty">此文件夹为空。</div>
              )}
            </div>
          )}

          <div className="arg-pc-status">
            {opened
              ? `${opened.name} · 只读`
              : isRoot
                ? `${pcFolders.length} 个项目 · 本地磁盘 (C:) 还剩 82.4 GB`
                : `${currentFiles.length} 个项目`}
          </div>
        </section>
      </div>
    </PrologueWindow>
  );
};

// 引子里的浏览器：不是真的联网，只在本机页面之间跳转。
// 内容都是主角自己正在做的东西，和 linche 无关——玩家这时还没连上远程机器。
const browserPages = {
  home: {
    title: "新标签页",
    address: "https://www.bing.com",
    links: ["GitHub", "文档", "邮箱", "天气", "翻译", "地图"],
    recent: [
      { label: "github.com/you/render-lab", page: "github" },
      { label: "Localhost:5173 — 开发预览", page: "local" },
      { label: "MDN Web Docs", page: "mdn" },
    ],
  },
  github: {
    title: "you/render-lab",
    address: "github.com/you/render-lab",
    body: [
      "you / render-lab",
      "Public · 最后提交 2031-04-21",
      "一个用来试 WebGPU 和渲染管线的小仓库。",
      "主要分支 main 落后 origin 0 个提交，工作区干净。",
    ],
  },
  local: {
    title: "localhost:5173",
    address: "http://localhost:5173",
    body: [
      "render-lab — dev server",
      "VITE v3.2.10  ready in 412 ms",
      "➜  Local:   http://localhost:5173/",
      "➜  press h + enter to show help",
    ],
  },
  mdn: {
    title: "MDN Web Docs",
    address: "developer.mozilla.org",
    body: [
      "Resources for developers, by developers.",
      "Documenting web technologies, including CSS, HTML, and JavaScript.",
      "（离线快照，内容不完整）",
    ],
  },
};

const bookmarks = [
  { label: "render-lab", page: "github" },
  { label: "localhost", page: "local" },
  { label: "MDN", page: "mdn" },
];

export const BrowserWindow = ({
  onClose,
  onMinimize,}) => {
  const [page, setPage] = useState("home");
  const [typing, setTyping] = useState("");

  const current = browserPages[page] || browserPages.home;
  const go = (next) => {
    setPage(next);
    setTyping("");
  };

  return (
    <PrologueWindow
      title={current.title}
      subtitle="浏览器"
      icon="edge"
      onClose={onClose}
      onMinimize={onMinimize}      className="arg-browser-window"
    >
      <div className="arg-browser-tabbar">
        <div className="arg-browser-tab" data-active="true">
          <span className="arg-browser-tab-dot"></span>
          <span>{current.title}</span>
          <span className="arg-browser-tab-x">×</span>
        </div>
        <div className="arg-browser-tab-add">+</div>
      </div>

      <div className="arg-browser-bar">
        <span className="arg-browser-nav" data-disabled="true">
          ←
        </span>
        <span className="arg-browser-nav" data-disabled="true">
          →
        </span>
        <button
          type="button"
          className="arg-browser-nav"
          aria-label="刷新"
          onClick={() => go(page)}
        >
          ⟳
        </button>
        <input
          className="arg-browser-address"
          value={typing || current.address}
          onChange={(event) => setTyping(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            const value = typing.trim().toLowerCase();
            if (!value) return;
            if (value.includes("render-lab")) return go("github");
            if (value.includes("localhost") || value.includes("5173"))
              return go("local");
            if (value.includes("mdn") || value.includes("mozilla"))
              return go("mdn");
            go("home");
          }}
          spellCheck="false"
          aria-label="地址栏"
        />
      </div>

      <div className="arg-browser-marks">
        {bookmarks.map((mark) => (
          <button
            key={mark.page}
            type="button"
            className="arg-browser-mark"
            data-active={page === mark.page ? "true" : "false"}
            onClick={() => go(mark.page)}
          >
            {mark.label}
          </button>
        ))}
      </div>

      <div className="arg-browser-view win11Scroll">
        {current.error ? (
          <div className="arg-browser-error">
            <div className="arg-browser-error-code">{current.error.code}</div>
            <div className="arg-browser-error-text">{current.error.text}</div>
            <div className="arg-browser-error-detail">
              {current.error.detail}
            </div>
            <button
              type="button"
              className="arg-browser-back"
              onClick={() => go("home")}
            >
              返回新标签页
            </button>
          </div>
        ) : current.body ? (
          <div className="arg-browser-doc">
            {current.body.map((line, index) => (
              <p key={index} data-lead={index === 0 ? "true" : "false"}>
                {line}
              </p>
            ))}
          </div>
        ) : (
          <div className="arg-browser-page">
            <div className="arg-browser-logo">Bing</div>
            <div className="arg-browser-search">搜索网页</div>

            <div className="arg-browser-links">
              {current.links.map((name) => (
                <div key={name} className="arg-browser-link">
                  {name}
                </div>
              ))}
            </div>

            <div className="arg-browser-recent">
              <div className="arg-browser-recent-title">最近访问</div>
              {current.recent.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="arg-browser-recent-item"
                  onClick={() => go(item.page)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </PrologueWindow>
  );
};

export const NotepadWindow = ({
  onClose,
  onMinimize,}) => (
  <PrologueWindow
    title="未命名 - 记事本"
    subtitle="记事本"
    icon="notepad"
    onClose={onClose}
    onMinimize={onMinimize}    className="arg-note-window"
  >
    <div className="arg-note-menu">文件　编辑　查看</div>
    <pre className="arg-note-text">{`4 月待办

- 续费域名
- 备份 linche-agent
- 买咖啡豆
- 回复周会邀请

（上次编辑：2031-04-21 23:18）`}</pre>
  </PrologueWindow>
);

export const CalculatorWindow = ({
  onClose,
  onMinimize,}) => {
  const [display, setDisplay] = useState("0");
  const [acc, setAcc] = useState(null);
  const [op, setOp] = useState(null);
  const [waiting, setWaiting] = useState(false);

  const inputDigit = (digit) => {
    if (waiting) {
      setDisplay(digit);
      setWaiting(false);
      return;
    }
    setDisplay(display === "0" ? digit : display + digit);
  };

  const inputDot = () => {
    if (waiting) {
      setDisplay("0.");
      setWaiting(false);
      return;
    }
    if (!display.includes(".")) setDisplay(display + ".");
  };

  const clear = () => {
    setDisplay("0");
    setAcc(null);
    setOp(null);
    setWaiting(false);
  };

  const chooseOp = (nextOp) => {
    const value = Number(display);
    if (acc == null) {
      setAcc(value);
    } else if (op) {
      const result = calculate(acc, value, op);
      setAcc(result);
      setDisplay(String(result));
    }
    setOp(nextOp);
    setWaiting(true);
  };

  const calculate = (a, b, operator) => {
    if (operator === "+") return a + b;
    if (operator === "-") return a - b;
    if (operator === "×") return a * b;
    if (operator === "÷") return b === 0 ? 0 : a / b;
    return b;
  };

  const equals = () => {
    if (op == null || acc == null) return;
    const result = calculate(acc, Number(display), op);
    setDisplay(String(result));
    setAcc(null);
    setOp(null);
    setWaiting(true);
  };

  return (
    <PrologueWindow
      title="计算器"
      subtitle="标准"
      icon="calculator"
      onClose={onClose}
      onMinimize={onMinimize}      className="arg-calc-window"
    >
      <div className="arg-calc-display">{display}</div>
      <div className="arg-calc-grid">
        <button type="button" onClick={clear}>
          C
        </button>
        <button
          type="button"
          onClick={() => setDisplay(String(-Number(display)))}
        >
          ±
        </button>
        <button
          type="button"
          onClick={() => setDisplay(String(Number(display) / 100))}
        >
          %
        </button>
        <button
          type="button"
          className="arg-calc-op"
          onClick={() => chooseOp("÷")}
        >
          ÷
        </button>

        {["7", "8", "9"].map((digit) => (
          <button key={digit} type="button" onClick={() => inputDigit(digit)}>
            {digit}
          </button>
        ))}
        <button
          type="button"
          className="arg-calc-op"
          onClick={() => chooseOp("×")}
        >
          ×
        </button>

        {["4", "5", "6"].map((digit) => (
          <button key={digit} type="button" onClick={() => inputDigit(digit)}>
            {digit}
          </button>
        ))}
        <button
          type="button"
          className="arg-calc-op"
          onClick={() => chooseOp("-")}
        >
          −
        </button>

        {["1", "2", "3"].map((digit) => (
          <button key={digit} type="button" onClick={() => inputDigit(digit)}>
            {digit}
          </button>
        ))}
        <button
          type="button"
          className="arg-calc-op"
          onClick={() => chooseOp("+")}
        >
          +
        </button>

        <button type="button" onClick={() => inputDigit("0")}>
          0
        </button>
        <button type="button" onClick={inputDot}>
          .
        </button>
        <button type="button" className="arg-calc-equals" onClick={equals}>
          =
        </button>
      </div>
    </PrologueWindow>
  );
};

export const SettingsWindow = ({
  onClose,
  onMinimize,}) => (
  <PrologueWindow
    title="设置"
    subtitle="系统"
    icon="settings"
    onClose={onClose}
    onMinimize={onMinimize}    className="arg-settings-window"
  >
    <div className="arg-settings-main">
      <aside className="arg-settings-side">
        <div data-active="true">系统</div>
        <div>蓝牙和设备</div>
        <div>网络和 Internet</div>
        <div>个性化</div>
        <div>应用</div>
        <div>账户</div>
      </aside>

      <section className="arg-settings-content">
        <h3>关于</h3>
        <dl>
          <div>
            <dt>设备名称</dt>
            <dd>YOU-PC</dd>
          </div>
          <div>
            <dt>处理器</dt>
            <dd>Intel Core i5-12400</dd>
          </div>
          <div>
            <dt>已安装的 RAM</dt>
            <dd>16.0 GB</dd>
          </div>
          <div>
            <dt>系统类型</dt>
            <dd>64 位操作系统</dd>
          </div>
          <div>
            <dt>版本</dt>
            <dd>Windows 11 Pro 23H2</dd>
          </div>
        </dl>
        <div className="arg-settings-note">你的设备已是最新版本。</div>
      </section>
    </div>
  </PrologueWindow>
);

export const BinWindow = ({ onClose, onMinimize }) => (
  <PrologueWindow
    title="回收站"
    subtitle="0 个项目"
    icon="bin1"
    onClose={onClose}
    onMinimize={onMinimize}    className="arg-bin-window"
  >
    <div className="arg-bin-empty">
      <img src="img/icon/bin1.png" alt="" />
      <div>回收站是空的。</div>
    </div>
  </PrologueWindow>
);

// 「远程桌面连接」：Windows 系统对话框样式。
// 两步：填计算机地址 → Windows 安全凭据提示。
// 不讲故事、不显示头像、不解释线索，只给系统会说的话。
const RDP_ADDRESS = "10.24.7.31";

export const RdpWindow = ({
  onClose,
  onMinimize,  onConnect,
}) => {
  const dispatch = useDispatch();
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [phase, setPhase] = useState("address");

  const connect = () => {
    const value = address.trim().toLowerCase();
    if (!value) {
      setError("请输入计算机名称或 IP 地址。");
      return;
    }

    const normalized = value.replace(/^rdp:\/\//, "");
    if (normalized !== RDP_ADDRESS) {
      setError("找不到该远程计算机。请确认地址是否正确。");
      return;
    }

    setError("");
    setPhase("login");
  };

  // 凭据通过后写入 rdpAuthed，锁屏不会再问第二遍。
  const login = () => {
    if (!verifyLockAnswer(password)) {
      setError("凭据无效。");
      setPassword("");
      return;
    }

    setError("");
    dispatch({
      type: "ARG_FLAG",
      payload: { flag: "rdpAuthed", value: true },
    });
    onConnect();
  };

  return (
    <PrologueWindow
      title="远程桌面连接"
      subtitle="Remote Desktop Connection"
      icon="rdp"
      onClose={onClose}
      onMinimize={onMinimize}      className="arg-rdp-window"
    >
      {phase === "login" ? (
        // Windows 安全凭据对话框
        <div className="arg-sec-dialog">
          <div className="arg-sec-head">
            <div className="arg-sec-shield">
              <svg
                viewBox="0 0 16 16"
                width="16"
                height="16"
                aria-hidden="true"
              >
                <path
                  d="M8 1.5 2.5 3.8v4.1c0 3.2 2.3 5.7 5.5 6.6 3.2-.9 5.5-3.4 5.5-6.6V3.8z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.1"
                />
              </svg>
            </div>
            <div className="arg-sec-titles">
              <div className="arg-sec-title">Windows 安全</div>
              <div className="arg-sec-sub">输入你的凭据</div>
            </div>
          </div>

          <div className="arg-sec-body">
            <div className="arg-sec-fields">
              <div className="arg-sec-row">
                <span className="arg-sec-label">用户名</span>
                <span className="arg-sec-value">linche</span>
              </div>
              <div className="arg-sec-row">
                <span className="arg-sec-label">目标</span>
                <span className="arg-sec-value">{RDP_ADDRESS}</span>
              </div>

              <label className="arg-sec-label" htmlFor="arg-rdp-password">
                密码
              </label>
              <input
                id="arg-rdp-password"
                className="arg-sec-input"
                type="password"
                value={password}
                autoComplete="off"
                spellCheck="false"
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") login();
                }}
              />
            </div>

            <div className="arg-sec-note">
              {error ? (
                <span className="arg-sec-error" role="alert">
                  {error}
                </span>
              ) : (
                "这些凭据将用于连接远程计算机。"
              )}
            </div>
          </div>

          <div className="arg-sec-actions">
            <button type="button" className="arg-sec-ok" onClick={login}>
              确定
            </button>
            <button
              type="button"
              className="arg-sec-cancel"
              onClick={() => {
                setPhase("address");
                setError("");
                setPassword("");
              }}
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        // 连接对话框
        <div className="arg-rdp-body">
          <div className="arg-rdp-banner">
            <img src="img/icon/ui/network.png" alt="" />
            <div>
              <div className="arg-rdp-banner-title">远程桌面连接</div>
              <div className="arg-rdp-banner-sub">
                连接到另一台计算机的桌面会话。
              </div>
            </div>
          </div>

          <label className="arg-rdp-label" htmlFor="arg-rdp-address">
            计算机
          </label>
          <div className="arg-rdp-field">
            <input
              id="arg-rdp-address"
              type="text"
              value={address}
              placeholder="计算机名称或 IP 地址"
              spellCheck="false"
              autoComplete="off"
              onChange={(event) => {
                setAddress(event.target.value);
                setError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") connect();
              }}
            />
          </div>

          {error ? (
            <div className="arg-rdp-error" role="alert">
              {error}
            </div>
          ) : null}

          <div className="arg-rdp-actions">
            <button type="button" className="arg-rdp-connect" onClick={connect}>
              连接
            </button>
            <button type="button" className="arg-rdp-cancel" onClick={onClose}>
              取消
            </button>
          </div>

          <div className="arg-rdp-footer">
            <span>LIN-DESKTOP</span>
            <span>RDP 10.0</span>
          </div>
        </div>
      )}
    </PrologueWindow>
  );
};

// VS Code 风格的编辑器。左侧文件树，右侧带行号的代码，底部状态栏。
// 这里打开的是主角自己的项目 render-lab，不是 linche 的仓库。
const vscodeFiles = [
  { name: "src", type: "folder", depth: 0 },
  { name: "renderer.js", type: "file", depth: 1, active: true },
  { name: "shaders", type: "folder", depth: 1 },
  { name: "blur.wgsl", type: "file", depth: 2 },
  { name: "utils.js", type: "file", depth: 1 },
  { name: "package.json", type: "file", depth: 0 },
  { name: ".gitignore", type: "file", depth: 0 },
  { name: "README.md", type: "file", depth: 0 },
];

const vscodeSource = [
  "import { createDevice, pipeline } from './utils';",
  "",
  "export async function init(canvas) {",
  "  const device = await createDevice();",
  "  const context = canvas.getContext('webgpu');",
  "",
  "  context.configure({",
  "    device,",
  "    format: navigator.gpu.getPreferredCanvasFormat(),",
  "  });",
  "",
  "  return pipeline(device, context);",
  "}",
  "",
  "// TODO: 帧率还是不稳，先记着。",
];

export const VSCodeWindow = ({
  onClose,
  onMinimize,}) => {
  const [file, setFile] = useState("renderer.js");

  return (
    <PrologueWindow
      title="renderer.js — render-lab — Visual Studio Code"
      subtitle="render-lab"
      icon="code"
      onClose={onClose}
      onMinimize={onMinimize}      className="arg-vscode-window"
    >
      <div className="arg-code-main">
        <aside className="arg-code-side">
          <div className="arg-code-side-title">资源管理器</div>
          <div className="arg-code-proj">RENDER-LAB</div>
          {vscodeFiles.map((item) => (
            <button
              key={item.name}
              type="button"
              className="arg-code-file"
              data-depth={item.depth}
              data-type={item.type}
              data-active={file === item.name ? "true" : "false"}
              onClick={() => item.type === "file" && setFile(item.name)}
            >
              <span className="arg-code-file-icon">
                {item.type === "folder" ? "▾" : ""}
              </span>
              {item.name}
            </button>
          ))}
        </aside>

        <section className="arg-code-editor">
          <div className="arg-code-tabs">
            <div className="arg-code-tab" data-active="true">
              <span className="arg-code-tab-dot"></span>
              {file}
              <span className="arg-code-tab-x">×</span>
            </div>
          </div>

          <div className="arg-code-breadcrumb">render-lab › src › {file}</div>

          <div className="arg-code-body win11Scroll">
            {vscodeSource.map((line, index) => (
              <div key={index} className="arg-code-line">
                <span className="arg-code-ln">{index + 1}</span>
                <span className="arg-code-text">{line || "\u00a0"}</span>
              </div>
            ))}
          </div>

          <div className="arg-code-status">
            <span>main*</span>
            <span>0 △ 1</span>
            <span className="arg-code-status-right">
              JavaScript · UTF-8 · LF
            </span>
          </div>
        </section>
      </div>
    </PrologueWindow>
  );
};

// 引子里主角自己的终端：只是一个静态的会话记录，不接任何命令。
// 项目是主角自己的 render-lab，和 linche 无关。
// 这里保留一段"以前连过 rdp"的历史，恢复密钥就藏在其中——
// 玩家必须自己往上翻终端才会发现，邮件里不会给。
const prologueTerm = [
  { text: "Microsoft Windows [版本 10.0.22000.51]", tone: "dim" },
  { text: "(c) Microsoft Corporation。保留所有权利。", tone: "dim" },
  { text: "" },
  { text: "C:\\Users\\you\\render-lab>git status", tone: "cmd" },
  { text: "On branch main", tone: "text" },
  { text: "Your branch is up to date with 'origin/main'.", tone: "text" },
  { text: "" },
  { text: "Changes not staged for commit:", tone: "text" },
  { text: "  modified:   src/renderer.js", tone: "warn" },
  { text: "" },
  { text: "C:\\Users\\you\\render-lab>git log --oneline -3", tone: "cmd" },
  { text: "a91b7e2 wip(render): 调整模糊半径", tone: "text" },
  { text: "3c8d0f4 feat(render): 加入 WebGPU 后端", tone: "text" },
  { text: "7e2a6b1 init: render-lab", tone: "text" },
  { text: "" },
  { text: "C:\\Users\\you\\render-lab>npm run dev", tone: "cmd" },
  { text: "  VITE v3.2.10  ready in 412 ms", tone: "dim" },
  { text: "  ➜  Local:   http://localhost:5173/", tone: "dim" },
  { text: "" },
  // 以下是更早的一次会话。这里只留下「连过、被拒、会话已终止」的痕迹，
  // 不写地址、不写凭据文件路径——那些得玩家自己去邮件和文件里找。
  { text: "C:\\Users\\you>mstsc", tone: "cmd" },
  { text: "远程桌面连接", tone: "dim" },
  { text: "正在连接 …", tone: "dim" },
  { text: "凭据已从本地存储读取。", tone: "dim" },
  { text: "会话 0x0342 已接受连接。", tone: "text" },
  { text: "连接已中断（对方会话未正常结束）。", tone: "warn" },
  { text: "" },
  { text: "C:\\Users\\you>_", tone: "cmd" },
];

export const PrologueTerminalWindow = ({
  onClose,
  onMinimize,}) => (
  <PrologueWindow
    title="终端 — render-lab"
    subtitle="Windows PowerShell"
    icon="terminal"
    onClose={onClose}
    onMinimize={onMinimize}    className="arg-proterm-window"
  >
    <div className="arg-proterm-body win11Scroll">
      {prologueTerm.map((line, index) => (
        <pre key={index} className="arg-proterm-line" data-tone={line.tone}>
          {line.text || "\u00a0"}
        </pre>
      ))}
    </div>
  </PrologueWindow>
);

// GitHub 仓库页：主角自己维护的项目。
export const PrologueGithubWindow = ({
  onClose,
  onMinimize,}) => (
  <PrologueWindow
    title="you / render-lab"
    subtitle="GitHub"
    icon="github"
    onClose={onClose}
    onMinimize={onMinimize}    className="arg-github-window"
  >
    <div className="arg-gh-head">
      <div className="arg-gh-repo">
        <span className="arg-gh-owner">you</span>
        <span className="arg-gh-sep">/</span>
        <span className="arg-gh-name">render-lab</span>
        <span className="arg-gh-badge">Public</span>
      </div>
      <div className="arg-gh-actions">
        <span className="arg-gh-star">★ Star</span>
        <span className="arg-gh-fork">⑂ Fork</span>
      </div>
    </div>

    <div className="arg-gh-tabs">
      <span data-active="true">Code</span>
      <span>
        Issues <b>0</b>
      </span>
      <span>Pull requests</span>
      <span>Actions</span>
      <span>Settings</span>
    </div>

    <div className="arg-gh-body win11Scroll">
      <div className="arg-gh-row">
        <span className="arg-gh-branch">main</span>
        <span className="arg-gh-commit">
          <b>a91b7e2</b> wip(render): 调整模糊半径
        </span>
        <span className="arg-gh-time">昨天</span>
      </div>

      {vscodeFiles
        .filter((item) => item.depth === 0)
        .map((item) => (
          <div key={item.name} className="arg-gh-row">
            <span className="arg-gh-file">
              {item.type === "folder" ? "📁" : "📄"} {item.name}
            </span>
            <span className="arg-gh-msg">
              {item.type === "folder"
                ? "调整模糊半径"
                : "wip(render): 调整模糊半径"}
            </span>
            <span className="arg-gh-time">昨天</span>
          </div>
        ))}

      <div className="arg-gh-readme">
        <h3>README.md</h3>
        <p>一个用来试 WebGPU 和渲染管线的小仓库。</p>
        <p>目前只有模糊和后处理两个 pass，帧率还没调稳。</p>
        <pre>npm run dev</pre>
        <p className="arg-gh-warn">TODO: 把帧率测出来再写结论。</p>
      </div>
    </div>
  </PrologueWindow>
);
