import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useDispatch, useSelector } from "react-redux";
import "./i18nextConf";
import "./index.css";
import ActMenu from "./components/menu";
import {
  BandPane,
  CalnWid,
  DesktopApp,
  SidePane,
  StartMenu,
  WidPane,
} from "./components/start";
import Taskbar from "./components/taskbar";
import Prologue from "./components/arg/Prologue";
import ArgNotification from "./components/arg/ArgNotification";
import RemoteLayer from "./components/arg/RemoteLayer";
import { Background, BootScreen } from "./containers/background";

import { loadSettings } from "./actions";
import { installSoundUnlock } from "./utils/sound";
import * as Applications from "./containers/applications";

function ErrorFallback({ error, resetErrorBoundary }) {
  // 这个界面可能在任何路径下出现，所以样式全部内联，不依赖外部文件。
  const styles = `
    body { font-family: "Segoe UI", "Microsoft YaHei", system-ui, sans-serif; background: #05070a; color: #fefeff; height: 100vh; margin: 0; }
    #page { display: table; height: 100%; margin: -10px auto 0; width: 70%; font-size: 1.9vw; }
    #container { display: table-cell; vertical-align: middle; }
    h1, h2, h4, h5 { font-weight: 300; padding: 0; margin: 25px 0 0; }
    h1 { font-size: 6rem; margin-bottom: 10px; }
    h2 { font-size: 21px; line-height: 1.6; }
    h4 { font-size: 18px; line-height: 1.5em; }
    h5 { line-height: 22px; font-size: 14px; font-weight: 400; color: #8b949e; }
    #details { display: flex; flex-flow: row nowrap; padding-top: 10px; }
    #stopcode { padding-left: 10px; flex: 1 1 auto; }
    @media (min-width: 840px) { #page { font-size: 140%; width: 800px; } }
  `;

  return (
    <div>
      <meta charSet="UTF-8" />
      <title>404 - 页面不存在</title>
      <style>{styles}</style>
      <div id="page">
        <div id="container">
          <h1>:(</h1>
          <h2>
            你的会话遇到了问题，需要重新开始。我们正在收集一些信息，然后会为你重启。
          </h2>
          <h2>
            <span id="percentage">0</span>% 已完成
          </h2>
          <div id="details">
            <div id="stopcode">
              <h4>如需了解更多信息，请返回会话入口。</h4>
              <h5>
                如果你要联系支持人员，请提供以下信息：
                <br />
                停止代码：{error.message}
              </h5>
              <button onClick={resetErrorBoundary}>重试</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const wall = useSelector((state) => state.wallpaper);
  const arg = useSelector((state) => state.arg);
  const dispatch = useDispatch();

  const afterMath = (event) => {
    var ess = [
      ["START", "STARTHID"],
      ["BAND", "BANDHIDE"],
      ["PANE", "PANEHIDE"],
      ["WIDG", "WIDGHIDE"],
      ["CALN", "CALNHIDE"],
      ["MENU", "MENUHIDE"],
    ];

    var actionType = "";
    try {
      actionType = event.target.dataset.action || "";
    } catch (err) {}

    var actionType0 = getComputedStyle(event.target).getPropertyValue(
      "--prefix",
    );

    ess.forEach((item, i) => {
      if (!actionType.startsWith(item[0]) && !actionType0.startsWith(item[0])) {
        dispatch({
          type: item[1],
        });
      }
    });
  };

  window.oncontextmenu = (e) => {
    afterMath(e);
    e.preventDefault();
    // dispatch({ type: 'GARBAGE'});
    var data = {
      top: e.clientY,
      left: e.clientX,
    };

    if (e.target.dataset.menu != null) {
      data.menu = e.target.dataset.menu;
      data.attr = e.target.attributes;
      data.dataset = e.target.dataset;
      dispatch({
        type: "MENUSHOW",
        payload: data,
      });
    }
  };

  window.onclick = afterMath;

  window.onload = (e) => {
    dispatch({ type: "WALLBOOTED" });
  };

  useEffect(() => {
    if (!window.onstart) {
      loadSettings();
      window.onstart = setTimeout(() => {
        // console.log("prematurely loading ( ﾉ ﾟｰﾟ)ﾉ");
        dispatch({ type: "WALLBOOTED" });
      }, 2600);
    }
  });

  // 提示音要先有一次用户手势才能解锁，否则定时通知是静音的。
  useEffect(() => installSoundUnlock(), []);

  return (
    <div className="App">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        {!wall.booted ? <BootScreen dir={wall.dir} /> : null}
        <div className="appwrap">
          <Background />
          <div className="desktop" data-menu="desk">
            <DesktopApp />
            {Object.keys(Applications).map((key, idx) => {
              var WinApp = Applications[key];
              return <WinApp key={idx} />;
            })}
            <StartMenu />
            <BandPane />
            <SidePane />
            <WidPane />
            <CalnWid />
          </div>
          <Taskbar />
          <ActMenu />
        </div>
        {arg.phase !== "remote" ? <Prologue /> : null}
        {/* 通知在三个阶段都要在：远程时的资产提醒、回到本机后的新邮件提示。 */}
        {wall.booted ? <ArgNotification /> : null}
        {arg.phase === "remote" && wall.booted ? <RemoteLayer /> : null}
      </ErrorBoundary>
    </div>
  );
}

export default App;
