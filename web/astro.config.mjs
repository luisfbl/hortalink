import {defineConfig} from "astro/config";
import node from "@astrojs/node";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
    output: "server",
    adapter: node({
        mode: "standalone"
    }),
    server: {
        hmr: {
            port: 80
        }
    },
    integrations: [react()],
    devToolbar: {
        enabled: false
    }
});