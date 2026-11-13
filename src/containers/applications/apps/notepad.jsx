import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { ToolBar } from "../../../utils/general";
import { ContentBlocks } from "../../../components/arg/ContentBlocks";
import { Plate } from "../../../components/arg/Plates";
import {
  contentOf,
  displayPath,
  nodeOf,
} from "../../../data/arg/files";
import { machines } from "../../../data/arg/config";
import "./assets/arg-apps.scss";

// 记事本：远程资产上的通用只读文本查看器。
// 打开哪个文件由 state.arg.openFile 决定（{ host, id }），
// 文件管理器双击、终端 type 都只改这个状态，不自己做渲染。
export const Notepad = () => {
  const wnapp = useSelector((state) => state.apps.notepad);
  const arg = useSelector((state) => state.arg);
  const openFile = arg.openFile;
  const flags = arg.flags || {};

  const hostId = (openFile && openFile.host) || arg.host || "chenmo";
  const node =
    openFile && openFile.id ? nodeOf(hostId, openFile.id) : null;
  const blocks = useMemo(
    () => (node ? contentOf(node, flags) : null),
    [node, flags],
  );

  const machine = machines[hostId] || machines.chenmo;
  const path = node ? displayPath(hostId, node.id) : "";

  const lineCount = blocks
    ? blocks.reduce((sum, block) => {
        if (!block.text) return sum;
        return sum + String(block.text).split("\n").length;
      }, 0)
    : 0;

  return (
    <div
      className="arg-win notepad arg-diary floatTab dpShad"
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
        name="记事本"
      />

      <div className="windowScreen flex flex-col" data-dock="true">
        <div className="arg-diary-tabbar">
          <div className="arg-diary-tab" data-active="true">
            <img src="img/icon/notepad.png" alt="" />
            <span>{node ? node.name : "无标题"}</span>
            <span className="arg-diary-tab-close">×</span>
          </div>
          <div className="arg-diary-tab-add">+</div>
        </div>

        <div className="arg-diary-menubar">
          <span>文件</span>
          <span>编辑</span>
          <span>查看</span>
          <span>帮助</span>
        </div>

        <div className="arg-diary-body win11Scroll">
          {node ? (
            <article className="arg-diary-doc">
              <header className="arg-diary-head">
                <h1>{node.name}</h1>
                <div className="arg-diary-byline">
                  {path} · {machine.hostname}
                </div>
              </header>

              {node.kind === "photo" && node.plate ? (
                <div className="arg-photo">
                  <Plate variant={node.plate} />
                  <span className="arg-photo-caption">
                    {node.caption || node.name}
                  </span>
                </div>
              ) : null}

              {blocks ? (
                <ContentBlocks blocks={blocks} />
              ) : (
                <div className="arg-diary-empty">
                  这个文件没有可显示的文本内容。
                </div>
              )}
            </article>
          ) : (
            <div className="arg-diary-empty">
              没有打开的文件。在文件管理器里双击一个文件。
            </div>
          )}
        </div>

        <div className="arg-diary-status">
          <span>{node ? path : "无文件"}</span>
          <span>{node && node.description ? node.description : ""}</span>
          <span>UTF-8</span>
          <span>{lineCount} 行</span>
        </div>
      </div>
    </div>
  );
};

export default Notepad;
