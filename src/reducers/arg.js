import { createDefaultProgress } from "../data/arg";
import {
  clearArgProgress,
  loadArgProgress,
  saveArgProgress,
} from "../utils/arg";

const MAX_HISTORY = 200;

const defaults = createDefaultProgress();
const defState = loadArgProgress(defaults);

const normalizeHistory = (payload) => {
  if (typeof payload === "string") {
    return { cmd: payload, at: new Date().toISOString(), ok: true };
  }
  return {
    cmd: payload.cmd || "",
    at: payload.at || new Date().toISOString(),
    ok: payload.ok !== false,
  };
};

const argReducer = (state = defState, action) => {
  let tmp = state;

  switch (action.type) {
    case "ARG_FLAG": {
      const { flag, value } = action.payload || {};
      if (!flag) return state;
      tmp = {
        ...state,
        flags: { ...state.flags, [flag]: value !== false },
      };
      break;
    }

    case "ARG_FLAGS": {
      tmp = {
        ...state,
        flags: { ...state.flags, ...(action.payload || {}) },
      };
      break;
    }

    case "ARG_STAGE": {
      tmp = {
        ...state,
        stage: Math.max(state.stage, Number(action.payload) || 0),
      };
      break;
    }

    case "ARG_TERM_PUSH": {
      tmp = {
        ...state,
        terminalHistory: [
          ...state.terminalHistory,
          normalizeHistory(action.payload),
        ].slice(-MAX_HISTORY),
      };
      break;
    }

    case "ARG_TERM_CLEAR": {
      tmp = { ...state, terminalHistory: [] };
      break;
    }

    case "ARG_BROWSER": {
      tmp = { ...state, browserPage: action.payload || "github" };
      break;
    }

    case "ARG_NOTIF_SEEN": {
      if (state.notificationsSeen.includes(action.payload)) return state;
      tmp = {
        ...state,
        notificationsSeen: [...state.notificationsSeen, action.payload],
      };
      break;
    }

    case "ARG_ENDING": {
      if (!action.payload) {
        tmp = { ...state, ending: null };
        break;
      }
      tmp = { ...state, ending: action.payload, stage: 3 };
      break;
    }

    case "ARG_LOCK_OVERRIDE": {
      tmp = {
        ...state,
        lockOverride: {
          ...(state.lockOverride || {}),
          ...(action.payload || {}),
        },
      };
      break;
    }

    case "ARG_RESET": {
      clearArgProgress();
      tmp = createDefaultProgress();
      // 结局后重开时跳过引子，直接从锁屏开始。
      if (action.keepPrologue) tmp.flags.prologueSeen = true;
      saveArgProgress(tmp);
      return tmp;
    }

    case "ARG_SAVE": {
      tmp = { ...state };
      break;
    }

    default:
      return state;
  }

  saveArgProgress(tmp);
  return tmp;
};

export default argReducer;
