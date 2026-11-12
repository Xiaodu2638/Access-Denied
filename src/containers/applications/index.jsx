import React from "react";
import { useSelector } from "react-redux";
import "./tabs.scss";
import "./tabs2.scss";
import "./wnapp.scss";
import "./apps/assets/arg-window.scss";

export * from "./apps/dontrun";
export * from "./apps/edge";
export * from "./apps/explorer";
export * from "./apps/notepad";
export * from "./apps/recyclebin";
export * from "./apps/terminal";

export const ScreenPreview = () => {
  const tasks = useSelector((state) => state.taskbar);

  return (
    <div className="prevCont" style={{ left: tasks.prevPos + "%" }}>
      <div className="prevScreen" id="prevApp" data-show={tasks.prev && false}>
        <div id="prevsc"></div>
      </div>
    </div>
  );
};
