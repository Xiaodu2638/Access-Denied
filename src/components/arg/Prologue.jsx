import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { prologue } from "../../data/arg/prologue";
import { lock } from "../../data/arg/config";
import { ContentBlocks } from "./ContentBlocks";
import {
  BinWindow,
  BrowserWindow,
  CalculatorWindow,
  NotepadWindow,
  PcWindow,
  PrologueGithubWindow,
  PrologueTerminalWindow,
  RdpWindow,
  SettingsWindow,
  VSCodeWindow,
} from "./PrologueWindows";
import "./prologue.scss";

// 引子：主角自己的桌面 → 邮件 → 连接远程桌面。
// 桌面按真实 Windows 的操作习惯实现：
// 单击选中、双击打开、窗口可拖动、任务栏有运行指示、开始菜单点外部关闭。

// 任务栏常驻应用。必须都是 prologue.desktopIcons 里存在的 id，
// 否则任务栏会渲染出点不动的图标。
const taskbarIds = ["vscode", "terminal", "github", "browser", "mail"];

// 窗口位置只在本次会话内记住：刷新页面就回到默认居中。
const windowPositions = {};

// 可拖动窗口外壳。
// 未拖动前用 CSS 居中（left/top 50% + translate），拖动后改用像素坐标。
// 入场动画只动 opacity，避免和居中用的 translate 打架。
// offset 让同时打开的窗口逐个错开，不至于完全重叠。
// minimized 的窗口收起成 scale(0.6) + 透明，对应任务栏上的"最小化"。
const FloatingWindow = ({
  id,
  offset = 0,
  z,
  active,
  minimized,
  maximized,
  snap,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onSnap,
  children,
}) => {
  const [pos, setPos] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const drag = useRef(null);

  // 窗口位置记忆：只在本次会话内有效，key 用应用 id。
  useEffect(() => {
    const saved = windowPositions[id];
    if (!saved) return;
    // 限制在可视区域内，避免从大屏切到小屏时跑到屏幕外。
    setPos({
      x: Math.min(Math.max(saved.x, 0), Math.max(0, window.innerWidth - 160)),
      y: Math.min(Math.max(saved.y, 0), Math.max(0, window.innerHeight - 120)),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const rememberPos = (next) => {
    windowPositions[id] = next;
  };

  // 根据指针位置决定吸附区域。靠近顶部 = 最大化，左/右边缘 = 半屏。
  const snapZoneAt = (x, y) => {
    const edge = 24;
    if (y <= edge) return "top";
    if (x <= edge) return "left";
    if (x >= window.innerWidth - edge) return "right";
    return null;
  };

  const startDrag = (event) => {
    onFocus(id);
    if (maximized) return;
    if (event.button !== 0) return;
    if (event.target.closest("button, input, a, [contenteditable]")) return;

    const bar = event.target.closest(".arg-app-titlebar, .arg-mail-titlebar");
    if (!bar) return;

    // 首次拖动时把当前屏幕位置结算成像素坐标，避免跳变。
    const rect = event.currentTarget.getBoundingClientRect();
    drag.current = {
      dx: event.clientX - rect.left,
      dy: event.clientY - rect.top,
    };
    setPos({ x: Math.round(rect.left), y: Math.round(rect.top) });
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  };

  const moveDrag = (event) => {
    if (!drag.current) return;
    const next = {
      x: Math.round(event.clientX - drag.current.dx),
      y: Math.round(event.clientY - drag.current.dy),
    };
    // 同步存一份到 ref，endDrag 不依赖 React 是否已重渲染。
    drag.current.last = next;
    setPos(next);
    setPreview(snapZoneAt(event.clientX, event.clientY));
  };

  const endDrag = (event) => {
    if (drag.current) {
      const zone = snapZoneAt(event.clientX, event.clientY);
      const finalPos = drag.current.last || pos;
      if (zone) {
        onSnap(id, zone);
        // 吸附后不再记住旧坐标，下次打开回到默认位置。
        delete windowPositions[id];
      } else if (finalPos) {
        setPos(finalPos);
        rememberPos(finalPos);
      }
    }
    drag.current = null;
    setDragging(false);
    setPreview(null);
  };

  let style;

  if (minimized) {
    style = {
      left: "50%",
      top: "100%",
      transform: "translate(-50%, -50%) scale(0.6)",
      opacity: 0,
      pointerEvents: "none",
    };
  } else if (maximized || snap === "top") {
    // 父容器 .arg-prologue-desktop 已经让开任务栏（inset: 0 0 48px），
    // 所以这里直接用 100%，不能再减 48px。
    style = {
      left: 0,
      top: 0,
      width: "100%",
      height: "100%",
      transform: "none",
    };
  } else if (snap === "left" || snap === "right") {
    style = {
      left: snap === "left" ? 0 : "50%",
      top: 0,
      width: "50%",
      height: "100%",
      transform: "none",
    };
  } else if (pos) {
    style = { left: pos.x, top: pos.y };
  } else {
    style = {
      left: "50%",
      top: "50%",
      transform: `translate(calc(-50% + ${offset}px), calc(-50% + ${offset}px))`,
    };
  }

  return (
    <>
      {preview ? (
        <div className="arg-snap-preview" data-zone={preview} aria-hidden="true" />
      ) : null}

      <div
        className="arg-win-host"
        data-active={active ? "true" : "false"}
        data-moved={pos ? "true" : "false"}
        data-minimized={minimized ? "true" : "false"}
        data-maximized={maximized || snap === "top" ? "true" : "false"}
        data-snap={snap || "none"}
        data-dragging={dragging ? "true" : "false"}
        style={{ ...style, zIndex: z }}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        role="presentation"
      >
        {children({
          onClose: () => onClose(id),
          onMinimize: () => onMinimize(id),
          onMaximize: () => onMaximize(id),
          maximized: maximized || snap === "top",
        })}
      </div>
    </>
  );
};

const Prologue = () => {
  const dispatch = useDispatch();

  // 已打开的窗口：[{ id, z }]，数组顺序即打开顺序。
  const [openWindows, setOpenWindows] = useState([]);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [selectedId, setSelectedId] = useState(prologue.emails[0].id);
  // 邮件原文：默认收起，和真实邮件客户端一样藏在“查看原文”里。
  const [mailSource, setMailSource] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [menu, setMenu] = useState(null);
  const [iconMenu, setIconMenu] = useState(null);
  const [search, setSearch] = useState("");
  // 最近使用的应用 id（最新在前），只存内存，不跨刷新。
  const [recentApps, setRecentApps] = useState([]);
  const [now, setNow] = useState(() => {
    const [h, m] = prologue.host.time.split(":").map(Number);
    return { h, m };
  });
  const [stage, setStage] = useState("desktop");
  const [lineCount, setLineCount] = useState(0);
  const [done, setDone] = useState(false);

  // 桌面图标顺序。可从右键菜单恢复默认，也支持拖拽重排。
  const [iconOrder, setIconOrder] = useState(() =>
    prologue.desktopIcons.map((icon) => icon.id),
  );
  const dragIcon = useRef(null);

  const zRef = useRef(10);
  const desktopRef = useRef(null);

  // 窗口切换面板：Ctrl + ` 打开，方向键切换，Enter 确认，Esc 取消。
  const [switcher, setSwitcher] = useState(null);
  const switchIndex = useRef(0);

  const selected = useMemo(
    () => prologue.emails.find((email) => email.id === selectedId),
    [selectedId],
  );

  // 切到另一封信时收起原文，避免把上一封的邮件头留在下面。
  useEffect(() => {
    setMailSource(false);
  }, [selectedId]);

  const topWindow = openWindows.reduce(
    (top, item) => (!top || item.z > top.z ? item : top),
    null,
  );

  // 按 iconOrder 排好序的桌面图标。
  const orderedIcons = iconOrder
    .map((id) => prologue.desktopIcons.find((icon) => icon.id === id))
    .filter(Boolean);

  // 拖拽重排：把 from 挪到 to 的位置。
  const moveIcon = (from, to) => {
    if (!from || !to || from === to) return;
    setIconOrder((prev) => {
      const next = [...prev];
      const fromIndex = next.indexOf(from);
      const toIndex = next.indexOf(to);
      if (fromIndex < 0 || toIndex < 0) return prev;
      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, from);
      return next;
    });
  };

  // 时钟：从 09:12 起每分钟走一格，和真实时间无关。
  useEffect(() => {
    const timer = setInterval(() => {
      setNow((prev) => {
        const m = prev.m + 1;
        return m >= 60 ? { h: (prev.h + 1) % 24, m: 0 } : { h: prev.h, m };
      });
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // 连接动画
  useEffect(() => {
    if (stage !== "connecting") return;

    const { lines, stepDelay, holdDelay, fadeDelay } = prologue.connect;
    const timers = [];

    lines.forEach((_, index) => {
      timers.push(
        setTimeout(() => setLineCount(index + 1), 300 + index * stepDelay),
      );
    });

    const total = 300 + lines.length * stepDelay + holdDelay;

    timers.push(setTimeout(() => setDone(true), total));
    timers.push(
      setTimeout(() => {
        // RDP 已经验证过密码，连接完成就直接进入桌面，
        // 不再让锁屏问第二遍。
        dispatch({ type: "WALLUNLOCK" });
        dispatch({
          type: "ARG_FLAG",
          payload: { flag: "prologueSeen", value: true },
        });
      }, total + fadeDelay),
    );

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [stage, dispatch]);

  const focus = useCallback((id) => {
    setOpenWindows((prev) => {
      const hit = prev.find((item) => item.id === id);
      if (!hit) return prev;
      if (hit.z === zRef.current) return prev;
      zRef.current += 1;
      return prev.map((item) =>
        item.id === id ? { ...item, z: zRef.current } : item,
      );
    });
  }, []);

  const open = useCallback((id, emailId) => {
    if (emailId) setSelectedId(emailId);
    setStartOpen(false);
    setMenu(null);
    setIconMenu(null);
    setSelectedIcon(null);
    setRecentApps((prev) => [id, ...prev.filter((entry) => entry !== id)].slice(0, 4));
    setOpenWindows((prev) => {
      const hit = prev.find((item) => item.id === id);
      zRef.current += 1;
      if (hit) {
        return prev.map((item) =>
          item.id === id
            ? { ...item, z: zRef.current, minimized: false }
            : item,
        );
      }
      return [...prev, { id, z: zRef.current, minimized: false, maximized: false }];
    });
  }, []);

  const close = useCallback((id) => {
    setOpenWindows((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // 拖到边缘时吸附：top = 最大化，left / right = 占半屏。
  const snapWindow = useCallback((id, zone) => {
    setOpenWindows((prev) => {
      zRef.current += 1;
      return prev.map((item) =>
        item.id === id
          ? {
              ...item,
              snap: zone === "top" ? null : zone,
              maximized: zone === "top",
              minimized: false,
              z: zRef.current,
            }
          : item,
      );
    });
  }, []);

  const minimize = useCallback((id) => {
    setOpenWindows((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, minimized: true, z: -1 } : item,
      ),
    );
  }, []);

  const maximize = useCallback((id) => {
    setOpenWindows((prev) => {
      zRef.current += 1;
      return prev.map((item) =>
        item.id === id
          ? {
              ...item,
              maximized: !item.maximized,
              minimized: false,
              z: zRef.current,
            }
          : item,
      );
    });
  }, []);

  // 任务栏：窗口已打开且在最前 → 最小化；已打开但被压住 → 提到最前；未打开 → 打开。
  const toggleFromTaskbar = (id) => {
    const item = openWindows.find((entry) => entry.id === id);
    if (!item) return open(id);
    if (item.minimized) return open(id);
    if (topWindow && topWindow.id === id) return minimize(id);
    return open(id);
  };

  const connect = () => {
    if (stage !== "desktop") return;
    setStage("connecting");
  };

  // 窗口切换器。
  // 注意：Alt+Tab 是操作系统级快捷键，浏览器收不到，所以主键位用 Ctrl + 反引号，
  // 同时保留 Alt + 反引号作为别名。按 Esc 或再按一次热键可取消。
  useEffect(() => {
    const listable = openWindows.filter((item) => !item.minimized);
    const appOf = (id) => prologue.desktopIcons.find((icon) => icon.id === id);

    const isHotkey = (event) =>
      (event.ctrlKey || event.altKey) && (event.key === "`" || event.code === "Backquote");

    const onKeyDown = (event) => {
      // 切换面板打开时，用方向键 / Tab 轮换，Enter 或 Esc 结束。
      if (switcher) {
        if (event.key === "Escape") {
          event.preventDefault();
          setSwitcher(null);
          return;
        }
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          const step = event.key === "ArrowRight" ? 1 : -1;
          switchIndex.current =
            (switchIndex.current + step + listable.length) % listable.length;
          setSwitcher((prev) => (prev ? { ...prev, index: switchIndex.current } : prev));
          return;
        }
        if (event.key === "Enter") {
          event.preventDefault();
          const target = listable[switchIndex.current];
          setSwitcher(null);
          if (target) open(target.id);
          return;
        }
      }

      if (!isHotkey(event) || !listable.length) return;
      event.preventDefault();

      switchIndex.current = switcher
        ? (switchIndex.current + 1) % listable.length
        : 0;

      setSwitcher({
        items: listable.map((item) => ({
          id: item.id,
          label: (appOf(item.id) || { label: item.id }).label,
          icon: (appOf(item.id) || { icon: "explorer" }).icon,
        })),
        index: switchIndex.current,
      });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openWindows, open, switcher]);

  const renderWindow = (id, handlers) => {
    switch (id) {
      case "vscode":
        return <VSCodeWindow {...handlers} />;
      case "terminal":
        return <PrologueTerminalWindow {...handlers} />;
      case "github":
        return <PrologueGithubWindow {...handlers} />;
      case "rdp":
        return (
          <RdpWindow
            {...handlers}
            onConnect={() => {
              handlers.onClose();
              connect();
            }}
          />
        );
      case "pc":
        return <PcWindow {...handlers} />;
      case "browser":
        return <BrowserWindow {...handlers} />;
      case "notepad":
        return <NotepadWindow {...handlers} />;
      case "calculator":
        return <CalculatorWindow {...handlers} />;
      case "settings":
        return <SettingsWindow {...handlers} />;
      case "bin":
        return <BinWindow {...handlers} />;
      default:
        return null;
    }
  };

  const renderMail = (handlers) => {
    const headers =
      selected &&
      (selected.headers || [
        `From: ${selected.fromName} <${selected.from}>`,
        `To: ${prologue.host.account}`,
        `Date: ${selected.time}`,
        `Subject: ${selected.subject}`,
      ]);

    return (
    <div className="arg-mail-window">
      <div className="arg-mail-titlebar">
        <span className="arg-mail-appname">{prologue.mailbox.title}</span>
        <span className="arg-mail-title">
          {prologue.mailbox.activeFolder} · {prologue.host.account}
        </span>

        <div className="arg-app-controls">
          <button
            type="button"
            className="arg-app-ctl"
            aria-label="最小化"
            title="最小化"
            onClick={handlers.onMinimize}
          >
            <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true">
              <path d="M1 5h8" stroke="currentColor" strokeWidth="1.1" />
            </svg>
          </button>
          <button
            type="button"
            className="arg-app-ctl"
            aria-label={handlers.maximized ? "向下还原" : "最大化"}
            title={handlers.maximized ? "向下还原" : "最大化"}
            onClick={handlers.onMaximize}
          >
            <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true">
              <rect
                x="1.5"
                y="1.5"
                width="7"
                height="7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.1"
              />
            </svg>
          </button>
          <button
            type="button"
            className="arg-app-ctl arg-app-ctl-close"
            aria-label="关闭"
            title="关闭"
            onClick={handlers.onClose}
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

      <div className="arg-mail-main">
        <aside className="arg-mail-side">
          <div className="arg-mail-account">{prologue.host.account}</div>
          {prologue.mailbox.folders.map((folder) => (
            <div
              key={folder}
              className="arg-mail-folder"
              data-active={
                folder === prologue.mailbox.activeFolder ? "true" : "false"
              }
            >
              {folder}
            </div>
          ))}
        </aside>

        <section className="arg-mail-list">
          {prologue.emails.map((email) => (
            <button
              key={email.id}
              type="button"
              className="arg-mail-item"
              data-active={email.id === selectedId ? "true" : "false"}
              data-unread={email.unread ? "true" : "false"}
              onClick={() => setSelectedId(email.id)}
            >
              <div className="arg-mail-item-top">
                <span className="arg-mail-from">{email.fromName}</span>
                <span className="arg-mail-time">{email.time}</span>
              </div>
              <div className="arg-mail-subject">{email.subject}</div>
              <div className="arg-mail-tagline">
                {email.tag ? <span className="arg-mail-tag">{email.tag}</span> : null}
                {email.unread ? (
                  <span className="arg-mail-unread" aria-label="未读" />
                ) : null}
              </div>
            </button>
          ))}
        </section>

        {selected ? (
          <article className="arg-mail-read">
            <header className="arg-mail-read-head">
              <h2>{selected.subject}</h2>
              <div className="arg-mail-meta">
                <span>
                  {selected.fromName} &lt;{selected.from}&gt; · {selected.time}
                </span>
                <button
                  type="button"
                  className="arg-mail-source-toggle"
                  onClick={() => setMailSource((value) => !value)}
                >
                  {mailSource ? "隐藏原文" : "查看原文"}
                </button>
              </div>
            </header>

            <div className="arg-mail-read-body win11Scroll">
              {mailSource && headers ? (
                <pre className="arg-mail-source">{headers.join("\n")}</pre>
              ) : null}
              <ContentBlocks blocks={selected.blocks} />
            </div>

            {selected.action ? (
              <div className="arg-mail-action">
                <button type="button" onClick={connect}>
                  {selected.action.label}
                </button>
                <div className="arg-mail-action-hint">
                  {selected.action.hint}
                </div>
              </div>
            ) : null}
          </article>
        ) : null}
      </div>
    </div>
    );
  };

  // 开始菜单里显示的应用 = 桌面图标 + 只在开始菜单出现的应用。
  const menuIcons = [...orderedIcons, ...prologue.startMenuOnly];

  // 任务栏先放常驻应用，再把已打开但不在常驻列表里的应用追加进去。
  const pinnedTaskbar = prologue.desktopIcons.filter((icon) =>
    taskbarIds.includes(icon.id),
  );
  const runningExtras = openWindows
    .map((item) =>
      [...prologue.desktopIcons, ...prologue.startMenuOnly].find(
        (icon) => icon.id === item.id,
      ),
    )
    .filter((icon) => icon && !taskbarIds.includes(icon.id));
  const taskbarApps = [...pinnedTaskbar, ...runningExtras];

  const clockLabel = `${String(now.h).padStart(2, "0")}:${String(now.m).padStart(2, "0")}`;

  const onDesktopClick = (event) => {
    if (event.target !== desktopRef.current) return;
    setSelectedIcon(null);
    setStartOpen(false);
    setMenu(null);
    setIconMenu(null);
  };

  const onDesktopContext = (event) => {
    event.preventDefault();
    setStartOpen(false);
    setSelectedIcon(null);
    setIconMenu(null);
    setMenu({
      x: Math.min(event.clientX, window.innerWidth - 190),
      y: Math.min(event.clientY, window.innerHeight - 160),
    });
  };

  return (
    <div
      className="arg-prologue"
      data-stage={stage}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        if (menu) return setMenu(null);
        if (startOpen) return setStartOpen(false);
        if (topWindow) return close(topWindow.id);
      }}
      tabIndex={-1}
    >
      <div className="arg-prologue-wallpaper"></div>

      <div
        className="arg-prologue-desktop"
        ref={desktopRef}
        onClick={onDesktopClick}
        onContextMenu={onDesktopContext}
      >
        <div className="arg-prologue-icons">
          {orderedIcons.map((icon) => (
            <button
              key={icon.id}
              type="button"
              className="arg-desk-icon"
              draggable
              data-selected={selectedIcon === icon.id ? "true" : "false"}
              data-open={openWindows.some((item) => item.id === icon.id) ? "true" : "false"}
              onClick={(event) => {
                event.stopPropagation();
                setSelectedIcon(icon.id);
                setMenu(null);
              }}
              onDoubleClick={() => open(icon.id)}
              onContextMenu={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setSelectedIcon(icon.id);
                setMenu(null);
                setStartOpen(false);
                setIconMenu({
                  id: icon.id,
                  x: Math.min(event.clientX, window.innerWidth - 190),
                  y: Math.min(event.clientY, window.innerHeight - 120),
                });
              }}
              onDragStart={() => {
                dragIcon.current = icon.id;
              }}
              onDragOver={(event) => {
                event.preventDefault();
              }}
              onDrop={(event) => {
                event.preventDefault();
                event.stopPropagation();
                moveIcon(dragIcon.current, icon.id);
                dragIcon.current = null;
              }}
              onDragEnd={() => {
                dragIcon.current = null;
              }}
            >
              <span className="arg-desk-icon-img">
                <img src={`img/icon/${icon.icon}.png`} alt="" draggable="false" />
              </span>
              <span className="arg-desk-icon-label">{icon.label}</span>
            </button>
          ))}
        </div>

        {openWindows.map((item, index) =>
          item.id === "mail" ? (
            <FloatingWindow
              key="mail"
              id="mail"
              offset={index * 26}
              z={item.z}
              active={topWindow && topWindow.id === "mail"}
              minimized={item.minimized}
              maximized={item.maximized}
              snap={item.snap}
              onFocus={focus}
              onClose={close}
              onMinimize={minimize}
              onMaximize={maximize}
              onSnap={snapWindow}
            >
              {(handlers) => renderMail(handlers)}
            </FloatingWindow>
          ) : (
            <FloatingWindow
              key={item.id}
              id={item.id}
              offset={index * 26}
              z={item.z}
              active={topWindow && topWindow.id === item.id}
              minimized={item.minimized}
              maximized={item.maximized}
              snap={item.snap}
              onFocus={focus}
              onClose={close}
              onMinimize={minimize}
              onMaximize={maximize}
              onSnap={snapWindow}
            >
              {(handlers) => renderWindow(item.id, handlers)}
            </FloatingWindow>
          ),
        )}

        {menu ? (
          <div
            className="arg-desk-menu"
            style={{ left: menu.x, top: menu.y }}
            onClick={(event) => event.stopPropagation()}
            role="menu"
          >
            <button
              type="button"
              className="arg-desk-menu-item"
              onClick={() => {
                setMenu(null);
                setSelectedIcon(null);
              }}
            >
              刷新
            </button>
            <button
              type="button"
              className="arg-desk-menu-item"
              onClick={() => {
                setIconOrder(prologue.desktopIcons.map((icon) => icon.id));
                setMenu(null);
              }}
            >
              恢复图标顺序
            </button>
            <div className="arg-desk-menu-sep"></div>
            <div className="arg-desk-menu-item" data-disabled="true">
              查看
            </div>
            <div className="arg-desk-menu-item" data-disabled="true">
              显示设置
            </div>
            <div className="arg-desk-menu-item" data-disabled="true">
              个性化
            </div>
          </div>
        ) : null}

        {iconMenu ? (
          <div
            className="arg-desk-menu"
            style={{ left: iconMenu.x, top: iconMenu.y }}
            onClick={(event) => event.stopPropagation()}
            role="menu"
          >
            <button
              type="button"
              className="arg-desk-menu-item"
              onClick={() => {
                open(iconMenu.id);
                setIconMenu(null);
              }}
            >
              打开
            </button>
            <div className="arg-desk-menu-sep"></div>
            <div className="arg-desk-menu-item" data-disabled="true">
              属性
            </div>
          </div>
        ) : null}

        {switcher ? (
          <div className="arg-switcher" role="dialog" aria-label="切换窗口">
            {switcher.items.map((item, index) => (
              <div
                key={item.id}
                className="arg-switcher-item"
                data-active={index === switcher.index ? "true" : "false"}
              >
                <img src={`img/icon/${item.icon}.png`} alt="" />
                <span>{item.label}</span>
              </div>
            ))}
            <div className="arg-switcher-hint">Ctrl + `</div>
          </div>
        ) : null}

        {startOpen ? (
          <div className="arg-start-menu" onClick={(e) => e.stopPropagation()}>
            <input
              className="arg-start-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="搜索应用、设置和文档"
              aria-label="搜索应用"
            />
            <div className="arg-start-grid">
              {menuIcons
                .filter((icon) => icon.label.includes(search.trim()))
                .map((icon) => (
                  <button
                    key={icon.id}
                    type="button"
                    className="arg-start-app"
                    onClick={() => {
                      open(icon.id);
                      setSearch("");
                    }}
                  >
                    <img src={`img/icon/${icon.icon}.png`} alt="" />
                    <span>{icon.label}</span>
                  </button>
                ))}
            </div>

            {!search.trim() && recentApps.length ? (
              <div className="arg-start-recent">
                <div className="arg-start-recent-title">最近使用</div>
                <div className="arg-start-recent-list">
                  {recentApps
                    .map((id) => prologue.desktopIcons.find((icon) => icon.id === id))
                    .filter(Boolean)
                    .map((icon) => (
                      <button
                        key={icon.id}
                        type="button"
                        className="arg-start-recent-item"
                        onClick={() => {
                          open(icon.id);
                          setSearch("");
                        }}
                      >
                        <img src={`img/icon/${icon.icon}.png`} alt="" />
                        <span>{icon.label}</span>
                      </button>
                    ))}
                </div>
              </div>
            ) : null}

            <div className="arg-start-footer">
              <span className="arg-start-user">{prologue.host.account}</span>
              <span className="arg-start-power">⏻</span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="arg-prologue-taskbar">
        <div className="arg-taskbar-left">
          <button
            type="button"
            className="arg-taskbar-start"
            aria-label="开始"
            data-open={startOpen ? "true" : "false"}
            onClick={(event) => {
              event.stopPropagation();
              setStartOpen((value) => !value);
              setMenu(null);
            }}
          >
            <img src="img/icon/home.png" alt="" />
          </button>
        </div>

        <div className="arg-taskbar-apps">
          {taskbarApps.map((icon) => {
            const isOpen = openWindows.some((item) => item.id === icon.id);
            const isActive = topWindow && topWindow.id === icon.id;
            return (
              <button
                key={icon.id}
                type="button"
                className="arg-taskbar-app"
                data-active={isActive ? "true" : "false"}
                data-running={isOpen ? "true" : "false"}
                aria-label={icon.label}
                title={icon.label}
                onClick={() => toggleFromTaskbar(icon.id)}
              >
                <img src={`img/icon/${icon.icon}.png`} alt="" />
                <span className="arg-taskbar-dot"></span>
              </button>
            );
          })}
        </div>

        <div className="arg-taskbar-clock">
          <span>{clockLabel}</span>
          <span>{prologue.host.date}</span>
        </div>
      </div>

      {stage !== "desktop" ? (
        <div className="arg-connecting" data-done={done}>
          {/* 连接过渡背景直接用锁屏壁纸，
              这样淡出时下面露出来的就是同一张图，不会闪出主角的桌面。 */}
          <div
            className="arg-connecting-wall"
            style={{ backgroundImage: `url(img/wallpaper/${lock.wallpaper})` }}
          ></div>
          <div className="arg-connecting-shade"></div>
          <div className="arg-connecting-box">
            <div className="arg-connecting-title">{prologue.connect.title}</div>
            <div className="arg-connecting-address">
              {prologue.connect.address}
            </div>
            <div className="arg-connecting-lines">
              {prologue.connect.lines.slice(0, lineCount).map((line, index) => (
                <div
                  key={index}
                  className="arg-connect-line"
                  data-warn={line.startsWith("警告") ? "true" : "false"}
                >
                  {line}
                </div>
              ))}
              <span className="arg-connect-cursor">▍</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Prologue;
