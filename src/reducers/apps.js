import { allApps } from "../utils";

var dev = "";
if (import.meta.env.MODE == "development") {
  dev = ""; // set the name (lowercase) of the app you are developing so that it will be opened on refresh
}

const defState = {};
for (var i = 0; i < allApps.length; i++) {
  defState[allApps[i].icon] = allApps[i];
  // 默认用固定尺寸的浮动窗口，而不是铺满整个桌面。
  defState[allApps[i].icon].size = "cstm";
  defState[allApps[i].icon].dim = {
    width: "min(820px, 82vw)",
    height: "min(560px, 72vh)",
    top: "12%",
    left: "15%",
  };
  defState[allApps[i].icon].hide = true;
  defState[allApps[i].icon].max = null;
  defState[allApps[i].icon].z = 0;

  if (allApps[i].icon == dev) {
    defState[allApps[i].icon].size = "mini";
    defState[allApps[i].icon].hide = false;
    defState[allApps[i].icon].max = true;
    defState[allApps[i].icon].z = 1;
  }
}

defState.hz = 2;

// 可见窗口里最高的 z。关闭/最小化后用它重算 hz，
// 避免 hz 一路递减到负数，把新窗口压到桌面背景下面。
const topZ = (state) => {
  let top = 0;
  Object.keys(state).forEach((key) => {
    if (key === "hz") return;
    const obj = state[key];
    if (obj && !obj.hide && typeof obj.z === "number" && obj.z > top) {
      top = obj.z;
    }
  });
  return top;
};

const appReducer = (state = defState, action) => {
  var tmpState = { ...state };
  if (action.type == "APPS_HIDE_ALL") {
    // 切换资产 / 断开连接时把远程桌面上的窗口全部收掉。
    Object.keys(tmpState).forEach((key) => {
      if (key === "hz") return;
      const obj = tmpState[key];
      if (!obj || typeof obj !== "object") return;
      tmpState[key] = { ...obj, hide: true, max: null, z: -1 };
    });
    tmpState.hz = 2;
    return tmpState;
  }
  if (action.type == "EDGELINK") {
    var obj = { ...tmpState["edge"] };
    if (action.payload && action.payload.startsWith("http")) {
      obj.url = action.payload;
    } else if (action.payload && action.payload.length != 0) {
      obj.url = "https://www.bing.com/search?q=" + action.payload;
    } else {
      obj.url = null;
    }

    obj.size = "full";
    obj.hide = false;
    obj.max = true;
    tmpState.hz += 1;
    obj.z = tmpState.hz;
    tmpState["edge"] = obj;
    return tmpState;
  } else if (action.type == "SHOWDSK") {
    var keys = Object.keys(tmpState);

    for (var i = 0; i < keys.length; i++) {
      var obj = tmpState[keys[i]];
      if (obj && obj.hide == false) {
        obj = { ...obj };
        obj.max = false;
        obj.z = -1;
        tmpState[keys[i]] = obj;
      }
    }

    tmpState.hz = 2;
    return tmpState;
  } else if (action.type == "EXTERNAL") {
    window.open(action.payload, "_blank");
  } else if (action.type == "OPENTERM") {
    var obj = { ...tmpState["terminal"] };
    obj.dir = action.payload;

    obj.size = "full";
    obj.hide = false;
    obj.max = true;
    tmpState.hz += 1;
    obj.z = tmpState.hz;
    tmpState["terminal"] = obj;
    return tmpState;
  } else if (action.type == "ADDAPP") {
    tmpState[action.payload.icon] = action.payload;
    tmpState[action.payload.icon].size = "full";
    tmpState[action.payload.icon].hide = true;
    tmpState[action.payload.icon].max = null;
    tmpState[action.payload.icon].z = 0;

    return tmpState;
  } else if (action.type == "DELAPP") {
    delete tmpState[action.payload];
    return tmpState;
  } else {
    var keys = Object.keys(state);
    for (var i = 0; i < keys.length; i++) {
      var obj = state[keys[i]];
      if (obj.action == action.type) {
        tmpState = { ...state };
        obj = { ...obj };

        if (action.payload == "full") {
          // 打开应用时用固定尺寸的浮动窗口，不铺满整个桌面。
          obj.size = "cstm";
          obj.dim = obj.dim || {
            width: "min(820px, 82vw)",
            height: "min(560px, 72vh)",
            top: "12%",
            left: "15%",
          };
          obj.hide = false;
          obj.max = true;
          tmpState.hz += 1;
          obj.z = tmpState.hz;
        } else if (action.payload == "close") {
          obj.hide = true;
          obj.max = null;
          obj.z = -1;
        } else if (action.payload == "mxmz") {
          // 最大化 / 还原互切。还原时回到原来的浮动尺寸。
          if (obj.size == "full") {
            obj.size = obj.restoreSize || "cstm";
          } else {
            obj.restoreSize = obj.size;
            obj.size = "full";
          }
          obj.hide = false;
          obj.max = true;
          tmpState.hz += 1;
          obj.z = tmpState.hz;
        } else if (action.payload == "togg") {
          if (obj.z != tmpState.hz) {
            obj.hide = false;
            if (!obj.max) {
              tmpState.hz += 1;
              obj.z = tmpState.hz;
              obj.max = true;
              // 从最小化恢复时，还原最小化前记录的尺寸。
              if (obj.restoreSize) {
                obj.size = obj.restoreSize;
                delete obj.restoreSize;
              }
            } else {
              obj.z = -1;
              obj.max = false;
            }
          } else {
            obj.max = !obj.max;
            obj.hide = false;
            if (obj.max) {
              tmpState.hz += 1;
              obj.z = tmpState.hz;
            } else {
              obj.z = -1;
            }
          }
        } else if (action.payload == "mnmz") {
          // 最小化：真正隐藏窗口。恢复时由 togg 还原到最小化前的尺寸。
          obj.max = false;
          obj.hide = true;
          if (!obj.restoreSize) obj.restoreSize = obj.size;
          obj.z = -1;
        } else if (action.payload == "resize") {
          obj.size = "cstm";
          obj.hide = false;
          obj.max = true;
          if (obj.z != tmpState.hz) tmpState.hz += 1;
          obj.z = tmpState.hz;
          obj.dim = action.dim;
        } else if (action.payload == "front") {
          obj.hide = false;
          obj.max = true;
          if (obj.z != tmpState.hz) {
            tmpState.hz += 1;
            obj.z = tmpState.hz;
          }
        }

        tmpState[keys[i]] = obj;
        // 收敛 hz：始终等于当前可见窗口的最高 z。
        tmpState.hz = Math.max(topZ(tmpState), 2);
        return tmpState;
      }
    }
  }

  return state;
};

export default appReducer;
