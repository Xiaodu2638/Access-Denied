import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ToolBar } from "../../../utils/general";
import { retireInfo, toolText } from "../../../data/arg/remote";
import { outcomeOf } from "../../../data/arg/endings";
import "./assets/arg-tools.scss";

// 回收工具：输入回收码 → 确认 → 擦除分区。
// 「擦除」不是动画，是把玩家送出远程桌面：窗口全部收起，回到本机桌面，
// 回执邮件在那边的收件箱里等着。没有结果面板，也没有总结文字。
export const RetireTool = () => {
  const wnapp = useSelector((state) => state.apps.security);
  const arg = useSelector((state) => state.arg);
  const dispatch = useDispatch();

  const hostId = arg.host || "chenmo";
  const info = useMemo(() => retireInfo(hostId, arg), [hostId, arg]);

  const [stage, setStage] = useState("code"); // code | confirm | running
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const submit = (event) => {
    event.preventDefault();
    if (!info.hasTask) return;

    if (code.trim() !== info.code) {
      setError(toolText.retireWrong);
      setCode("");
      return;
    }

    setError("");
    setStage("confirm");
  };

  const confirm = () => {
    setStage("running");

    // 先算好结果：jobClosed 之后，交接盘里的内容决定是哪一种。
    const next = {
      ...arg,
      flags: { ...arg.flags, jobClosed: true },
    };
    const outcome = outcomeOf(next);

    setTimeout(() => {
      dispatch({ type: "ARG_OUTCOME", payload: outcome });
      dispatch({ type: "ARG_FLAG", payload: { flag: "jobClosed", value: true } });
      dispatch({ type: "APPS_HIDE_ALL" });
      dispatch({ type: "ARG_PHASE", payload: "aftermath" });
    }, 1800);
  };

  return (
    <div
      className="arg-win arg-tool arg-retire floatTab dpShad"
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
        name={toolText.retireTitle}
      />

      <div className="windowScreen flex flex-col" data-dock="true">
        <div className="arg-app-toolbar">
          <span>{info.assetId}</span>
          <span className="arg-app-count">
            {info.hasTask ? "待回收" : "无任务"}
          </span>
        </div>

        <div className="arg-app-body arg-tool-body">
          {!info.hasTask ? (
            <>
              <div className="arg-tool-grid">
                <div className="arg-tool-row">
                  <span>使用人</span>
                  <b>{info.owner}</b>
                </div>
                <div className="arg-tool-row">
                  <span>状态</span>
                  <b>未分配回收任务</b>
                </div>
              </div>
              <div className="arg-tool-note">{info.note}</div>
            </>
          ) : stage === "running" ? (
            <div className="arg-retire-running">
              <div className="arg-retire-spinner"></div>
              <div className="arg-retire-running-text">
                正在擦除 {info.volumes.join("、")}
              </div>
            </div>
          ) : stage === "confirm" ? (
            <>
              <div className="arg-tool-section">即将擦除</div>
              <div className="arg-retire-volumes">
                {info.volumes.map((volume) => (
                  <span key={volume} className="arg-retire-volume">
                    {volume}
                  </span>
                ))}
              </div>
              <div className="arg-tool-note">{info.note}</div>

              <div className="arg-tool-actions">
                <button
                  type="button"
                  className="arg-tool-btn arg-tool-btn-danger"
                  onClick={confirm}
                >
                  {toolText.retireConfirm}
                </button>
                <button
                  type="button"
                  className="arg-tool-btn"
                  onClick={() => {
                    setStage("code");
                    setCode("");
                  }}
                >
                  {toolText.retireCancel}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="arg-tool-grid">
                <div className="arg-tool-row">
                  <span>资产</span>
                  <b>{info.assetId}</b>
                </div>
                <div className="arg-tool-row">
                  <span>使用人</span>
                  <b>{info.owner}</b>
                </div>
                <div className="arg-tool-row">
                  <span>分区</span>
                  <b>{info.volumes.join("  ")}</b>
                </div>
              </div>

              <div className="arg-tool-note">{info.note}</div>

              <form className="arg-retire-form" onSubmit={submit}>
                <label className="arg-retire-label" htmlFor="arg-retire-code">
                  回收码
                </label>
                <div className="arg-retire-field">
                  <input
                    id="arg-retire-code"
                    className="arg-retire-input"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    spellCheck="false"
                    value={code}
                    onChange={(event) => {
                      setCode(event.target.value);
                      setError("");
                    }}
                  />
                  <button type="submit" className="arg-tool-btn">
                    {toolText.retireSubmit}
                  </button>
                </div>
                {error ? (
                  <div className="arg-retire-error" role="alert">
                    {error}
                  </div>
                ) : null}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RetireTool;
