import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { brand, lock, timeline } from "../../data/arg/config";
import { verifyLockAnswer } from "../../utils/arg";
import "./back.scss";
import "./arg-lock.scss";

export const Background = () => {
  const wall = useSelector((state) => state.wallpaper);

  return (
    <div
      className="background"
      style={{
        backgroundImage: `url(img/wallpaper/${wall.src})`,
      }}
    ></div>
  );
};

export const BootScreen = (props) => {
  const dispatch = useDispatch();
  const wall = useSelector((state) => state.wallpaper);
  const [blackout, setBlackOut] = useState(false);

  // 关机/重启都会先黑屏；只有重启会自动继续。
  useEffect(() => {
    if (props.dir >= 0) {
      setBlackOut(false);
      return undefined;
    }

    const timer = setTimeout(() => {
      setBlackOut(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, [props.dir]);

  useEffect(() => {
    if (props.dir >= 0 || !blackout || wall.act !== "restart") return undefined;

    const timers = [];

    timers.push(
      setTimeout(() => {
        setBlackOut(false);
        timers.push(
          setTimeout(() => {
            dispatch({ type: "WALLBOOTED" });
          }, 4000),
        );
      }, 2000),
    );

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [blackout, props.dir, wall.act, dispatch]);

  // 关机后要等玩家自己重新接通电源，否则会永远停在黑屏上。
  const poweredOff = blackout && wall.act === "shutdn";
  const powerOn = () => dispatch({ type: "WALLBOOTED" });

  useEffect(() => {
    if (!poweredOff) return undefined;

    window.addEventListener("keydown", powerOn);

    return () => window.removeEventListener("keydown", powerOn);
  }, [poweredOff]);

  return (
    <div
      className={"bootscreen arg-boot" + (poweredOff ? " arg-poweroff" : "")}
      onClick={poweredOff ? powerOn : undefined}
    >
      <div className={blackout ? "hidden" : ""}>
        <div className="arg-boot-brand">
          <div className="arg-boot-title">{brand.title}</div>
          <div className="arg-boot-sub">{brand.codename}</div>
        </div>
        <div className="mt-48" id="loader">
          <svg
            className="progressRing"
            height={48}
            width={48}
            viewBox="0 0 16 16"
          >
            <circle cx="8px" cy="8px" r="7px"></circle>
          </svg>
        </div>
        <div className="arg-boot-hint">正在恢复会话 0x0342</div>
      </div>
      {poweredOff ? (
        <div className="arg-poweroff-panel" role="status">
          <div className="arg-poweroff-title">已关机</div>
          <div className="arg-poweroff-hint">点击任意位置重新接通电源</div>
        </div>
      ) : null}
    </div>
  );
};

export const LockScreen = (props) => {
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState("");
  const [unlocked, setUnLock] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);
  const dispatch = useDispatch();

  // RDP 登录框已经验证过密码，锁屏只负责交接会话，不再问第二遍。
  const rdpAuthed = useSelector(
    (state) => state.arg && state.arg.flags && state.arg.flags.rdpAuthed,
  );

  // 结局之后改写锁屏上的最后登录时间和会话状态。
  const lockOverride = useSelector(
    (state) => state.arg && state.arg.lockOverride,
  );
  const postEnding = useSelector(
    (state) => state.arg && state.arg.flags && state.arg.flags.postEnding,
  );
  const lastLogin = (lockOverride && lockOverride.lastLogin) || lock.lastLogin;
  const sessionText = (lockOverride && lockOverride.session) || lock.session;

  const { puzzle } = lock;

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // 已经通过 RDP 验证：短暂显示会话交接状态后直接解锁。
  // 但结局之后不再自动解锁——那时候会话已经结束，或者身份已经不是你。
  useEffect(() => {
    if (!rdpAuthed || unlocked) return;
    if (postEnding) return;

    setBusy(true);
    setUnLock(true);

    const timer = setTimeout(() => {
      dispatch({ type: "WALLUNLOCK" });
    }, puzzle.successDelay);

    return () => clearTimeout(timer);
  }, [rdpAuthed, unlocked, dispatch, puzzle.successDelay, postEnding]);

  const submit = (event) => {
    event.preventDefault();
    if (busy || unlocked) return;

    const value = answer.trim();
    if (!value) return;

    if (verifyLockAnswer(value)) {
      setError("");
      setBusy(true);
      setUnLock(true);
      setTimeout(() => {
        dispatch({ type: "WALLUNLOCK" });
      }, puzzle.successDelay);
      return;
    }

    setAttempts((n) => n + 1);
    setError(puzzle.wrongText);
    setAnswer("");
    if (inputRef.current) inputRef.current.focus();
  };

  // 断开远程连接：回到玩家自己的桌面，可以重新翻邮件找凭据。
  // 这是防止"没记住密钥就卡死在锁屏"的逃生口，不是提示。
  // 只撤销 prologueSeen，不动 wall.locked——锁屏仍在底层，
  // 等玩家再次连上时自然露出来。
  const disconnect = () => {
    if (busy || unlocked) return;
    setError("");
    setAnswer("");
    setAttempts(0);
    // 锁屏会被本机桌面盖住，但它的输入框仍然挂载着。
    // 主动失焦，避免玩家在本机桌面上打字时输入落到隐藏的密码框里。
    if (inputRef.current) inputRef.current.blur();
    dispatch({
      type: "ARG_FLAG",
      payload: { flag: "prologueSeen", value: false },
    });
  };

  return (
    <div
      className={"lockscreen arg-lock " + (props.dir == -1 ? "slowfadein" : "")}
      data-unlock={unlocked}
      style={{
        backgroundImage: `url(img/wallpaper/${lock.wallpaper})`,
      }}
    >
      <div className="arg-lock-shade"></div>
      {/* 远程会话的质感：扫描线 + 暗角。等真实壁纸到位后可以删掉，或保留作为风格层。 */}
      <div className="arg-lock-scanlines" aria-hidden="true"></div>
      <div className="arg-lock-vignette" aria-hidden="true"></div>

      <div className="arg-lock-topbar">
        <div className="arg-lock-clock">
          <div className="arg-lock-time">03:42</div>
          <div className="arg-lock-date">{timeline.incidentLabel}</div>
        </div>

        <div className="arg-lock-system">
          <span className="arg-lock-system-dot"></span>
          <span className="arg-lock-system-title">{brand.title}</span>
          <span className="arg-lock-system-code">{brand.codename}</span>
        </div>
      </div>

      <div className="arg-lock-signin">
        <div className="arg-lock-avatar">
          <img src="img/icon/ui/defAccount.png" alt="" />
        </div>

        <div className="arg-lock-username">{lock.user}</div>

        <div className="arg-lock-status">
          <span className="arg-lock-dot"></span>
          <span>{sessionText}</span>
          <span className="arg-lock-status-sep">·</span>
          <span>
            当前用户{" "}
            <b>{(lockOverride && lockOverride.identity) || lock.currentUser}</b>
          </span>
        </div>

        {unlocked || rdpAuthed ? (
          <div className="arg-lock-success" role="status">
            {postEnding
              ? (lockOverride && lockOverride.note) || "会话已终止。"
              : puzzle.successText}
          </div>
        ) : (
          <form className="arg-lock-form" onSubmit={submit}>
            <div className="arg-lock-field">
              <input
                id="arg-lock-key"
                ref={inputRef}
                type="password"
                autoComplete="off"
                spellCheck="false"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="密码"
                disabled={busy}
              />
              <button
                type="submit"
                aria-label={puzzle.submit}
                disabled={busy || !answer.trim()}
              >
                <svg
                  viewBox="0 0 16 16"
                  width="14"
                  height="14"
                  aria-hidden="true"
                >
                  <path
                    d="M2 8h10M8 4l4 4-4 4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </form>
        )}

        {error && !unlocked && !rdpAuthed ? (
          <div className="arg-lock-error" role="alert">
            {error}
          </div>
        ) : null}

        {puzzle.hint &&
        attempts >= puzzle.hintAfter &&
        !unlocked &&
        !rdpAuthed ? (
          <div className="arg-lock-hint">{puzzle.hint}</div>
        ) : null}

        {rdpAuthed ? null : (
          <div className="arg-lock-options">
            <button type="button" data-disabled="true">
              登录选项
            </button>
            <span>·</span>
            <button type="button" onClick={disconnect}>
              断开连接
            </button>
          </div>
        )}

        {postEnding ? (
          <div className="arg-lock-options">
            <button
              type="button"
              onClick={() => {
                dispatch({ type: "ARG_RESET" });
              }}
            >
              重新开始
            </button>
          </div>
        ) : null}

        <div className="arg-lock-meta-line">
          <span>上次登录</span>
          <span>{lastLogin}</span>
        </div>

        {puzzle.notice ? (
          <div className="arg-lock-notice">
            <span className="arg-lock-notice-title">
              {(lockOverride && lockOverride.note) || puzzle.notice.title}
            </span>
            <span>
              {lockOverride && lockOverride.note ? "" : puzzle.notice.body}
            </span>
          </div>
        ) : null}
      </div>

      <div className="arg-lock-bottom">
        <div className="arg-lock-bottom-left">
          <span>{brand.hostname}</span>
          <span>SESSION 0x0342</span>
        </div>

        <div className="arg-lock-bottom-right">
          <img
            className="arg-lock-tray"
            src="img/icon/ui/network.png"
            alt="网络"
          />
          <img
            className="arg-lock-tray"
            src="img/icon/ui/audio3.png"
            alt="音量"
          />
          <img
            className="arg-lock-tray arg-lock-power"
            src="img/icon/ui/power.png"
            alt="电源"
          />
        </div>
      </div>
    </div>
  );
};
