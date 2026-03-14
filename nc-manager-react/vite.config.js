import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/segnalazioni/nc-manager-react/" : "/",
  esbuild: {
    jsxInject: "import React from 'react'"
  },
  server: {
    port: 5173,
    open: false
  }
}));
