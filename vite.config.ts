import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

function siteBase(): string {
  const configured = process.env.BASE_PATH;
  if (!configured || configured === "/") return "/";
  return configured.endsWith("/") ? configured : `${configured}/`;
}

export default defineConfig({
  base: siteBase(),
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
});
