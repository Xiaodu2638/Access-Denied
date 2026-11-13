import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { notifications, notificationMeta } from "../../data/arg";
import { playSound } from "../../utils/sound";
import "./arg-notification.scss";

// 系统通知：右下角滑入，不阻塞操作。
// 两个来源：
//   - data/arg/notifications.js 里的静态条目（delay / flags 触发）
//   - state.arg.toasts 里的运行期提示（调度消息、新邮件等）
// 每条通知出现时播一次提示音；已弹过的 id 存在 state.arg.notificationsSeen。

const TOAST_TONES = ["info", "warn", "danger"];

// 每条通知自己计时，新通知进来不会重置旧通知的倒计时。
const Toast = ({ item, onExpire }) => {
  const expire = useRef(onExpire);
  expire.current = onExpire;

  useEffect(() => {
    const timer = setTimeout(() => expire.current(item.id), notificationMeta.duration);
    return () => clearTimeout(timer);
  }, [item.id]);

  return (
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
          onClick={() => expire.current(item.id)}
        >
          ×
        </button>
      </div>
      <div className="arg-toast-body">{item.body}</div>
    </div>
  );
};

export const ArgNotification = () => {
  const dispatch = useDispatch();
  const flags = useSelector((state) => state.arg.flags);
  const seen = useSelector((state) => state.arg.notificationsSeen);
  const phase = useSelector((state) => state.arg.phase);
  const host = useSelector((state) => state.arg.host);
  const runtimeToasts = useSelector((state) => state.arg.toasts);
  // 静态条目（延迟 / flags 触发）只在远程会话里排期；
  // 运行期提示（调度消息、新邮件）在桌面上的任何阶段都要能出现。
  const active = phase === "remote" && !!host;
  const booted = useSelector((state) => state.wallpaper.booted);

  const [queue, setQueue] = useState([]);
  const startedAt = useRef(null);
  // 已经出过声的 id，避免同一条通知重复响。
  const sounded = useRef([]);
  // 运行期 id 的集合，供 dismiss 判断去哪个 reducer 分支。
  const runtimeIds = useRef(new Set());
  runtimeIds.current = new Set(runtimeToasts.map((toast) => toast.id));

  const pending = useMemo(() => {
    return notifications.filter((item) => {
      if (seen.includes(item.id)) return false;
      if (item.flags) return item.flags.every((flag) => flags[flag] === true);
      return typeof item.delay === "number";
    });
  }, [flags, seen]);

  const dismiss = useCallback(
    (id) => {
      setQueue((prev) => prev.filter((item) => item.id !== id));
      // 运行期提示由 reducer 移除；静态条目只记已读。
      if (runtimeIds.current.has(id)) {
        dispatch({ type: "ARG_TOAST_DROP", payload: id });
      } else {
        dispatch({ type: "ARG_NOTIF_SEEN", payload: id });
      }
    },
    [dispatch],
  );

  // 进入一台远程资产后重新开始计时；断开后清空队列。
  useEffect(() => {
    if (!active) {
      startedAt.current = null;
      setQueue([]);
      return;
    }
    startedAt.current = Date.now();
    setQueue([]);
  }, [active, host]);

  // 按延迟排期。
  useEffect(() => {
    if (!active) return undefined;

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
  }, [active, seen]);

  // 条件通知：条件一满足就入队。
  useEffect(() => {
    if (!active) return;

    pending.forEach((item) => {
      if (typeof item.delay === "number") return;
      setQueue((prev) => {
        if (prev.some((toast) => toast.id === item.id)) return prev;
        return [...prev, item].slice(-notificationMeta.maxVisible);
      });
    });
  }, [pending, active]);

  // 运行期提示：调度消息、新邮件等。
  useEffect(() => {
    if (!booted || !runtimeToasts.length) return;

    setQueue((prev) => {
      const missing = runtimeToasts.filter(
        (item) => !prev.some((toast) => toast.id === item.id),
      );
      if (!missing.length) return prev;
      return [...prev, ...missing].slice(-notificationMeta.maxVisible);
    });
  }, [runtimeToasts, booted]);

  // 新出现的通知各响一次。
  useEffect(() => {
    if (!queue.length) return;

    queue.forEach((item) => {
      if (sounded.current.includes(item.id)) return;
      sounded.current = [...sounded.current, item.id].slice(-40);
      playSound(item.sound || (item.tone === "warn" ? "warn" : "notify"));
    });
  }, [queue]);

  if (!queue.length) return null;

  return (
    <div className="arg-notify-stack">
      {queue.map((item) => (
        <Toast key={item.id} item={item} onExpire={dismiss} />
      ))}
    </div>
  );
};

export default ArgNotification;
