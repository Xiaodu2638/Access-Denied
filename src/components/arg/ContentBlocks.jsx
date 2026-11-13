import React, { useEffect, useRef, useState } from "react";
import "./content.scss";

// 复制一段文本。clipboard API 只在安全上下文（https / localhost）可用，
// 所以保留 textarea + execCommand 的回退，避免 http 环境下点了没反应。
const copyText = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    // 落到下面的回退
  }

  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch (err) {
    return false;
  }
};

// 可复制的代码块。
// 文本本身可以被选中、复制；复制按钮只是给不想手动选的人一个快捷方式。
// 点正文不会触发复制。
const CodeBlock = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  const raw = String(text ?? "");
  const multiline = raw.includes("\n");

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const copy = async () => {
    const ok = await copyText(raw);
    if (!ok) return;
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div
      className="arg-code-wrap"
      data-multiline={multiline ? "true" : "false"}
      data-copied={copied ? "true" : "false"}
    >
      <pre className="arg-block-code">{raw}</pre>
      <button
        type="button"
        className="arg-code-copy"
        aria-label={copied ? "已复制" : "复制"}
        onClick={copy}
      >
        {copied ? "已复制" : "复制"}
      </button>
    </div>
  );
};

// 剧情 block 渲染器。日记、文件预览、浏览器页面共用。
export const ContentBlocks = ({ blocks, className = "" }) => {
  if (!blocks || !blocks.length) return null;

  return (
    <div className={"arg-blocks " + className}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "h":
            return (
              <h3 key={index} className="arg-block-h">
                {block.text}
              </h3>
            );
          case "code":
            return <CodeBlock key={index} text={block.text} />;
          case "quote":
            return (
              <blockquote key={index} className="arg-block-quote">
                {block.text}
              </blockquote>
            );
          case "hint":
            return (
              <div key={index} className="arg-block-hint">
                {block.text}
              </div>
            );
          case "meta":
            return (
              <div key={index} className="arg-block-meta">
                {block.text}
              </div>
            );
          default:
            return (
              <p key={index} className="arg-block-p">
                {block.text}
              </p>
            );
        }
      })}
    </div>
  );
};

export default ContentBlocks;
