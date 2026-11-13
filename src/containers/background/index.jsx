import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { brand } from "../../data/arg/config";
import {
  PlateBackdrop,
  plateVariantOf,
} from "../../components/arg/Plates";
import "./back.scss";

export const Background = () => {
  const wall = useSelector((state) => state.wallpaper);
  const arg = useSelector((state) => state.arg);

  // 远程资产的桌面没有照片素材，用内联 SVG 画库区。
  if (arg.phase === "remote") {
    return (
      <PlateBackdrop
        variant={plateVariantOf(arg.host)}
        key={arg.host || "remote"}
      />
    );
  }

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
        <div className="arg-boot-hint">正在载入本机桌面</div>
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
