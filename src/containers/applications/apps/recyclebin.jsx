import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToolBar } from "../../../utils/general";
import { recycleItem } from "../../../data/arg/remote";
import "./assets/arg-apps.scss";

// 回收站：只有陈默删掉的一段现场录音。
// 还原之前只显示文件名与删除信息；还原后才有播放器和文字转录。
// 没有音频文件，播放用计时器模拟，转录按时间轴逐行出现。

const formatTime = (seconds) => {
  const value = Math.max(0, Math.floor(seconds));
  const mm = String(Math.floor(value / 60)).padStart(2, "0");
  const ss = String(value % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

const EmptyBin = () => (
  <div className="arg-bin-empty">
    <img src="img/icon/bin1.png" alt="" />
    <div>回收站是空的。</div>
  </div>
);

export const RecycleBin = () => {
  const wnapp = useSelector((state) => state.apps.bin0);
  const arg = useSelector((state) => state.arg);
  const flags = arg.flags || {};
  const dispatch = useDispatch();

  const hostId = arg.host || "chenmo";
  // 录音是陈默的。ZJ-03 的回收站是空的。
  const item = hostId === "chenmo" ? recycleItem : null;
  const restored = item ? flags.restored === true : false;

  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const timerRef = useRef(null);

  const duration = item ? item.duration : 0;

  const visibleLines = useMemo(
    () => (item ? item.lines.filter((line) => line.at <= time) : []),
    [item, time],
  );

  // 还原后立刻把转录标记成已读：文件已经打开过了。
  useEffect(() => {
    if (!restored) return;
    if (flags.readTranscript === true) return;
    dispatch({
      type: "ARG_FLAG",
      payload: { flag: "readTranscript", value: true },
    });
  }, [restored, flags.readTranscript, dispatch]);

  useEffect(() => {
    if (!restored || !playing) return undefined;
    timerRef.current = setInterval(() => {
      setTime((value) => {
        if (value + 1 >= duration) {
          setPlaying(false);
          return duration;
        }
        return value + 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [restored, playing, duration]);

  const restore = () => {
    dispatch({ type: "ARG_FLAG", payload: { flag: "restored", value: true } });
  };

  const toggle = () => {
    if (!restored) return;
    if (time >= duration) setTime(0);
    setPlaying((value) => !value);
  };

  const seek = (event) => {
    if (!restored) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    setTime(Math.round(Math.min(Math.max(ratio, 0), 1) * duration));
  };

  const progress = duration ? Math.min(100, (time / duration) * 100) : 0;

  return (
    <div
      className="arg-win arg-recycle floatTab dpShad"
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
        name="回收站"
      />

      <div className="windowScreen flex flex-col" data-dock="true">
        <div className="arg-app-toolbar">
          <span>已删除的项目</span>
          <span className="arg-app-count">{item ? "1 个项目" : "0 个项目"}</span>
        </div>

        <div className="arg-app-body arg-bin-body">
          {!item ? (
            <EmptyBin />
          ) : (
            <>
              <div className="arg-bin-row">
                <div className="arg-bin-thumb">♪</div>
                <div className="arg-bin-info">
                  <div className="arg-bin-name">{item.name}</div>
                  <div className="arg-bin-meta">
                    {restored
                      ? `${item.size} · 已还原到原位置`
                      : `已删除 · ${item.deletedAt} · 删除者 ${item.deletedBy}`}
                  </div>
                </div>
                <span
                  className="arg-bin-state"
                  data-restored={restored ? "true" : "false"}
                >
                  {restored ? "已还原" : "已删除"}
                </span>
              </div>

              {restored ? (
                <div className="arg-player">
                  <div className="arg-player-controls">
                    <button
                      type="button"
                      className="arg-player-play"
                      aria-label={playing ? "暂停" : "播放"}
                      onClick={toggle}
                    >
                      {playing ? "❚❚" : "▶"}
                    </button>

                    <div
                      className="arg-player-track"
                      onClick={seek}
                      role="presentation"
                    >
                      <div
                        className="arg-player-progress"
                        style={{ width: progress + "%" }}
                      ></div>
                    </div>

                    <span className="arg-player-time">
                      {formatTime(time)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="arg-rec-transcript win11Scroll">
                    {visibleLines.length ? (
                      visibleLines.map((line, index) => (
                        <div
                          key={line.at}
                          className="arg-rec-line"
                          data-active={
                            index === visibleLines.length - 1 ? "true" : "false"
                          }
                        >
                          <span className="arg-rec-tc">
                            {formatTime(line.at)}
                          </span>
                          <span className="arg-rec-text">{line.text}</span>
                        </div>
                      ))
                    ) : (
                      <div className="arg-rec-idle">
                        原始位置 {item.origin}
                        <br />
                        按播放查看转录。
                      </div>
                    )}
                  </div>

                  <div className="arg-player-note">
                    转录由本机语音识别生成，未校对。
                  </div>
                </div>
              ) : (
                <>
                  <div className="arg-app-note">
                    此项目已从本机删除。还原到 {item.origin}？
                  </div>
                  <div className="arg-bin-actions">
                    <button
                      type="button"
                      className="arg-bin-restore"
                      onClick={restore}
                    >
                      还原
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecycleBin;
