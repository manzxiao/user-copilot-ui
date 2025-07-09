import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [react(), dts()],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "UserCopilotUI",
      fileName: (format) => `index.${format}.js`,
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "axios"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          axios: "axios",
        },
      },
    },
  },
});
