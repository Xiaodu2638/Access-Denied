import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { notifications, notificationMeta } from "../../data/arg";
import "./arg-notification.scss";

// 系统通知：右下角滑入，不阻塞操作。
// 触发条件见 src/data/arg/notifications.js 的 delay / flags。
// 已弹过的 id 存在 state.arg.notificationsSeen，跨刷新不会重复。

const TOAST_TONES = ["info", "warn", "danger"];

const Toast = ({ item, onDismiss }) => (
  <div
    className="arg-toast"
    data-tone={TOAST_TONES.includes(item.tone) ? item.tone : "info"}
    role="status"
  >
    <div className="arg-toast-head">
      <span className="arg-toast-title">{item.title}</span>
      <button
        type="button"
        className="arg-toast-close"
        aria-label="关闭通知"
        onClick={() => onDismiss(item.id)}
      >
        ×
      </button>
    </div>
    <div className="arg-toast-body">{item.body}</div>
  </div>
);

export const ArgNotification = () => {
  const dispatch = useDispatch();
  const flags = useSelector((state) => state.arg.flags);
  const seen = useSelector((state) => state.arg.notificationsSeen);
  const prologueSeen = flags.prologueSeen;

  const [queue, setQueue] = useState([]);
  const startedAt = useRef(null);

  const pending = useMemo(() => {
    return notifications.filter((item) => {
      if (seen.includes(item.id)) return false;
      if (item.flags) return item.flags.every((flag) => flags[flag] === true);
      return typeof item.delay === "number";
    });
  }, [flags, seen]);

  const dismiss = (id) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
    dispatch({ type: "ARG_NOTIF_SEEN", payload: id });
  };

  // 引子结束后才开始计时，避免通知压在引子桌面上。
  useEffect(() => {
    if (!prologueSeen) {
      startedAt.current = null;
      return;
    }
    if (startedAt.current == null) startedAt.current = Date.now();
  }, [prologueSeen]);

  // 按延迟排期。
  useEffect(() => {
    if (!prologueSeen) return;

    const timers = [];

    notifications.forEach((item) => {
      if (seen.includes(item.id)) return;
      if (typeof item.delay !== "number") return;

      const elapsed = startedAt.current ? Date.now() - startedAt.current : 0;
      const wait = Math.max(0, item.delay - elapsed);

      timers.push(
        setTimeout(() => {
          setQueue((prev) => {
            if (prev.some((toast) => toast.id === item.id)) return prev;
            if (seen.includes(item.id)) return prev;
            return [...prev, item].slice(-notificationMeta.maxVisible);
          });
        }, wait),
      );
    });

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [prologueSeen, seen]);

  // 条件通知：条件一满足就入队。
  useEffect(() => {
    if (!prologueSeen) return;

    pending.forEach((item) => {
      if (typeof item.delay === "number") return;
      setQueue((prev) => {
        if (prev.some((toast) => toast.id === item.id)) return prev;
        return [...prev, item].slice(-notificationMeta.maxVisible);
      });
    });
  }, [pending, prologueSeen]);

  // 每条通知到时间自动关闭。
  useEffect(() => {
    if (!queue.length) return;

    const timers = queue.map((item) =>
      setTimeout(() => {
        setQueue((prev) => prev.filter((toast) => toast.id !== item.id));
        dispatch({ type: "ARG_NOTIF_SEEN", payload: item.id });
      }, notificationMeta.duration),
    );

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [queue, dispatch]);

  if (!queue.length) return null;

  return (
    <div className="arg-notify-stack">
      {queue.map((item) => (
        <Toast key={item.id} item={item} onDismiss={dismiss} />
      ))}
    </div>
  );
};

export default ArgNotification;
