import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import webExtension from "@samrum/vite-plugin-web-extension";
import * as path from "path";
import { getManifest } from "./src/manifest";

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [
      svelte(),
      webExtension({
        manifest: getManifest(),
      }),
    ],
    optimizeDeps: {
      include: ["highlight.js", "highlight.js/lib/core"],
    },
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      APP_VERSION: JSON.stringify(process.env.npm_package_version)
    }
  };
});
