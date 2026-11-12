import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { outcomes } from "../../data/arg/endings";

// 结局不再是一块文字面板。
// 这个组件只做一件事：按 outcomes 里的步骤，把变化施加到真实桌面上。
// 玩家看到的是窗口一个个关掉、文件夹变成已归档、锁屏时间变了。
// 渲染结果永远是 null。

const WINDOW_ACTION = {
  edge: "MSEDGE",
  explorer: "EXPLORER",
  notepad: "NOTEPAD",
  terminal: "TERMINAL",
  bin: "RECYCLE",
  code: "DONTRUN",
};

const Ending = () => {
  const dispatch = useDispatch();
  const endingId = useSelector((state) => state.arg.ending);
  const outcome = endingId ? outcomes[endingId] : null;

  useEffect(() => {
    if (!outcome) return;

    const steps = outcome.steps || [];
    if (!steps.length) return;

    const timers = [];

    steps.forEach((step) => {
      timers.push(
        setTimeout(() => {
          if (step.flag) {
            dispatch({
              type: "ARG_FLAG",
              payload: { flag: step.flag, value: true },
            });
          }

          if (step.close) {
            const action = WINDOW_ACTION[step.close];
            if (action) dispatch({ type: action, payload: "close" });
          }

          if (step.lock) {
            if (
              outcome.lockLastLogin ||
              outcome.lockSession ||
              outcome.lockNote
            ) {
              dispatch({
                type: "ARG_LOCK_OVERRIDE",
                payload: {
                  lastLogin: outcome.lockLastLogin,
                  session: outcome.lockSession,
                  note: outcome.lockNote,
                },
              });
            }
            dispatch({ type: "WALLALOCK" });
          }
        }, step.after),
      );
    });

    // 最后一步之后再留一点时间，然后交还给桌面或锁屏。
    const last = steps[steps.length - 1].after || 0;
    timers.push(
      setTimeout(() => {
        dispatch({ type: "ARG_ENDING", payload: null });
      }, last + 600),
    );

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [outcome, dispatch]);

  return null;
};

export default Ending;
