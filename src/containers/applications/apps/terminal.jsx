import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ToolBar } from "../../../utils/general";
import {
  commands,
  terminalMeta,
  unknownCommand,
  unlockKey,
} from "../../../data/arg/terminal";
import {
  canAccess,
  contentOf,
  fileSystem,
  projectId,
} from "../../../data/arg/files";
import { dumpReady, resolvePage } from "../../../data/arg/browser";
import "./assets/arg-terminal.scss";

// 终端：命令输出全部来自 src/data/arg/terminal.js，
// 这里只做输入、历史、滚动和进度标记。
// 玩家在这里敲过的命令会写进 state.arg.terminalHistory，供结局判断。

const toneClass = (tone) => (tone ? `arg-term-line arg-term-${tone}` : "arg-term-line");

const welcomeEntries = () =>
  terminalMeta.welcome.map((line, index) => ({
    id: `welcome-${index}`,
    text: line.text,
    tone: line.tone,
  }));

export const WnTerminal = () => {
  const wnapp = useSelector((state) => state.apps.terminal);
  const flags = useSelector((state) => state.arg.flags);
  const dispatch = useDispatch();

  const [entries, setEntries] = useState(welcomeEntries);
  const [draft, setDraft] = useState("");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const seq = useRef(0);

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

  const projectNode = fileSystem.nodes[projectId];

  const resolveFile = (name) => {
    if (!projectNode) return null;
    const target = name.trim().toLowerCase().replace(/^\.\//, "");
    if (!target) return null;

    // 先找项目根目录的文件，再找子目录，支持 logs/daemon.log 这样的相对路径。
    const candidates = [];
    projectNode.children.forEach((id) => {
      const node = fileSystem.nodes[id];
      if (!node) return;
      candidates.push(node);
      if (node.type === "folder") {
        node.children.forEach((childId) => {
          const child = fileSystem.nodes[childId];
          if (child) candidates.push(child);
        });
      }
    });

    return (
      candidates.find((node) => {
        if (node.type !== "file") return false;
        if (node.name.toLowerCase() === target) return true;
        const relative = node.id.slice(projectId.length + 1).toLowerCase();
        return relative === target;
      }) || null
    );
  };

  const run = (raw) => {
    const cmd = raw.trim();
    if (!cmd) return;

    const [head, ...rest] = cmd.split(/\s+/);
    const lower = head.toLowerCase();
    const arg = rest.join(" ").trim();

    push([{ text: `${terminalMeta.cwd}>${cmd}`, tone: "cmd" }]);

    setHistory((prev) => [...prev, cmd].slice(-100));
    setHistoryIndex(-1);
    dispatch({ type: "ARG_TERM_PUSH", payload: cmd });

    // 带子命令的完整命令优先匹配，例如 git log / maintainer --accept。
    const fullKey = [lower, ...rest.map((part) => part.toLowerCase())].join(" ");
    const subKey = `${lower} ${rest[0] ? rest[0].toLowerCase() : ""}`.trim();
    const def = commands[fullKey] || commands[cmd.toLowerCase()] || commands[subKey] || commands[lower];

    if (!def) {
      push(unknownCommand(head));
      return;
    }

    // 前置条件没满足时，这条命令当作不存在。
    if (def.requires && flags[def.requires] !== true) {
      push(unknownCommand(head));
      return;
    }

    // 有些命令的输出会随玩家看过的东西变化，但提示语不解释为什么。
    // variants 按顺序匹配，第一个 flags 全部为真的分支生效。
    if (def.variants) {
      const hit = def.variants.find((variant) =>
        (variant.flags || []).every((flag) => flags[flag] === true),
      );
      if (hit) {
        push(hit.lines || def.lines || []);
        return;
      }
    }

    if (def.clear) {
      setEntries([]);
      return;
    }

    if (def.close) {
      push(def.lines);
      setTimeout(() => dispatch({ type: wnapp.action, payload: "close" }), 400);
      return;
    }

    if (lower === "unlock") {
      if (!arg) {
        push([{ text: `用法：${def.usage}`, tone: "dim" }]);
        return;
      }

      if (arg.trim() === unlockKey) {
        push(def.lines);
        dispatch({ type: "ARG_FLAG", payload: { flag: "unlocked", value: true } });
      } else {
        push(def.wrongLines || []);
      }
      return;
    }

    if (lower === "restore") {
      push(def.lines);
      dispatch({ type: "ARG_FLAG", payload: { flag: "restored", value: true } });
      return;
    }

    if (lower === "cat") {
      if (!arg) {
        push([{ text: "用法：cat <file>", tone: "dim" }]);
        return;
      }

      const node = resolveFile(arg);
      if (!node || node.type !== "file") {
        push([{ text: "找不到该文件。", tone: "err" }]);
        return;
      }

      const parent = node.parent ? fileSystem.nodes[node.parent] : null;
      if ((node.locked && !canAccess(node, flags)) || (parent && !canAccess(parent, flags))) {
        push([{ text: "拒绝访问。", tone: "err" }]);
        return;
      }

      const blocks = contentOf(node, flags);

      if (!blocks) {
        push([{ text: "该文件没有可显示的文本。", tone: "dim" }]);
        return;
      }

      const lines = [];
      blocks.forEach((block) => {
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

      push(lines);

      // 读的是 .session：记下这件事，dump 最后一行才会显出来。
      if (node.name === ".session") {
        dispatch({
          type: "ARG_FLAG",
          payload: { flag: "readSession", value: true },
        });
      }
      return;
    }

    if (lower === "ls" || lower === "dir") {
      if (!projectNode) {
        push([{ text: "目录不可用。", tone: "err" }]);
        return;
      }

      // ls -a / ls --all / dir /a 才列出隐藏项目。
      const showHidden = /^(-a|--all|\/a)$/i.test(arg);

      push([
        {
          text: projectNode.children
            .map((id) => fileSystem.nodes[id])
            .filter((node) => showHidden || !node.hidden)
            .map((node) =>
              node.type === "folder" ? `${node.name}/` : node.name,
            )
            .join("   "),
          tone: "text",
        },
      ]);

      if (!flags.unlocked) {
        push([
          {
            text: "encrypted/       访问被拒绝。",
            tone: "err",
          },
        ]);
      }
      return;
    }

    if (lower === "open") {
      const page = resolvePage(arg);

      if (!page) {
        push(def.wrongLines || []);
        return;
      }

      push(def.lines);
      dispatch({ type: "ARG_BROWSER", payload: page });
      dispatch({ type: "MSEDGE", payload: "full" });
      return;
    }

    if (def.lines) push(def.lines);

    if (def.flag) {
      dispatch({ type: "ARG_FLAG", payload: { flag: def.flag, value: true } });
    }

    // 某些命令直接通往结局：输出播完再切。
    if (def.ending) {
      setTimeout(() => {
        dispatch({ type: "ARG_ENDING", payload: def.ending });
      }, 1600);
    }

    // 提交会话：分片齐了是公开，不齐是被退回。
    if (def.dynamicEnding === true) {
      const full = dumpReady(flags);
      setTimeout(() => {
        dispatch({
          type: "ARG_ENDING",
          payload: full ? "publish" : "premature",
        });
      }, 1600);
    }

    // 命名：需要一个名字，名字会写进锁屏。
    if (def.dynamicEnding === "named") {
      // arg 是 "--name foo" 的后半段，剥掉标志本身。
      const name = arg.replace(/^--name\s*/i, "").trim();
      if (!name) {
        push([{ text: `用法：${def.usage}`, tone: "dim" }]);
        return;
      }

      push([
        { text: `identity  ${name}  similarity 0.000`, tone: "ok" },
        { text: "签名已切换。", tone: "ok" },
        { text: "此会话不再署名 linche。", tone: "dim" },
      ]);

      setTimeout(() => {
        dispatch({
          type: "ARG_FLAG",
          payload: { flag: "named", value: true },
        });
        dispatch({
          type: "ARG_LOCK_OVERRIDE",
          payload: { identity: name },
        });
        dispatch({ type: "ARG_ENDING", payload: "named" });
      }, 1600);
    }
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
              <span className="arg-term-cwd">{terminalMeta.cwd}&gt;</span>
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
