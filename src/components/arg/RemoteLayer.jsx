import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { machines, timeline } from "../../data/arg/config";
import { dispatchMessages, dispatchName } from "../../data/arg/remote";
import { playSound } from "../../utils/sound";
import "./remote-layer.scss";

// 远程会话的常驻界面：
//   - 顶部一条连接栏（当前资产 / 地址 / 断开）
//   - 左下角调度聊天（只显示调度已经说过的话）
// 它不提供任务列表，也不替玩家做选择。
// 邮件要玩家自己去浏览器里按发送，这里不代劳。

export const RemoteLayer = () => {
  const dispatch = useDispatch();
  const arg = useSelector((state) => state.arg);
  const machine = machines[arg.host] || machines.chenmo;

  const [elapsed, setElapsed] = useState(0);
  const [dockOpen, setDockOpen] = useState(true);
  const [unread, setUnread] = useState(0);
  const listRef = useRef(null);
  // 已经提示过的消息 id，避免每次 elapsed 变化都重复弹。
  const announced = useRef([]);

  // 会话计时：调度的话按时间出现，不按玩家操作出现。
  useEffect(() => {
    const started = Date.now();
    const tick = setInterval(() => setElapsed(Date.now() - started), 500);
    return () => clearInterval(tick);
  }, []);

  const messages = useMemo(
    () => dispatchMessages(arg, elapsed),
    [arg.flags, arg.host, elapsed],
  );

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length, dockOpen]);

  // 新消息到达：响一声、记未读数。消息本身已经在聊天面板里了，
  // 不再额外弹提示气泡 —— 那就是同一句话看两遍。
  useEffect(() => {
    if (!messages.length) return;

    const fresh = messages.filter(
      (item) => !announced.current.includes(item.id),
    );
    if (!fresh.length) return;

    announced.current = [
      ...announced.current,
      ...fresh.map((item) => item.id),
    ].slice(-60);

    setUnread((value) => value + fresh.length);
    playSound("message");

    fresh.forEach((item) => {
      dispatch({ type: "ARG_CHAT_SEEN", payload: item.id });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, dispatch]);

  const toggleDock = () => {
    setDockOpen((value) => !value);
    setUnread(0);
  };

  const disconnect = () => {
    dispatch({ type: "APPS_HIDE_ALL" });
    dispatch({ type: "ARG_PHASE", payload: "aftermath" });
  };

  return (
    <>
      <div className="arg-remote-bar" role="status">
        <span className="arg-remote-dot" data-live="true"></span>
        <span className="arg-remote-host">{machine.hostname}</span>
        <span className="arg-remote-sep">·</span>
        <span className="arg-remote-ip">{machine.address}</span>
        <span className="arg-remote-sep">·</span>
        <span className="arg-remote-user">{machine.user}</span>
        <button
          type="button"
          className="arg-remote-disconnect"
          onClick={disconnect}
        >
          断开
        </button>
      </div>

      <div className="arg-dispatch" data-open={dockOpen ? "true" : "false"}>
        <button
          type="button"
          className="arg-dispatch-head"
          onClick={toggleDock}
        >
          <span className="arg-dispatch-avatar">赵</span>
          <span className="arg-dispatch-name">{dispatchName}</span>
          {unread > 0 && !dockOpen ? (
            <span className="arg-dispatch-badge">{unread}</span>
          ) : null}
          <span className="arg-dispatch-state">
            {dockOpen ? "在线" : "收起"}
          </span>
        </button>

        {dockOpen ? (
          <div className="arg-dispatch-list" ref={listRef}>
            {messages.map((item) => (
              <div key={item.id} className="arg-dispatch-msg">
                <div className="arg-dispatch-time">
                  {mn(timeline.clock.hour, timeline.clock.minute)}
                </div>
                <div className="arg-dispatch-text">{item.text}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
};

// 时间只是装饰：聊天里不显示真实系统时间。
function mn(hour, minute) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export default RemoteLayer;
