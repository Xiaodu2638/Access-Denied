import { lock } from "../data/arg/config";

// ARG 固定壁纸。谜题线索藏在文件名里，所以不允许切换。
const defState = {
  themes: ["dark"],
  wps: 0,
  src: lock.wallpaper,
  // 每次进入页面都重新锁定，不把解锁状态写进 localStorage。
  locked: true,
  booted: false,
  act: "",
  dir: 0,
};

const wallReducer = (state = defState, action) => {
  switch (action.type) {
    case "WALLUNLOCK":
      return {
        ...state,
        locked: false,
        dir: 0,
      };
    case "WALLALOCK":
      return {
        ...state,
        locked: true,
        dir: -1,
      };
    case "WALLBOOTED":
      return {
        ...state,
        booted: true,
        dir: 0,
        act: "",
      };
    case "WALLRESTART":
      return {
        ...state,
        booted: false,
        dir: -1,
        locked: true,
        act: "restart",
      };
    case "WALLSHUTDN":
      return {
        ...state,
        booted: false,
        dir: -1,
        locked: true,
        act: "shutdn",
      };
    // 壁纸与主题切换在 ARG 中一律忽略。
    case "WALLNEXT":
    case "WALLSET":
      return state;
    default:
      return state;
  }
};

export default wallReducer;
