import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const config = ({ mode }) => {
  // GitHub Pages 的项目站点部署在 /<repo>/ 下。
  // 本地开发和 Tauri 打包仍然用相对路径。
  // 部署时由 CI 传入 VITE_BASE=/<repo>/。
  const base = process.env.VITE_BASE || "";

  return defineConfig({
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        // 不生成上游项目名的 manifest。
        manifest: {
          name: "未授权访问 · ACCESS DENIED",
          short_name: "未授权访问",
          description: "会话恢复中。上次登录：2031-04-19 03:42。",
          start_url: ".",
          scope: ".",
          display: "standalone",
          theme_color: "#05070a",
          background_color: "#05070a",
          icons: [
            {
              src: "favicon.ico",
              sizes: "64x64 32x32 24x24 16x16",
              type: "image/x-icon",
            },
            {
              src: "favicon.png",
              sizes: "174x174",
              type: "image/png",
            },
          ],
        },
      }),
    ],
    base,
    define: {
      "process.env.NODE_ENV": `"${mode}"`,
    },
    build: {
      outDir: "build",
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            return "vendor";
          },
        },
      },
    },
  });
};

export default config;
