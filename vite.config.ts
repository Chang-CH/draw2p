import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode, ssrBuild }) => {
  if (command === "serve") {
    return {
      plugins: [react()],
    };
  }

  return {
    plugins: [react()],
    base: "/draw2p/",
  };
});

// export default defineConfig({
//   plugins: [react()],
// });
