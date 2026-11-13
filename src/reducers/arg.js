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

    case "ARG_PHASE": {
      const phase = action.payload;
      if (!["prologue", "remote", "aftermath"].includes(phase)) return state;

      const flags = { ...state.flags };

      // 擦除会销毁还没发出去的草稿：没发也没丢，就随机器一起没了。
      if (phase !== "remote" && !flags.mailSent && !flags.mailDiscarded) {
        flags.mailDestroyed = true;
      }

      tmp = { ...state, phase, flags };
      break;
    }

    case "ARG_HOST": {
      tmp = { ...state, host: action.payload || null };
      break;
    }

    case "ARG_HANDOVER_ADD": {
      const incoming = Array.isArray(action.payload)
        ? action.payload
        : [action.payload].filter(Boolean);
      const seen = new Set(
        state.handover.map((entry) => `${entry.host}:${entry.id}`),
      );
      const add = incoming.filter(
        (entry) =>
          entry && entry.host && entry.id && !seen.has(`${entry.host}:${entry.id}`),
      );
      if (!add.length) return state;
      tmp = {
        ...state,
        flags: { ...state.flags, handoverCopied: true },
        handover: [...state.handover, ...add],
      };
      break;
    }

    case "ARG_HANDOVER_REMOVE": {
      const { host, id } = action.payload || {};
      tmp = {
        ...state,
        handover: state.handover.filter(
          (entry) => !(entry.host === host && entry.id === id),
        ),
      };
      break;
    }

    case "ARG_OPEN_FILE": {
      tmp = { ...state, openFile: action.payload || null };
      break;
    }

    case "ARG_MAIL_OPEN": {
      // 打开草稿：只是记录玩家看到过，不启动任何计时。
      if (state.flags.mailSent || state.flags.mailDiscarded) return state;
      if (state.flags.mailDraftOpen) return state;
      tmp = {
        ...state,
        flags: { ...state.flags, mailDraftOpen: true },
      };
      break;
    }

    case "ARG_MAIL_SENT": {
      if (state.flags.mailSent) return state;
      tmp = {
        ...state,
        flags: { ...state.flags, mailSent: true, mailDraftOpen: true },
      };
      break;
    }

    case "ARG_MAIL_DISCARD": {
      if (state.flags.mailSent) return state;
      tmp = {
        ...state,
        flags: { ...state.flags, mailDiscarded: true, mailDraftOpen: true },
      };
      break;
    }

    case "ARG_CHAT_SEEN": {
      const id = action.payload;
      if (!id || state.chatSeen.includes(id)) return state;
      tmp = { ...state, chatSeen: [...state.chatSeen, id] };
      break;
    }

    case "ARG_MAIL_READ": {
      const id = action.payload;
      if (!id || state.readMail.includes(id)) return state;
      tmp = { ...state, readMail: [...state.readMail, id] };
      break;
    }

    case "ARG_TOAST_PUSH": {
      const item = action.payload;
      if (!item || !item.id) return state;
      if (state.toasts.some((toast) => toast.id === item.id)) return state;
      tmp = { ...state, toasts: [...state.toasts, item].slice(-4) };
      break;
    }

    case "ARG_TOAST_DROP": {
      tmp = {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.payload),
      };
      break;
    }

    case "ARG_MAIL_SEEN": {
      const id = action.payload;
      if (!id || state.mailSeen.includes(id)) return state;
      tmp = { ...state, mailSeen: [...state.mailSeen, id] };
      break;
    }

    case "ARG_OUTCOME": {
      tmp = { ...state, outcome: action.payload || null };
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
      tmp = { ...state, browserPage: action.payload || "oa" };
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

    case "ARG_RESET": {
      clearArgProgress();
      tmp = createDefaultProgress();
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
