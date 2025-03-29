import { defineConfig } from 'vite';
import { resolve } from 'path';

import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { externalizeDeps } from 'vite-plugin-externalize-deps';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src', 'index.ts'),
            name: 'stripmap',
            filename: 'stripmap',
        },
    },
    plugins: [react(), vanillaExtractPlugin(), dts({ rollupTypes: true }), externalizeDeps()],
});
