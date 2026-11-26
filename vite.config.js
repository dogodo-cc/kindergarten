import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: {
        home: fileURLToPath(new URL("./index.html", import.meta.url)),
        activities: fileURLToPath(
          new URL("./activities.html", import.meta.url),
        ),
        growth: fileURLToPath(new URL("./growth.html", import.meta.url)),
      },
    },
  },
});
