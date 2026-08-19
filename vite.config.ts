import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import netlifyPlugin from "@netlify/vite-plugin-tanstack-start";

export default defineConfig({
  plugins: [netlifyPlugin()],
});