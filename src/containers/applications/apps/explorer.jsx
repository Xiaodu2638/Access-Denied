import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ToolBar } from "../../../utils/general";
import { ContentBlocks } from "../../../components/arg/ContentBlocks";
import { useEscape } from "../../../utils/arg";
import {
  canAccess,
  contentOf,
  displayPath,
  fileSystem,
  pathOf,
  projectId,
  projectName,
} from "../../../data/arg/files";
import "./assets/arg-explorer.scss";

// 文件管理器：linche-agent 项目浏览器。
// 只读取 src/data/arg/files.js，不在这里写任何剧情文案。
// 双击文件时按 kind 打开对应应用；其余文件只在右侧只读预览。

const icons = {
  folder: (
    <>
      <path d="M3 6.5h6.2l1.4 1.6H21v9.4a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" />
      <path d="M3 6.5V5.4c0-.8.7-1.4 1.5-1.4h4.2l1.5 1.7H18.5c.8 0 1.5.6 1.5 1.4v.4z" />
    </>
  ),
  doc: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
    </>
  ),
  code: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
      <path d="M10.4 12.2 8.6 14l1.8 1.8M13.6 12.2 15.4 14l-1.8 1.8" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="8" r="3.4" />
      <path d="m10.4 10.4 8 8M15.6 15.6l1.8-1.8M17.4 17.4l1.8-1.8" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="10" rx="1.6" />
      <path d="M8 10V7.4a4 4 0 0 1 8 0V10" />
    </>
  ),
};

const FileIcon = ({ type, kind, locked, size = 34 }) => (
  <svg
    className="arg-file-icon"
    data-type={type}
    data-kind={kind}
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
      {icons[locked ? "lock" : kind] || icons[type] || icons.doc}
    </g>
  </svg>
);

const iconKindOf = (node) => {
  if (node.type === "folder") return "folder";
  if (node.kind === "markdown" || node.kind === "json") return "doc";
  if (node.kind === "javascript") return "code";
  if (node.kind === "key") return "key";
  return "doc";
};

const sizeLabel = (node) =>
  node.type === "folder"
    ? `${node.children.length} 个项目`
    : node.description || "只读";

const Explorer = () => {
  const wnapp = useSelector((state) => state.apps.explorer);
  const flags = useSelector((state) => state.arg.flags);
  const dispatch = useDispatch();

  // 结局之后仓库被归档，目录内容不再存在。
  const archived = flags.archived === true;

  const [cwd, setCwd] = useState(projectId);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  // 默认关闭，和 Windows 一样：带点的文件不显示。
  const [showHidden, setShowHidden] = useState(false);

  const current = fileSystem.nodes[cwd] || fileSystem.nodes[projectId];
  const selected = selectedId ? fileSystem.nodes[selectedId] : null;

  // 在文件管理器里读到 .session 也算读过，dump 的最后一行才会出现。
  useEffect(() => {
    if (!selected || selected.name !== ".session") return;
    if (flags.readSession === true) return;
    dispatch({
      type: "ARG_FLAG",
      payload: { flag: "readSession", value: true },
    });
  }, [selected, flags.readSession, dispatch]);

  const items = useMemo(() => {
    if (!current) return [];
    const keyword = search.trim().toLowerCase();

    // 过早公开之后，仓库目录被归档：内容全部消失。
    if (archived && current.id === projectId) return [];

    return current.children
      .map((id) => fileSystem.nodes[id])
      .filter((node) => !node.hidden || showHidden)
      .filter((node) => !keyword || node.name.toLowerCase().includes(keyword))
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
        return a.name.localeCompare(b.name, "zh-Hans-CN");
      });
  }, [current, search, showHidden, archived]);

  const select = (node) => {
    if (node) setSelectedId(node.id);
  };

  const enter = (node) => {
    if (!node || node.type !== "folder") return;
    if (!canAccess(node, flags)) {
      setSelectedId(node.id);
      return;
    }
    setCwd(node.id);
    setSelectedId(null);
  };

  const launch = (node) => {
    if (!node || node.type !== "file") return;
    if (node.info && node.info.kind === "diary") {
      dispatch({ type: "NOTEPAD", payload: "full" });
    } else if (node.info && node.info.kind === "dontrun") {
      dispatch({ type: "DONTRUN", payload: "full" });
    }
  };

  const chain = pathOf(cwd);
  const locked = selected && !canAccess(selected, flags);

  // Esc 返回上一级；已经在项目根目录时不做任何事。
  useEscape(!wnapp.hide, () => {
    if (current && current.parent) {
      setCwd(current.parent);
      setSelectedId(null);
    }
  });

  const previewContent =
    selected && selected.type === "file" ? contentOf(selected, flags) : null;

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
              disabled={!current || !current.parent}
              onClick={() => {
                if (current && current.parent) {
                  setCwd(current.parent);
                  setSelectedId(null);
                }
              }}
            >
              ↑
            </button>
            <button
              type="button"
              className="arg-exp-navbtn"
              aria-label="回到项目"
              onClick={() => {
                setCwd(projectId);
                setSelectedId(null);
              }}
            >
              ⟳
            </button>
          </div>

          <div className="arg-exp-path" title={displayPath(cwd)}>
            {chain.map((node, index) => (
              <React.Fragment key={node.id}>
                {index > 0 ? <span className="arg-exp-sep">›</span> : null}
                <button
                  type="button"
                  className="arg-exp-crumb"
                  onClick={() => {
                    setCwd(node.id);
                    setSelectedId(null);
                  }}
                >
                  {index === 0 ? "%user%" : node.name}
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
            <div className="arg-exp-side-title">快速访问</div>
            <button
              type="button"
              className="arg-exp-side-item"
              data-active={cwd === fileSystem.rootId ? "true" : "false"}
              onClick={() => {
                setCwd(fileSystem.rootId);
                setSelectedId(null);
              }}
            >
              <FileIcon type="folder" size={17} />
              <span>{fileSystem.nodes[fileSystem.rootId].name}</span>
            </button>
            <button
              type="button"
              className="arg-exp-side-item"
              data-active={
                current && current.name === "Desktop" ? "true" : "false"
              }
              onClick={() => {
                setCwd(`${fileSystem.rootId}/Desktop`);
                setSelectedId(null);
              }}
            >
              <FileIcon type="folder" size={17} />
              <span>桌面</span>
            </button>
            <button
              type="button"
              className="arg-exp-side-item"
              data-active={
                current && current.name === "Documents" ? "true" : "false"
              }
              onClick={() => {
                setCwd(`${fileSystem.rootId}/Documents`);
                setSelectedId(null);
              }}
            >
              <FileIcon type="folder" size={17} />
              <span>文档</span>
            </button>
            <button
              type="button"
              className="arg-exp-side-item"
              data-active={cwd === projectId ? "true" : "false"}
              onClick={() => {
                setCwd(projectId);
                setSelectedId(null);
              }}
            >
              <FileIcon type="folder" size={17} />
              <span>{projectName}</span>
            </button>

            <div className="arg-exp-side-title">此电脑</div>
            <div className="arg-exp-side-item" data-disabled="true">
              <FileIcon type="doc" size={17} />
              <span>本地磁盘 (C:)</span>
            </div>
            <div className="arg-exp-side-item" data-disabled="true">
              <FileIcon type="doc" size={17} />
              <span>数据 (D:)</span>
            </div>
          </aside>

          <section className="arg-exp-files">
            <div className="arg-exp-grid">
              {items.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  className="arg-exp-item"
                  data-active={selectedId === node.id ? "true" : "false"}
                  data-locked={
                    node.locked && !canAccess(node, flags) ? "true" : "false"
                  }
                  onClick={() => select(node)}
                  onDoubleClick={() =>
                    node.type === "folder" ? enter(node) : launch(node)
                  }
                  title={node.name}
                >
                  <FileIcon
                    type={node.type}
                    kind={iconKindOf(node)}
                    locked={node.locked && !canAccess(node, flags)}
                    size={36}
                  />
                  <span className="arg-exp-name">{node.name}</span>
                </button>
              ))}
            </div>

            {items.length === 0 ? (
              <div className="arg-exp-empty">
                {archived && current && current.id === projectId
                  ? "该仓库已被请求归档。所有文件已移出当前会话。"
                  : "此文件夹为空。"}
              </div>
            ) : null}

            <div className="arg-exp-status">
              <span>{items.length} 个项目</span>
              <span>{displayPath(cwd)}</span>
            </div>
          </section>

          <aside className="arg-exp-preview">
            {selected ? (
              <>
                <header className="arg-exp-preview-head">
                  <FileIcon
                    type={selected.type}
                    kind={iconKindOf(selected)}
                    locked={locked}
                    size={22}
                  />
                  <div className="arg-exp-preview-title">
                    <div>{selected.name}</div>
                    <div className="arg-exp-preview-meta">
                      {locked ? "已加密" : sizeLabel(selected)}
                    </div>
                  </div>
                </header>

                <div className="arg-exp-preview-body win11Scroll">
                  {locked ? (
                    <div className="arg-exp-locked">
                      <FileIcon type="lock" kind="lock" size={30} />
                      <div>此文件夹已加密。</div>
                      <div>{selected.description}</div>
                    </div>
                  ) : selected.type === "folder" ? (
                    <div className="arg-exp-folderinfo">
                      <div className="arg-exp-folderinfo-row">
                        <span>名称</span>
                        <b>{selected.name}</b>
                      </div>
                      <div className="arg-exp-folderinfo-row">
                        <span>包含</span>
                        <b>{selected.children.length} 个项目</b>
                      </div>
                      <div className="arg-exp-folderinfo-row">
                        <span>位置</span>
                        <b>{displayPath(selected.id)}</b>
                      </div>
                      {selected.description ? (
                        <div className="arg-exp-folderinfo-note">
                          {selected.description}
                        </div>
                      ) : null}
                      <button
                        type="button"
                        className="arg-exp-open-folder"
                        onClick={() => enter(selected)}
                      >
                        打开文件夹
                      </button>
                    </div>
                  ) : previewContent ? (
                    <div className="arg-exp-doc">
                      <ContentBlocks blocks={previewContent} />
                      {selected.info && selected.info.kind === "diary" ? (
                        <button
                          type="button"
                          className="arg-exp-open-file"
                          onClick={() => launch(selected)}
                        >
                          用记事本打开
                        </button>
                      ) : null}
                      {selected.info && selected.info.kind === "dontrun" ? (
                        <button
                          type="button"
                          className="arg-exp-open-file"
                          onClick={() => launch(selected)}
                        >
                          查看脚本
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    <div className="arg-exp-doc">
                      {selected.info && selected.info.kind === "diary" ? (
                        <>
                          <div className="arg-exp-hint">文本文件。</div>
                          <button
                            type="button"
                            className="arg-exp-open-file"
                            onClick={() => launch(selected)}
                          >
                            用记事本打开
                          </button>
                        </>
                      ) : null}
                      {selected.info && selected.info.kind === "dontrun" ? (
                        <>
                          <div className="arg-exp-hint">JavaScript。</div>
                          <button
                            type="button"
                            className="arg-exp-open-file"
                            onClick={() => launch(selected)}
                          >
                            查看脚本
                          </button>
                        </>
                      ) : null}
                      {!selected.info ||
                      !["diary", "dontrun"].includes(selected.info.kind) ? (
                        <div className="arg-exp-hint">无预览。</div>
                      ) : null}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="arg-exp-preview-empty"></div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Explorer;
export { Explorer };
