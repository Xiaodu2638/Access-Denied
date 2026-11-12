import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ToolBar } from "../../../utils/general";
import { ContentBlocks } from "../../../components/arg/ContentBlocks";
import {
  bookmarks,
  browserMeta,
  dumpBlocks,
  dumpReady,
  listingBlocks,
  pages,
  resolvePage,
} from "../../../data/arg/browser";
import "./assets/arg-browser.scss";

// 伪浏览器：只访问 src/data/arg/browser.js 里定义的内部页面。
// 没有 iframe，也不发任何外部请求；地址栏只接受预设地址和别名。

const openPage = (id) => pages[id] || pages[browserMeta.home] || pages.github;

// 动态页面：目录列表和 dump 的内容随进度变化。
const blocksOf = (page, flags) => {
  if (page.dynamic === "listing") return listingBlocks(flags);
  if (page.dynamic === "dump") return dumpBlocks(flags);
  return page.blocks;
};

const PageBody = ({ page, flags, onNavigate, onEnding }) => {
  if (!page) return null;

  // 没有 buttons，没有「进入深处」。dump 要么完整，要么还是黑的。
  const ready = page.ending && dumpReady(flags);
  const partial = page.ending && !dumpReady(flags);

  const badge =
    page.kind === "dump"
      ? "session"
      : page.kind === "store"
        ? "unknown"
        : "archive";

  return (
    <>
      <div className="arg-web-head">
        <div className="arg-web-favicon" data-kind={page.kind}>
          {page.kind === "dump" || page.kind === "store" ? "!" : "in"}
        </div>
        <div className="arg-web-url">{page.address}</div>
        <div className="arg-web-badge" data-kind={page.kind}>
          {badge}
        </div>
      </div>

      <div className="arg-web-doc">
        <ContentBlocks blocks={blocksOf(page, flags)} />

        {page.links && page.links.length ? (
          <div className="arg-web-links">
            {page.links.map((link) => (
              <button
                key={link.label}
                type="button"
                className="arg-web-link"
                data-danger={link.danger ? "true" : "false"}
                onClick={() => onNavigate(link.page)}
              >
                <span>{link.label}</span>
                <span className="arg-web-link-arrow">›</span>
              </button>
            ))}
          </div>
        ) : null}

        {partial ? (
          <div className="arg-web-ending">
            <div className="arg-web-ending-label">
              这份 dump 还有没恢复的段落。
            </div>
            <div className="arg-web-ending-actions">
              <button
                type="button"
                className="arg-btn-danger"
                onClick={() => onEnding("premature")}
              >
                提交
              </button>
            </div>
          </div>
        ) : null}

        {ready ? (
          <div className="arg-web-ending">
            <div className="arg-web-ending-label">
              现在你可以决定怎么处理它。
            </div>
            <div className="arg-web-ending-actions">
              <button
                type="button"
                className="arg-btn-danger"
                onClick={() => onEnding("publish")}
              >
                公开
              </button>
              <button
                type="button"
                className="arg-btn-ghost"
                onClick={() => onEnding("silence")}
              >
                什么都不做
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export const EdgeMenu = () => {
  const wnapp = useSelector((state) => state.apps.edge);
  const browserPage = useSelector((state) => state.arg.browserPage);
  const flags = useSelector((state) => state.arg.flags);
  const dispatch = useDispatch();

  const [pageId, setPageId] = useState(browserPage || browserMeta.home);
  const [address, setAddress] = useState(openPage(pageId).address);
  const [error, setError] = useState("");

  const page = useMemo(() => openPage(pageId), [pageId]);

  // 终端 open <page> 会改 state.arg.browserPage，这里跟随。
  useEffect(() => {
    if (!browserPage) return;
    setPageId(browserPage);
    setAddress(openPage(browserPage).address);
    setError("");
  }, [browserPage]);

  // 只有 dump 的所有段落都恢复过，才算真正看过它。
  // 残缺状态下进去只是一页黑块，不该记成「看过」。
  useEffect(() => {
    if (page.kind !== "dump") return;
    if (!dumpReady(flags)) return;
    dispatch({ type: "ARG_FLAG", payload: { flag: "readDump", value: true } });
  }, [page.kind, flags, dispatch]);

  const go = (id) => {
    const next = openPage(id);
    setPageId(next.id);
    setAddress(next.address);
    setError("");
    dispatch({ type: "ARG_BROWSER", payload: next.id });
  };

  const submit = (event) => {
    event.preventDefault();
    const id = resolvePage(address);

    if (!id) {
      setError(browserMeta.notFound.blocks[0].text);
      return;
    }

    go(id);
  };

  const ending = (choice) => {
    dispatch({ type: "ARG_ENDING", payload: choice });
  };

  return (
    <div
      className="arg-win edgeBrowser arg-browser floatTab dpShad"
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
        name="浏览器"
        float
      />

      <div className="windowScreen flex flex-col">
        <div className="arg-browser-tabs">
          <div className="arg-browser-tab" data-active="true">
            <span className="arg-browser-tab-fav" data-kind={page.kind}></span>
            <span className="arg-browser-tab-title">{page.title}</span>
            <button
              type="button"
              className="arg-browser-tab-close"
              aria-label="关闭浏览器"
              onClick={() => dispatch({ type: wnapp.action, payload: "close" })}
            >
              ×
            </button>
          </div>
        </div>

        <div className="arg-browser-bar">
          <button type="button" className="arg-browser-nav" disabled>
            ←
          </button>
          <button type="button" className="arg-browser-nav" disabled>
            →
          </button>
          <button
            type="button"
            className="arg-browser-nav"
            aria-label="刷新"
            onClick={() => setError("")}
          >
            ⟳
          </button>

          <form className="arg-browser-addr" onSubmit={submit}>
            <span className="arg-browser-lock" data-kind={page.kind}>
              {page.kind === "web" ? "⌂" : "!"}
            </span>
            <input
              type="text"
              value={address}
              spellCheck="false"
              autoComplete="off"
              onChange={(event) => setAddress(event.target.value)}
              aria-label="地址栏"
            />
          </form>
        </div>

        <div className="arg-browser-marks">
          {bookmarks.map((mark) => (
            <button
              key={mark.page}
              type="button"
              className="arg-browser-mark"
              data-active={mark.page === pageId ? "true" : "false"}
              onClick={() => go(mark.page)}
            >
              {mark.label}
            </button>
          ))}
        </div>

        <div className="arg-browser-view win11Scroll">
          {error ? (
            <div className="arg-browser-error">
              <div className="arg-browser-error-code">无法访问此页面</div>
              <div className="arg-browser-error-text">{error}</div>
              <div className="arg-browser-error-detail">
                检查地址，或从书签里选择内部页面。
              </div>
            </div>
          ) : (
            <PageBody
              page={page}
              flags={flags}
              onNavigate={go}
              onEnding={ending}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EdgeMenu;
