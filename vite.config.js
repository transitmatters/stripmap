import { defineConfig } from 'vite';
import { resolve } from 'path';

import react from '@vitejs/plugin-react';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, "src", "index.ts"),
            name: "stripmap",
            filename: "stripmap",
        },
    },
    plugins: [react(), vanillaExtractPlugin()]
});