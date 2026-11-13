import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ToolBar } from "../../../utils/general";
import {
  commandHelp,
  ipconfigLines,
  machineOf,
  promptOf,
  terminalMeta,
  unknownCommand,
} from "../../../data/arg/terminal";
import {
  availableChildren,
  displayPath,
  getHost,
  nodeOf,
} from "../../../data/arg/files";
import "./assets/arg-terminal.scss";

// 终端：远程资产上可选的一条查看路径。
// 它不解锁任何东西，也不能推进剧情 —— 文件管理器和记事本才是主线。
// 命令输出全部来自 data/arg/{terminal,files}.js，这里只做解析与滚动。

const toneClass = (tone) =>
  tone ? `arg-term-line arg-term-${tone}` : "arg-term-line";

const resolveChild = (hostId, parentId, name) => {
  const host = getHost(hostId);
  const node = host.nodes[parentId];
  if (!node) return null;

  const target = name.trim().replace(/^\.\//, "").replace(/\\+$/, "");
  if (!target) return null;

  const lower = target.toLowerCase();
  const children = node.children.map((id) => host.nodes[id]).filter(Boolean);

  return (
    children.find(
      (child) =>
        child.name.toLowerCase() === lower ||
        child.name.replace(/\.[^.]+$/, "").toLowerCase() === lower,
    ) || null
  );
};

// 支持 dir / type 里的相对路径：a\b 逐层向下。
const walk = (hostId, startId, input) => {
  const parts = input
    .split(/[\\/]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  let current = nodeOf(hostId, startId);
  for (let i = 0; i < parts.length; i++) {
    if (!current) return null;
    if (parts[i] === "..") {
      current = current.parent ? nodeOf(hostId, current.parent) : null;
      continue;
    }
    current = resolveChild(hostId, current.id, parts[i]);
  }
  return current;
};

const blocksToLines = (blocks) => {
  const lines = [];
  blocks.forEach((block) => {
    if (!block || !block.text) return;
    if (block.type === "h") {
      lines.push({ text: block.text, tone: "ok" });
    } else if (block.type === "code") {
      String(block.text)
        .split("\n")
        .forEach((line) => lines.push({ text: line, tone: "dim" }));
    } else {
      lines.push({ text: block.text, tone: "text" });
    }
  });
  return lines;
};

export const WnTerminal = () => {
  const wnapp = useSelector((state) => state.apps.terminal);
  const arg = useSelector((state) => state.arg);
  const flags = arg.flags || {};
  const dispatch = useDispatch();

  const hostId = arg.host || "chenmo";
  const host = getHost(hostId);
  const machine = machineOf(hostId);

  // cwd 用节点 id，切换盘符时也是同一个文件树里的节点。
  const [cwdId, setCwdId] = useState(host.rootId);
  const [entries, setEntries] = useState(() =>
    terminalMeta.welcome(machine).map((line, index) => ({
      id: `welcome-${index}`,
      text: line.text,
      tone: line.tone,
    })),
  );
  const [draft, setDraft] = useState("");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const seq = useRef(0);

  // 换一台资产时回到该资产的 C:，并清掉上一台的输出。
  useEffect(() => {
    setCwdId(host.rootId);
    setEntries(
      terminalMeta.welcome(machine).map((line, index) => ({
        id: `welcome-${index}`,
        text: line.text,
        tone: line.tone,
      })),
    );
    setHistory([]);
    setHistoryIndex(-1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostId]);

  const push = (list) => {
    if (!list || !list.length) return;
    setEntries((prev) => [
      ...prev,
      ...list.map((line) => ({
        id: `out-${seq.current++}`,
        text: line.text || "",
        tone: line.tone,
      })),
    ]);
  };

  const cwdNode = nodeOf(hostId, cwdId) || nodeOf(hostId, host.rootId);
  const cwdLabel = cwdNode ? displayPath(hostId, cwdNode.id) : "C:";

  const run = (raw) => {
    const cmd = raw.trim();
    if (!cmd) return;

    const [head, ...rest] = cmd.split(/\s+/);
    const lower = head.toLowerCase();
    const argText = rest.join(" ").trim();

    push([{ text: `${promptOf(machine, cwdLabel)}${cmd}`, tone: "cmd" }]);
    setHistory((prev) => [...prev, cmd].slice(-100));
    setHistoryIndex(-1);
    dispatch({ type: "ARG_TERM_PUSH", payload: cmd });

    if (lower === "help") {
      push(commandHelp);
      return;
    }

    if (lower === "whoami") {
      push([{ text: `${host.name}\\${machine.user}`, tone: "text" }]);
      return;
    }

    if (lower === "hostname") {
      push([{ text: machine.hostname, tone: "text" }]);
      return;
    }

    if (lower === "ipconfig") {
      push(ipconfigLines(machine));
      return;
    }

    if (lower === "cls") {
      setEntries([]);
      return;
    }

    if (lower === "exit") {
      dispatch({ type: wnapp.action, payload: "close" });
      return;
    }

    if (lower === "cd") {
      if (!argText) {
        push([{ text: `${cwdLabel}`, tone: "text" }]);
        return;
      }

      if (argText === "..") {
        const parent = cwdNode && cwdNode.parent ? nodeOf(hostId, cwdNode.parent) : null;
        if (parent) setCwdId(parent.id);
        else {
          // 已经在盘符根：切到下一个盘符根，和 Windows 行为一致。
          const roots = host.roots;
          const index = roots.indexOf(cwdNode ? cwdNode.id : host.rootId);
          setCwdId(roots[(index + 1) % roots.length]);
        }
        return;
      }

      const next = walk(hostId, cwdNode.id, argText);
      if (!next || next.type !== "folder") {
        push([{ text: "系统找不到指定的路径。", tone: "err" }]);
        return;
      }

      if (next.requires && flags[next.requires] !== true) {
        push([{ text: "系统找不到指定的路径。", tone: "err" }]);
        return;
      }

      setCwdId(next.id);
      return;
    }

    if (lower === "dir" || lower === "ls") {
      const showHidden = /^(-a|--all|\/a)$/i.test(argText);
      const children = availableChildren(hostId, cwdNode.id, flags, showHidden);

      push([{ text: ` 驱动器 ${cwdLabel} 中的卷`, tone: "dim" }, { text: "" }]);

      if (!children.length) {
        push([{ text: "文件不存在。", tone: "dim" }]);
        return;
      }

      push(
        children.map((child) => ({
          text:
            child.type === "folder"
              ? `${child.name.padEnd(28, " ")}<DIR>`
              : `${child.name.padEnd(28, " ")}${child.description || ""}`,
          tone: child.type === "folder" ? "text" : "dim",
        })),
      );
      return;
    }

    if (lower === "type" || lower === "cat") {
      if (!argText) {
        push([{ text: `用法：${lower} <文件>`, tone: "dim" }]);
        return;
      }

      const node = walk(hostId, cwdNode.id, argText);
      if (!node || node.type !== "file") {
        push([{ text: "系统找不到指定的文件。", tone: "err" }]);
        return;
      }

      const parent = node.parent ? nodeOf(hostId, node.parent) : null;
      if (parent && parent.requires && flags[parent.requires] !== true) {
        push([{ text: "系统找不到指定的文件。", tone: "err" }]);
        return;
      }

      if (!node.content) {
        push([{ text: "该文件没有可显示的文本。", tone: "dim" }]);
        return;
      }

      push(blocksToLines(node.content));

      if (node.readFlag) {
        dispatch({
          type: "ARG_FLAG",
          payload: { flag: node.readFlag, value: true },
        });
      }
      return;
    }

    push(unknownCommand(head));
  };

  const submit = (event) => {
    event.preventDefault();
    const value = draft;
    setDraft("");
    run(value);
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!history.length) return;
      const next = Math.min(historyIndex + 1, history.length - 1);
      setHistoryIndex(next);
      setDraft(history[history.length - 1 - next]);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex <= 0) {
        setHistoryIndex(-1);
        setDraft("");
        return;
      }
      const next = historyIndex - 1;
      setHistoryIndex(next);
      setDraft(history[history.length - 1 - next]);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  return (
    <div
      className="arg-win wnterm arg-terminal floatTab dpShad"
      data-size={wnapp.size}
      data-max={wnapp.max}
      style={{
        ...(wnapp.size == "cstm" ? wnapp.dim : null),
        zIndex: wnapp.z,
      }}
      data-hide={wnapp.hide}
      id={wnapp.icon + "App"}
    >
      <ToolBar
        app={wnapp.action}
        icon={wnapp.icon}
        size={wnapp.size}
        name={terminalMeta.title}
        invert
        bg="#060606"
      />

      <div className="windowScreen flex" data-dock="true">
        <div className="restWindow h-full flex-grow">
          <div
            className="arg-term-body win11Scroll"
            ref={scrollRef}
            onClick={() => inputRef.current && inputRef.current.focus()}
          >
            {entries.map((entry) =>
              entry.text ? (
                <pre key={entry.id} className={toneClass(entry.tone)}>
                  {entry.text}
                </pre>
              ) : (
                <pre key={entry.id} className="arg-term-line">
                  {"\u00a0"}
                </pre>
              ),
            )}

            <form className="arg-term-prompt" onSubmit={submit}>
              <span className="arg-term-cwd">
                {promptOf(machine, cwdLabel)}
              </span>
              <input
                ref={inputRef}
                className="arg-term-input"
                type="text"
                value={draft}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onKeyDown}
                aria-label="终端输入"
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WnTerminal;
