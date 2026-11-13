// 桌面壁纸。引子有自己的壁纸；远程阶段改由 SVG 库区画面接管。
const defState = {
  themes: ["dark"],
  wps: 0,
  src: "dark/img0.jpg",
  // 本作没有锁屏：玩家自己的桌面和远程会话都不经过登录界面。
  locked: false,
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
        act: "restart",
      };
    case "WALLSHUTDN":
      return {
        ...state,
        booted: false,
        dir: -1,
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
