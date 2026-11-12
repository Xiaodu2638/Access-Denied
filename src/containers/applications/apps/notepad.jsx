import React from "react";
import { useSelector } from "react-redux";
import { ToolBar } from "../../../utils/general";
import { ContentBlocks } from "../../../components/arg/ContentBlocks";
import { diaryMeta, visibleDiaryEntries } from "../../../data/arg";
import "./assets/arg-apps.scss";

// 记事本：只渲染已经解锁的日记页。
// 未解锁的页不会以“上锁”的形式出现，避免把玩家的注意力引到解锁条件上。
export const Notepad = () => {
  const wnapp = useSelector((state) => state.apps.notepad);
  const progress = useSelector((state) => state.arg);
  const entries = visibleDiaryEntries(progress);
  const corrupted = progress.flags && progress.flags.corrupted;

  const lineCount = entries.reduce(
    (sum, entry) =>
      sum +
      (entry.blocks ? entry.blocks.length : 0) +
      (corrupted && entry.corruptedBlocks ? entry.corruptedBlocks.length : 0),
    0,
  );

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
        name={diaryMeta.title}
      />

      <div className="windowScreen flex flex-col" data-dock="true">
        <div className="arg-diary-tabbar">
          <div className="arg-diary-tab" data-active="true">
            <img src="img/icon/notepad.png" alt="" />
            <span>{diaryMeta.fileName}</span>
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
          {entries.length ? (
            <article className="arg-diary-doc">
              <header className="arg-diary-head">
                <h1>{diaryMeta.title}</h1>
                <div className="arg-diary-byline">
                  {diaryMeta.author} · {diaryMeta.path}
                </div>
              </header>

              {entries.map((entry) => (
                <section key={entry.id} className="arg-diary-entry">
                  <div className="arg-diary-date">
                    {corrupted && entry.corruptedDate
                      ? entry.corruptedDate
                      : entry.date}
                  </div>
                  <h2 className="arg-diary-title">{entry.title}</h2>
                  <ContentBlocks
                    blocks={
                      corrupted && entry.corruptedBlocks
                        ? entry.corruptedBlocks
                        : entry.blocks
                    }
                  />
                </section>
              ))}
            </article>
          ) : (
            <div className="arg-diary-empty">{diaryMeta.emptyText}</div>
          )}
        </div>

        <div className="arg-diary-status">
          <span>第 1 行，第 1 列</span>
          <span>{lineCount} 段</span>
          <span>UTF-8</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

export default Notepad;
