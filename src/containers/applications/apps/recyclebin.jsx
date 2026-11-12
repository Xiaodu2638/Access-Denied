import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { ToolBar } from "../../../utils/general";
import { videoLines, videoMeta } from "../../../data/arg/video";
import "./assets/arg-apps.scss";

// 回收站：只有一个被删除的文件。
// restore 之前不提示去哪里恢复；restore 之后变成播放器。
// 有 public/arg/linche.mp4 就播真实视频，没有就播放恢复出的字幕记录。

const formatTime = (seconds) => {
  const value = Math.max(0, Math.floor(seconds));
  const mm = String(Math.floor(value / 60)).padStart(2, "0");
  const ss = String(value % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

export const RecycleBin = () => {
  const wnapp = useSelector((state) => state.apps.bin0);
  const restored = useSelector((state) => state.arg.flags.restored);

  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [videoBroken, setVideoBroken] = useState(false);
  const timerRef = useRef(null);

  const duration = videoMeta.duration;

  const currentLines = useMemo(
    () => videoLines.filter((line) => line.at <= time),
    [time],
  );

  const activeLine = currentLines.length
    ? currentLines[currentLines.length - 1]
    : null;

  // 字幕模式下的播放推进。
  useEffect(() => {
    if (!restored || !playing || !videoBroken) return;

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
  }, [restored, playing, videoBroken, duration]);

  const toggle = () => {
    if (time >= duration) setTime(0);
    setPlaying((value) => !value);
  };

  const seek = (event) => {
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
          <span className="arg-app-count">1 个项目</span>
        </div>

        <div className="arg-app-body arg-bin-body">
          <div className="arg-bin-row">
            <div className="arg-bin-thumb">▶</div>
            <div className="arg-bin-info">
              <div className="arg-bin-name">{videoMeta.fileName}</div>
              <div className="arg-bin-meta">
                {restored
                  ? `已恢复 · ${videoMeta.size}`
                  : `已删除 · ${videoMeta.deletedAt} · 删除者 ${videoMeta.deletedBy}`}
              </div>
            </div>
            <span
              className="arg-bin-state"
              data-restored={restored ? "true" : "false"}
            >
              {restored ? "已恢复" : "已删除"}
            </span>
          </div>

          {restored ? (
            <div className="arg-player">
              <div className="arg-player-screen" data-broken={videoBroken}>
                {!videoBroken ? (
                  <video
                    className="arg-player-video"
                    src={videoMeta.src}
                    controls={false}
                    playsInline
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onError={() => {
                      setVideoBroken(true);
                      setPlaying(false);
                    }}
                    onTimeUpdate={(event) =>
                      setTime(Math.floor(event.currentTarget.currentTime))
                    }
                  ></video>
                ) : null}

                {videoBroken ? (
                  <div className="arg-player-fallback">
                    <div className="arg-player-rec">{videoMeta.recLabel}</div>
                    <div className="arg-player-tc">{formatTime(time)}</div>

                    {playing ? (
                      <div className="arg-player-sub" key={time}>
                        {activeLine ? activeLine.text : ""}
                      </div>
                    ) : (
                      <div className="arg-player-idle">
                        {time >= duration ? "— 录制结束 —" : "▶ 播放"}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

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

              <div className="arg-player-note">
                {videoBroken ? videoMeta.placeholderNotice : ""}
              </div>
            </div>
          ) : (
            <div className="arg-app-note">此项目已从本机删除。</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecycleBin;
