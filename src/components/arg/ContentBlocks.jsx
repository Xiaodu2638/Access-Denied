import React from "react";
import "./content.scss";

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
            return (
              <pre key={index} className="arg-block-code">
                {block.text}
              </pre>
            );
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
