import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToolBar } from "../../../utils/general";
import {
  dontRunMeta,
  runResult,
  scriptSource,
} from "../../../data/arg/dontrun";
import "./assets/arg-apps.scss";

export const DontRun = () => {
  const wnapp = useSelector((state) => state.apps.code);
  const ran = useSelector((state) => state.arg.flags.ranScript);
  const dispatch = useDispatch();
  const [output, setOutput] = useState(false);

  // 没有二次确认：点了就是点了。后果由终端和通知承担，不由弹窗预告。
  const run = () => {
    setOutput(true);
    if (!ran) {
      dispatch({
        type: "ARG_FLAG",
        payload: { flag: "ranScript", value: true },
      });
      // 脚本会改写当前会话身份，日志随之损坏。
      dispatch({
        type: "ARG_FLAG",
        payload: { flag: "corrupted", value: true },
      });
    }
  };

  return (
    <div
      className="arg-win arg-dontrun floatTab dpShad"
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
        name={dontRunMeta.title}
      />
      <div className="windowScreen flex flex-col" data-dock="true">
        <div className="arg-app-toolbar">
          <span>{dontRunMeta.path}</span>
          <span className="arg-app-tags">
            <span className="arg-app-tag" data-tone="warn">
              {dontRunMeta.tag}
            </span>
            <span className="arg-app-count">JavaScript</span>
          </span>
        </div>

        <div className="arg-app-body">
          <pre className="arg-dontrun-code">{scriptSource}</pre>

          <div className="arg-dontrun-actions">
            <button
              type="button"
              className="arg-dontrun-run"
              title={dontRunMeta.runLabel}
              aria-label={dontRunMeta.runLabel}
              disabled={ran}
              onClick={run}
            >
              <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
                <path d="M5 3.2v9.6L13 8z" fill="currentColor" />
              </svg>
            </button>
            {ran ? (
              <span className="arg-app-note">{dontRunMeta.alreadyRunText}</span>
            ) : null}
          </div>

          {output ? (
            <div className="arg-dontrun-output">
              <div className="arg-dontrun-output-title">
                {runResult.title}
              </div>
              {runResult.lines.map((line, index) => (
                <div
                  key={index}
                  className="arg-dontrun-line"
                  data-tone={line.tone || "dim"}
                >
                  {line.text || "\u00a0"}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
