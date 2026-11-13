import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ToolBar } from "../../../utils/general";
import { useEscape } from "../../../utils/arg";
import {
  availableChildren,
  collectFiles,
  displayPath,
  getHost,
  handoverReadme,
  nodeOf,
  pathOf,
} from "../../../data/arg/files";
import { handoverDrive, machines } from "../../../data/arg/config";
import "./assets/arg-explorer.scss";

// 文件管理器：远程资产上的 C: / D: / 交接盘 (Z:)。
// 只读取 src/data/arg/files.js；复制动作写进 state.arg.handover。
// 隐藏项目开关与 Windows 一致，默认关闭。

const iconPaths = {
  folder: (
    <>
      <path d="M3 6.5h6.2l1.4 1.6H21v9.4a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" />
      <path d="M3 6.5V5.4c0-.8.7-1.4 1.5-1.4h4.2l1.5 1.7H18.5c.8 0 1.5.6 1.5 1.4v.4z" />
    </>
  ),
  drive: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 12h18" />
      <circle cx="17" cy="15" r="1" />
    </>
  ),
  photo: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M4.5 17l5-5 3.5 3.5 2.5-2.5 4 4" />
    </>
  ),
  network: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" />
    </>
  ),
  doc: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
    </>
  ),
};

const FileIcon = ({ kind = "doc", size = 18 }) => (
  <svg
    className="arg-file-icon"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    aria-hidden="true"
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {iconPaths[kind] || iconPaths.doc}
    </g>
  </svg>
);

const kindOf = (node) => {
  if (!node) return "doc";
  if (node.type === "folder") return "folder";
  if (node.info && node.info.icon === "drive") return "drive";
  if (node.kind === "photo") return "photo";
  return "doc";
};

const driveLabel = (node) =>
  (node.info && node.info.label) || node.name;

const Explorer = () => {
  const wnapp = useSelector((state) => state.apps.explorer);
  const arg = useSelector((state) => state.arg);
  const dispatch = useDispatch();

  const hostId = arg.host || "chenmo";
  const host = getHost(hostId);
  const flags = arg.flags || {};
  const machine = machines[hostId] || machines.chenmo;
  const hasHandover = hostId === "chenmo";

  const [loc, setLoc] = useState({ kind: "computer" });
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [showHidden, setShowHidden] = useState(false);
  const [notice, setNotice] = useState("");

  // 换一台资产时回到「此电脑」，避免把上一台的路径带过来。
  useEffect(() => {
    setLoc({ kind: "computer" });
    setSelected(null);
    setSearch("");
    setNotice("");
  }, [hostId]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(""), 3200);
    return () => clearTimeout(timer);
  }, [notice]);

  const drives = useMemo(
    () =>
      host.roots
        .map((id) => host.nodes[id])
        .filter((node) => node)
        .filter((node) => !node.requires || flags[node.requires]),
    [host, flags],
  );

  const currentFolder =
    loc.kind === "folder" ? nodeOf(hostId, loc.id) : null;

  const children = useMemo(() => {
    if (loc.kind !== "folder" || !currentFolder) return [];
    return availableChildren(hostId, loc.id, flags, showHidden);
  }, [loc, currentFolder, hostId, flags, showHidden]);

  const keyword = search.trim().toLowerCase();

  const filterBySearch = (items) =>
    keyword ? items.filter((item) => item.name.toLowerCase().includes(keyword)) : items;

  const sortItems = (items) =>
    [...items].sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name, "zh-Hans-CN");
    });

  const zEntries = useMemo(() => arg.handover || [], [arg.handover]);

  const selectedNode = useMemo(() => {
    if (!selected) return null;
    if (selected.kind === "node") return nodeOf(hostId, selected.id);
    if (selected.kind === "entry")
      return nodeOf(selected.entry.host, selected.entry.id);
    return null;
  }, [selected, hostId]);

  const isCopied = (node) => {
    if (!node) return false;
    return zEntries.some(
      (entry) => entry.host === hostId && entry.id === node.id,
    );
  };

  const openNode = (node, nodeHost = hostId) => {
    if (!node) return;
    if (node.type === "folder") {
      setLoc({ kind: "folder", id: node.id });
      setSelected(null);
      return;
    }
    dispatch({
      type: "ARG_OPEN_FILE",
      payload: { host: nodeHost, id: node.id },
    });
    // 打开即算读过。标记写在数据里，组件不判断文件名。
    if (node.readFlag) {
      dispatch({
        type: "ARG_FLAG",
        payload: { flag: node.readFlag, value: true },
      });
    }
    dispatch({ type: "NOTEPAD", payload: "full" });
  };

  const copyNode = (node) => {
    if (!node || node.type === "drive") return;
    const files = node.type === "file" ? [node] : collectFiles(hostId, node.id);
    if (!files.length) {
      setNotice("没有可复制的文件。");
      return;
    }
    dispatch({
      type: "ARG_HANDOVER_ADD",
      payload: files.map((file) => ({
        host: hostId,
        id: file.id,
        name: file.name,
        path: displayPath(hostId, file.id),
      })),
    });
    setNotice(`${files.length} 个文件已复制到 ${handoverDrive.path}`);
  };

  const removeEntry = (entry) => {
    dispatch({ type: "ARG_HANDOVER_REMOVE", payload: entry });
    setNotice("已从交接盘移除。");
  };

  const chain = useMemo(() => {
    if (loc.kind === "computer") return [];
    if (loc.kind === "z") return [];
    return pathOf(hostId, loc.id);
  }, [loc, hostId]);

  useEscape(!wnapp.hide, () => {
    if (loc.kind === "folder") {
      const node = nodeOf(hostId, loc.id);
      if (node && node.parent) setLoc({ kind: "folder", id: node.parent });
      else setLoc({ kind: "computer" });
      setSelected(null);
      return;
    }
    if (loc.kind === "z") {
      setLoc({ kind: "computer" });
      setSelected(null);
    }
  });

  const up = () => {
    if (loc.kind === "folder") {
      const node = nodeOf(hostId, loc.id);
      if (node && node.parent) setLoc({ kind: "folder", id: node.parent });
      else setLoc({ kind: "computer" });
    } else {
      setLoc({ kind: "computer" });
    }
    setSelected(null);
  };

  const renderItems = () => {
    if (loc.kind === "computer") {
      return sortItems(
        filterBySearch(
          drives.map((node) => ({ ...node, type: "folder" })),
        ),
      );
    }

    if (loc.kind === "z") {
      const virtual = [
        {
          id: "z-readme",
          name: handoverReadme.name,
          type: "file",
          kind: "txt",
          description: handoverReadme.description,
          virtual: "readme",
        },
        ...zEntries.map((entry) => ({
          id: `z:${entry.host}:${entry.id}`,
          name: entry.name,
          type: "file",
          kind:
            (nodeOf(entry.host, entry.id) || {}).kind || "txt",
          description: entry.path,
          virtual: "entry",
          entry,
        })),
      ];
      return sortItems(filterBySearch(virtual));
    }

    return sortItems(filterBySearch(children));
  };

  const items = renderItems();

  return (
    <div
      className="arg-win msfiles arg-explorer floatTab dpShad"
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
        name="文件管理器"
      />

      <div className="windowScreen flex flex-col" data-dock="true">
        <div className="arg-exp-toolbar">
          <div className="arg-exp-nav">
            <button
              type="button"
              className="arg-exp-navbtn"
              aria-label="向上"
              disabled={loc.kind === "computer"}
              onClick={up}
            >
              ↑
            </button>
            <button
              type="button"
              className="arg-exp-navbtn"
              aria-label="此电脑"
              onClick={() => {
                setLoc({ kind: "computer" });
                setSelected(null);
              }}
            >
              ⟳
            </button>
          </div>

          <div className="arg-exp-path">
            <button
              type="button"
              className="arg-exp-crumb"
              onClick={() => {
                setLoc({ kind: "computer" });
                setSelected(null);
              }}
            >
              此电脑
            </button>
            {loc.kind === "z" ? (
              <>
                <span className="arg-exp-sep">›</span>
                <button
                  type="button"
                  className="arg-exp-crumb"
                  data-active="true"
                >
                  {handoverDrive.label}
                </button>
                <span className="arg-exp-sep">›</span>
                <button
                  type="button"
                  className="arg-exp-crumb"
                  data-active="true"
                >
                  交接
                </button>
              </>
            ) : null}
            {chain.map((node, index) => (
              <React.Fragment key={node.id}>
                <span className="arg-exp-sep">›</span>
                <button
                  type="button"
                  className="arg-exp-crumb"
                  data-active={index === chain.length - 1 ? "true" : "false"}
                  onClick={() => {
                    setLoc({ kind: "folder", id: node.id });
                    setSelected(null);
                  }}
                >
                  {index === 0 ? driveLabel(node) : node.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          <div className="arg-exp-search">
            <span className="arg-exp-search-icon">⌕</span>
            <input
              type="text"
              value={search}
              placeholder="搜索"
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <button
            type="button"
            className="arg-exp-hidden-toggle"
            data-on={showHidden ? "true" : "false"}
            aria-pressed={showHidden}
            title="显示隐藏项目"
            onClick={() => setShowHidden((value) => !value)}
          >
            {showHidden ? "隐藏项目：开" : "隐藏项目：关"}
          </button>
        </div>

        <div className="arg-exp-main">
          <aside className="arg-exp-side">
            <button
              type="button"
              className="arg-exp-side-item"
              data-active={loc.kind === "computer" ? "true" : "false"}
              onClick={() => {
                setLoc({ kind: "computer" });
                setSelected(null);
              }}
            >
              <FileIcon kind="drive" size={15} />
              <span>此电脑</span>
            </button>

            {drives.map((node) => (
              <button
                key={node.id}
                type="button"
                className="arg-exp-side-item"
                data-active={
                  loc.kind === "folder" && loc.id === node.id ? "true" : "false"
                }
                onClick={() => {
                  setLoc({ kind: "folder", id: node.id });
                  setSelected(null);
                }}
              >
                <FileIcon kind="drive" size={15} />
                <span>{driveLabel(node)}</span>
              </button>
            ))}

            {hasHandover ? (
              <>
                <div className="arg-exp-side-title">网络位置</div>
                <button
                  type="button"
                  className="arg-exp-side-item"
                  data-active={loc.kind === "z" ? "true" : "false"}
                  onClick={() => {
                    setLoc({ kind: "z" });
                    setSelected(null);
                  }}
                >
                  <FileIcon kind="network" size={15} />
                  <span>{handoverDrive.label}</span>
                </button>
              </>
            ) : null}

            <div className="arg-exp-side-host">
              {machine.hostname} · {machine.user}
            </div>
          </aside>

          <section className="arg-exp-files">
            {items.length ? (
              <div className="arg-exp-grid">
                {items.map((item) => {
                  const virtual = item.virtual;
                  const node = virtual ? null : item;
                  const isSelected =
                    (selected &&
                      selected.kind === "node" &&
                      selected.id === item.id) ||
                    (selected &&
                      selected.kind === "readme" &&
                      virtual === "readme") ||
                    (selected &&
                      selected.kind === "entry" &&
                      virtual === "entry" &&
                      selected.entry.host === item.entry.host &&
                      selected.entry.id === item.entry.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className="arg-exp-item"
                      data-selected={isSelected ? "true" : "false"}
                      title={item.name}
                      onClick={() => {
                        if (virtual === "readme") {
                          setSelected({ kind: "readme" });
                          return;
                        }
                        if (virtual === "entry") {
                          setSelected({ kind: "entry", entry: item.entry });
                          return;
                        }
                        setSelected({ kind: "node", id: item.id });
                      }}
                      onDoubleClick={() => {
                        if (virtual === "readme") {
                          setSelected({ kind: "readme" });
                          return;
                        }
                        if (virtual === "entry") {
                          openNode(
                            nodeOf(item.entry.host, item.entry.id),
                            item.entry.host,
                          );
                          return;
                        }
                        openNode(node);
                      }}
                    >
                      <span
                        className="arg-exp-item-icon"
                        data-kind={kindOf(node)}
                      >
                        <FileIcon kind={kindOf(node)} size={30} />
                      </span>
                      <span className="arg-exp-name">{item.name}</span>
                      <span className="arg-exp-item-meta">
                        {virtual === "entry"
                          ? "已复制"
                          : item.type === "folder"
                            ? `${item.children.length} 个项目`
                            : item.description || ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="arg-exp-empty">
                {loc.kind === "z"
                  ? "交接盘里还没有文件。"
                  : "此文件夹为空，或项目已被隐藏。"}
              </div>
            )}

            {notice ? <div className="arg-exp-hint">{notice}</div> : null}

            <div className="arg-exp-status">
              <span>
                {loc.kind === "computer"
                  ? `${drives.length} 个磁盘`
                  : `${items.length} 个项目`}
              </span>
              <span>
                {loc.kind === "z"
                  ? handoverDrive.path
                  : currentFolder
                    ? displayPath(hostId, currentFolder.id)
                    : "此电脑"}
              </span>
            </div>
          </section>

          <div className="arg-exp-actions">
            <span className="arg-exp-actions-name">
              {selected && selected.kind === "readme"
                ? handoverReadme.name
                : selectedNode
                  ? selectedNode.name
                  : ""}
            </span>

            {selected && selected.kind === "readme" ? (
              <span className="arg-exp-actions-meta">
                {handoverReadme.description}
              </span>
            ) : null}

            {selectedNode && selected.kind === "node" ? (
              <span className="arg-exp-actions-meta">
                {selectedNode.type === "folder"
                  ? `${selectedNode.children.length} 个项目`
                  : selectedNode.description || ""}
              </span>
            ) : null}

            {selectedNode && selected.kind === "entry" ? (
              <span className="arg-exp-actions-meta">
                交接盘 · {displayPath(selected.entry.host, selectedNode.id)}
              </span>
            ) : null}

            <div className="arg-exp-actions-btns">
              {selectedNode &&
              selectedNode.type === "file" &&
              selected.kind === "node" ? (
                <button
                  type="button"
                  className="arg-exp-copy"
                  onClick={() => copyNode(selectedNode)}
                  disabled={isCopied(selectedNode)}
                >
                  {isCopied(selectedNode) ? "已在交接盘" : "复制到交接盘"}
                </button>
              ) : null}

              {selectedNode &&
              selectedNode.type === "folder" &&
              selected.kind === "node" &&
              !(selectedNode.info && selectedNode.info.icon === "drive") ? (
                <button
                  type="button"
                  className="arg-exp-copy"
                  onClick={() => copyNode(selectedNode)}
                >
                  复制文件夹到交接盘
                </button>
              ) : null}

              {selectedNode &&
              selectedNode.type === "folder" &&
              selected.kind === "node" &&
              selectedNode.info &&
              selectedNode.info.icon === "drive" ? (
                <span className="arg-exp-chip">磁盘</span>
              ) : null}

              {selected && selected.kind === "entry" ? (
                <button
                  type="button"
                  className="arg-exp-copy arg-exp-copy-remove"
                  onClick={() => removeEntry(selected.entry)}
                >
                  从交接盘移除
                </button>
              ) : null}

              {selectedNode && selectedNode.type === "file" ? (
                <button
                  type="button"
                  className="arg-exp-open-file"
                  onClick={() =>
                    openNode(
                      selectedNode,
                      selected.kind === "entry"
                        ? selected.entry.host
                        : hostId,
                    )
                  }
                >
                  打开
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Explorer };
export default Explorer;
