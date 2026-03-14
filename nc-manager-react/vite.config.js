import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/segnalazioni/nc-manager-react/" : "/",
  server: {
    port: 5173,
    open: false
  }
}));
