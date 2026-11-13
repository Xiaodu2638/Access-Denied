// 提示音：用 WebAudio 现场合成，不放任何音频文件。
// 浏览器要求先有一次用户手势才能出声，所以 installSoundUnlock() 在
// 第一次点击/按键时把 AudioContext 建好并 resume，之后的定时提示音才有效。

let ctx = null;

const ensureContext = () => {
  if (typeof window === "undefined") return null;
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return null;
  if (!ctx) {
    try {
      ctx = new AudioCtor();
    } catch (err) {
      ctx = null;
    }
  }
  return ctx;
};

export const installSoundUnlock = () => {
  if (typeof window === "undefined") return () => {};

  const unlock = () => {
    const audio = ensureContext();
    if (audio && audio.state === "suspended") {
      audio.resume().catch(() => {});
    }
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };

  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);

  return () => {
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
};

// 单个音符：短促的淡入淡出，避免爆音。
const blip = (audio, freq, start, duration, volume = 0.045, type = "sine") => {
  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
};

// 每种事件一个短动机。音量都很小，只是提示，不打断阅读。
const patterns = {
  // 调度消息：两声短促上行
  message: (audio, t) => {
    blip(audio, 880, t, 0.09, 0.05);
    blip(audio, 1174.66, t + 0.1, 0.12, 0.04);
  },
  // 邮件：三音小和弦
  mail: (audio, t) => {
    blip(audio, 523.25, t, 0.16, 0.04);
    blip(audio, 659.25, t + 0.09, 0.16, 0.035);
    blip(audio, 783.99, t + 0.18, 0.24, 0.03);
  },
  // 普通系统通知：单声
  notify: (audio, t) => {
    blip(audio, 784, t, 0.14, 0.035);
  },
  // 警告：两声下行
  warn: (audio, t) => {
    blip(audio, 659.25, t, 0.12, 0.04);
    blip(audio, 523.25, t + 0.12, 0.16, 0.035);
  },
  // 完成：上行两音
  done: (audio, t) => {
    blip(audio, 659.25, t, 0.13, 0.04);
    blip(audio, 880, t + 0.12, 0.2, 0.04);
  },
};

export const playSound = (kind = "notify") => {
  const audio = ensureContext();
  if (!audio) return false;

  if (audio.state === "suspended") {
    audio.resume().catch(() => {});
  }

  const pattern = patterns[kind] || patterns.notify;
  try {
    pattern(audio, audio.currentTime + 0.02);
    return true;
  } catch (err) {
    return false;
  }
};
