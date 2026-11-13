import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ToolBar } from "../../../utils/general";
import { ContentBlocks } from "../../../components/arg/ContentBlocks";
import {
  browserMeta,
  draftState,
  mailboxes,
  pagesFor,
  resolvePage,
} from "../../../data/arg/browser";
import { timeline } from "../../../data/arg/config";
import "./assets/arg-browser.scss";

// 伪浏览器：只访问 src/data/arg/browser.js 里定义的内部页面。
// 没有 iframe，也不发任何外部请求；地址栏只接受预设地址和别名。
// 网页邮箱里的草稿是剧情的一部分：陈默写好了，但没发出去。
// 发不发由玩家自己决定 —— 这里没有任何计时器替他按。

const bookmarkList = [
  { id: "oa", label: "院 OA" },
  { id: "mail", label: "院邮件" },
  { id: "asset", label: "资产平台" },
  { id: "news", label: "本地新闻" },
];

// ---------------------------------------------------------------------------
// 网页邮箱
// ---------------------------------------------------------------------------

const MailApp = ({ hostId, progress }) => {
  const dispatch = useDispatch();
  const box = mailboxes[hostId] || mailboxes.chenmo;
  const draft = box.draft;
  const [selectedId, setSelectedId] = useState(
    box.messages[0] ? box.messages[0].id : draft ? draft.id : null,
  );

  const state = draftState(progress);

  const messages = draft
    ? [{ ...draft, isDraft: true }, ...box.messages]
    : box.messages;

  const selected = messages.find((item) => item.id === selectedId) || messages[0];

  // 打开草稿只记录「看到过」，不启动计时。
  useEffect(() => {
    if (!selected || !selected.isDraft) return;
    dispatch({ type: "ARG_MAIL_OPEN" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected && selected.id]);

  const send = () => {
    dispatch({ type: "ARG_MAIL_SENT" });
  };

  const discard = () => {
    dispatch({ type: "ARG_MAIL_DISCARD" });
  };

  const draftBanner = () => {
    if (!draft) return null;

    if (state === "destroyed") {
      return (
        <div className="arg-mail-draft" data-state="destroyed">
          <span className="arg-mail-draft-label">草稿</span>
          <span className="arg-mail-draft-text">
            本机已被擦除，这封草稿不再存在。
          </span>
        </div>
      );
    }

    if (state === "sent") {
      return (
        <div className="arg-mail-draft" data-state="sent">
          <span className="arg-mail-draft-label">已发送</span>
          <span className="arg-mail-draft-text">
            这封邮件已经离开这台机器。
          </span>
        </div>
      );
    }

    if (state === "discarded") {
      return (
        <div className="arg-mail-draft" data-state="discarded">
          <span className="arg-mail-draft-label">草稿</span>
          <span className="arg-mail-draft-text">这封草稿已被丢弃。</span>
        </div>
      );
    }

    return (
      <div className="arg-mail-draft" data-state="draft">
        <span className="arg-mail-draft-label">草稿</span>
        <span className="arg-mail-draft-text">
          定时发送 {timeline.mailScheduled.slice(11)} 未执行
        </span>
        <div className="arg-mail-draft-actions">
          <button type="button" onClick={send}>
            发送
          </button>
          <button
            type="button"
            className="arg-mail-draft-ghost"
            onClick={discard}
          >
            丢弃
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="arg-webmail">
      <aside className="arg-webmail-side">
        <div className="arg-webmail-account">{box.account}</div>
        <div className="arg-webmail-folder" data-active="true">
          收件箱
        </div>
        <div className="arg-webmail-folder">已发送</div>
        <div className="arg-webmail-folder">
          草稿{draft ? <span className="arg-webmail-count">1</span> : null}
        </div>
        <div className="arg-webmail-folder">垃圾邮件</div>
      </aside>

      <section className="arg-webmail-list">
        {messages.map((item) => (
          <button
            key={item.id}
            type="button"
            className="arg-webmail-item"
            data-active={selected && selected.id === item.id ? "true" : "false"}
            onDoubleClick={() => setSelectedId(item.id)}
            onClick={() => setSelectedId(item.id)}
          >
            <div className="arg-webmail-item-top">
              <span className="arg-webmail-from">
                {item.isDraft ? `草稿 · ${item.toName}` : item.fromName}
              </span>
              <span className="arg-webmail-time">{item.time}</span>
            </div>
            <div className="arg-webmail-subject">
              {item.isDraft ? `（草稿）${item.subject}` : item.subject}
            </div>
          </button>
        ))}
      </section>

      {selected ? (
        <article className="arg-webmail-read">
          <header className="arg-webmail-head">
            <h2>{selected.subject}</h2>
            <div className="arg-webmail-meta">
              {selected.isDraft
                ? `收件人 ${selected.toName} <${selected.to}>`
                : `${selected.fromName} <${selected.from}> · ${selected.time}`}
            </div>
          </header>

          {selected.isDraft ? draftBanner() : null}

          <div className="arg-webmail-body win11Scroll">
            <ContentBlocks blocks={selected.blocks} />

            {selected.attachments && selected.attachments.length ? (
              <div className="arg-webmail-attach">
                <div className="arg-webmail-attach-title">
                  {selected.attachments.length} 个附件
                </div>
                <div className="arg-webmail-attach-list">
                  {selected.attachments.map((name) => (
                    <span key={name} className="arg-webmail-attach-item">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </article>
      ) : null}
    </div>
  );
};

// ---------------------------------------------------------------------------
// 浏览器
// ---------------------------------------------------------------------------

export const EdgeMenu = () => {
  const wnapp = useSelector((state) => state.apps.edge);
  const arg = useSelector((state) => state.arg);
  const dispatch = useDispatch();

  const hostId = arg.host || "chenmo";
  const pages = useMemo(() => pagesFor(hostId, arg), [hostId, arg]);
  const browserPage = arg.browserPage;

  const [pageId, setPageId] = useState(browserPage || browserMeta.home);
  const [typing, setTyping] = useState("");
  const [error, setError] = useState("");

  const page = pages[pageId] || pages[browserMeta.home];

  // 终端 open <地址> 会改 state.arg.browserPage，这里跟随。
  useEffect(() => {
    if (!browserPage) return;
    if (!pages[browserPage]) return;
    setPageId(browserPage);
    setTyping("");
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [browserPage, hostId]);

  const go = (id) => {
    if (!pages[id]) return;
    setPageId(id);
    setTyping("");
    setError("");
    dispatch({ type: "ARG_BROWSER", payload: id });
  };

  const submit = (event) => {
    event.preventDefault();
    const value = typing.trim();
    if (!value) return;
    const hit = resolvePage(hostId, arg, value);
    if (!hit) {
      setError(browserMeta.notFound.blocks[0].text);
      return;
    }
    go(hit.id);
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
          <button
            type="button"
            className="arg-browser-nav"
            aria-label="回到首页"
            onClick={() => go(browserMeta.home)}
          >
            ←
          </button>
          <button type="button" className="arg-browser-nav" disabled>
            →
          </button>
          <button
            type="button"
            className="arg-browser-nav"
            aria-label="刷新"
            onClick={() => {
              setTyping("");
              setError("");
            }}
          >
            ⟳
          </button>

          <form className="arg-browser-addr" onSubmit={submit}>
            <span className="arg-browser-lock" data-kind={page.kind}>
              {page.kind === "mail" ? "✉" : "⌂"}
            </span>
            <input
              type="text"
              value={typing || page.address}
              spellCheck="false"
              autoComplete="off"
              onChange={(event) => {
                setTyping(event.target.value);
                setError("");
              }}
              aria-label="地址栏"
            />
          </form>
        </div>

        <div className="arg-browser-marks">
          {bookmarkList.map((mark) => (
            <button
              key={mark.id}
              type="button"
              className="arg-browser-mark"
              data-active={mark.id === pageId ? "true" : "false"}
              onClick={() => go(mark.id)}
            >
              {mark.label}
            </button>
          ))}
        </div>

        <div
          className="arg-browser-view win11Scroll"
          data-kind={page.kind || "site"}
        >
          {error ? (
            <div className="arg-browser-error">
              <div className="arg-browser-error-code">无法访问此页面</div>
              <div className="arg-browser-error-text">{error}</div>
              <div className="arg-browser-error-detail">
                检查地址，或从书签里选择内部页面。
              </div>
            </div>
          ) : page.kind === "mail" ? (
            <MailApp hostId={hostId} progress={arg} />
          ) : (
            <>
              <div className="arg-web-head">
                <div className="arg-web-favicon" data-kind={page.kind}>
                  in
                </div>
                <div className="arg-web-url">{page.address}</div>
                <div className="arg-web-badge" data-kind={page.kind}>
                  内网
                </div>
              </div>

              <div className="arg-web-doc">
                <ContentBlocks blocks={page.blocks} />

                {page.links && page.links.length ? (
                  <div className="arg-web-links">
                    {page.links.map((link) => (
                      <button
                        key={link.label}
                        type="button"
                        className="arg-web-link"
                        onClick={() => go(link.page)}
                      >
                        <span>{link.label}</span>
                        <span className="arg-web-link-arrow">›</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EdgeMenu;
