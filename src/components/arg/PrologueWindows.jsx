import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useEscape } from "../../utils/arg";
import { localNewsPage, localPortalPage } from "../../data/arg/browser";
import { ContentBlocks } from "./ContentBlocks";
import { Plate } from "./Plates";

// 引子里的普通应用窗口。它们不参与主线，只负责让这台电脑看起来像真的。
// 标题栏右侧统一两个按钮：最小化 / 关闭。

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
    <div className={"arg-app-window " + className}>
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

// 引子里的「此电脑」：左侧导航 + 右侧文件列表 + 底部状态。
// 文件夹内容由 prologue.js 的 localFoldersFor 决定。
export const PcWindow = ({ onClose, onMinimize, folders = {}, phase }) => {
  const [active, setActive] = useState("文档");
  const [opened, setOpened] = useState(null);

  const folderNames = Object.keys(folders);
  const isRoot = !folders[active];
  const currentFiles = folders[active] || [];

  return (
    <PrologueWindow
      title="此电脑"
      subtitle="YOU-PC"
      icon="explorer"
      onClose={onClose}
      onMinimize={onMinimize}
      className="arg-pc-window"
    >
      <div className="arg-pc-main">
        <aside className="arg-pc-side">
          <div className="arg-pc-side-title">此电脑</div>
          <button
            type="button"
            className="arg-pc-side-item"
            data-active={isRoot ? "true" : "false"}
            onClick={() => {
              setActive("");
              setOpened(null);
            }}
          >
            本地磁盘 (C:)
          </button>
          {folderNames.map((name) => (
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
              <div className="arg-pc-viewer-body win11Scroll">
                {opened.blocks ? (
                  <ContentBlocks blocks={opened.blocks} />
                ) : (
                  <pre className="arg-pc-pre">{opened.lines.join("\n")}</pre>
                )}
              </div>
            </div>
          ) : isRoot ? (
            <div className="arg-pc-grid">
              {folderNames.map((name) => (
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
                      {file.kind === "txt" ? "📄" : "📎"}
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
                ? `${folderNames.length} 个项目 · 本地磁盘 (C:) 还剩 82.4 GB`
                : `${currentFiles.length} 个项目`}
          </div>
        </section>
      </div>
    </PrologueWindow>
  );
};

// 本机的工时记录。和主线无关，只是外包的日常。
export const NotepadWindow = ({ onClose, onMinimize }) => (
  <PrologueWindow
    title="工时表_六月.txt - 记事本"
    subtitle="记事本"
    icon="notepad"
    onClose={onClose}
    onMinimize={onMinimize}
    className="arg-note-window"
  >
    <div className="arg-note-menu">文件　编辑　查看</div>
    <pre className="arg-note-text">{`6 月工时

06-03  网络整改      4h
06-07  打印机维护    2h
06-11  机房盘点      6h
06-15  CM-07 回收    ?

（上次编辑：2031-06-15 12:10）`}</pre>
  </PrologueWindow>
);

export const SettingsWindow = ({ onClose, onMinimize }) => (
  <PrologueWindow
    title="设置"
    subtitle="系统"
    icon="settings"
    onClose={onClose}
    onMinimize={onMinimize}
    className="arg-settings-window"
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
    onMinimize={onMinimize}
    className="arg-bin-window"
  >
    <div className="arg-bin-empty">
      <img src="img/icon/bin1.png" alt="" />
      <div>回收站是空的。</div>
    </div>
  </PrologueWindow>
);

// 本机终端：静态会话记录，不接受输入，也不承担线索功能。
const prologueTerm = [
  { text: "Microsoft Windows [版本 10.0.22000.51]", tone: "dim" },
  { text: "(c) Microsoft Corporation。保留所有权利。", tone: "dim" },
  { text: "" },
  { text: "C:\\Users\\you>ipconfig", tone: "cmd" },
  { text: "Windows IP 配置", tone: "dim" },
  { text: "" },
  { text: "以太网适配器 本地连接：", tone: "text" },
  { text: "   IPv4 地址 . . . . . . . . . . . . : 192.168.1.24" },
  { text: "   默认网关. . . . . . . . . . . . . : 192.168.1.1" },
  { text: "" },
  { text: "C:\\Users\\you>ping 10.24.7.31", tone: "cmd" },
  { text: "来自 10.24.7.31 的回复: 字节=32 时间=6ms TTL=63", tone: "text" },
  { text: "来自 10.24.7.31 的回复: 字节=32 时间=5ms TTL=63", tone: "text" },
  { text: "" },
  { text: "C:\\Users\\you>_", tone: "cmd" },
];

export const PrologueTerminalWindow = ({ onClose, onMinimize }) => (
  <PrologueWindow
    title="终端 — 本机"
    subtitle="Windows PowerShell"
    icon="terminal"
    onClose={onClose}
    onMinimize={onMinimize}
    className="arg-proterm-window"
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

// ---------------------------------------------------------------------------
// 本机浏览器：只访问本地门户与《河口晚报》的离线快照。
// ---------------------------------------------------------------------------

export const BrowserWindow = ({ onClose, onMinimize }) => {
  const progress = useSelector((state) => state.arg);
  const news = localNewsPage(progress);

  const pages = {
    portal: localPortalPage,
    news,
  };

  const [page, setPage] = useState("portal");
  const [typing, setTyping] = useState("");

  const current = pages[page] || pages.portal;

  const go = (next) => {
    setPage(next);
    setTyping("");
  };

  const submit = () => {
    const value = typing.trim().toLowerCase();
    if (!value) return;
    if (
      value.includes("news") ||
      value.includes("河口") ||
      value.includes("晚报")
    ) {
      return go("news");
    }
    go("portal");
  };

  return (
    <PrologueWindow
      title={current.title}
      subtitle="浏览器"
      icon="edge"
      onClose={onClose}
      onMinimize={onMinimize}
      className="arg-browser-window"
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
            if (event.key === "Enter") submit();
          }}
          spellCheck="false"
          aria-label="地址栏"
        />
      </div>

      <div className="arg-browser-marks">
        <button
          type="button"
          className="arg-browser-mark"
          data-active={page === "portal" ? "true" : "false"}
          onClick={() => go("portal")}
        >
          新标签页
        </button>
        <button
          type="button"
          className="arg-browser-mark"
          data-active={page === "news" ? "true" : "false"}
          onClick={() => go("news")}
        >
          河口晚报
        </button>
      </div>

      <div className="arg-browser-view win11Scroll">
        {current.blocks ? (
          <div className="arg-browser-doc">
            {current.byline ? (
              <div className="arg-browser-byline">{current.byline}</div>
            ) : null}
            <ContentBlocks blocks={current.blocks} />
          </div>
        ) : (
          <div className="arg-browser-page">
            <div className="arg-browser-logo">本地门户</div>
            <div className="arg-browser-search">搜索网页</div>

            <div className="arg-browser-links">
              {(current.links || []).map((link) => (
                <button
                  key={link.page}
                  type="button"
                  className="arg-browser-link"
                  onClick={() => go(link.page)}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="arg-browser-recent">
              <div className="arg-browser-recent-title">最近访问</div>
              {(current.recent || []).map((item, index) => (
                <button
                  key={index}
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

// ---------------------------------------------------------------------------
// 远程桌面连接。凭据直接与 machines 表比对，不经过任何谜题。
// ---------------------------------------------------------------------------

export const RdpWindow = ({
  onClose,
  onMinimize,
  onConnect,
  machines = [],
}) => {
  const [address, setAddress] = useState(
    machines[0] ? machines[0].address : "",
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [phase, setPhase] = useState("address");
  const [target, setTarget] = useState(null);

  const connect = () => {
    const value = address.trim().toLowerCase();
    if (!value) {
      setError("请输入计算机名称或 IP 地址。");
      return;
    }

    const normalized = value.replace(/^rdp:\/\//, "");
    const hit = machines.find(
      (machine) =>
        machine.address.toLowerCase() === normalized ||
        machine.hostname.toLowerCase() === normalized,
    );

    if (!hit) {
      setError("找不到该远程计算机。请确认地址是否正确。");
      return;
    }

    setError("");
    setTarget(hit);
    setAddress(hit.address);
    setPhase("login");
  };

  const login = () => {
    if (!target || password !== target.password) {
      setError("凭据无效。");
      setPassword("");
      return;
    }

    setError("");
    onConnect(target);
  };

  return (
    <PrologueWindow
      title="远程桌面连接"
      subtitle="Remote Desktop Connection"
      icon="rdp"
      onClose={onClose}
      onMinimize={onMinimize}
      className="arg-rdp-window"
    >
      {phase === "login" ? (
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
                <span className="arg-sec-value">
                  {target ? target.user : ""}
                </span>
              </div>
              <div className="arg-sec-row">
                <span className="arg-sec-label">目标</span>
                <span className="arg-sec-value">
                  {target ? target.address : ""}
                </span>
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

          {machines.length ? (
            <div className="arg-rdp-recent">
              {machines.map((machine) => (
                <button
                  key={machine.id}
                  type="button"
                  className="arg-rdp-recent-item"
                  onClick={() => {
                    setAddress(machine.address);
                    setError("");
                  }}
                >
                  {machine.hostname}
                </button>
              ))}
            </div>
          ) : null}

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
            <span>远程会话</span>
            <span>RDP 10.0</span>
          </div>
        </div>
      )}
    </PrologueWindow>
  );
};
