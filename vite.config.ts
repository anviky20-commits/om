import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const host = process.env.TAURI_DEV_HOST;

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    build: {
      target: 'esnext',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false,
          drop_debugger: true,
          passes: 2,
        },
        format: {
          comments: false,
        },
      },
      cssCodeSplit: true,
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('motion')) {
                return 'vendor-motion';
              }
              if (id.includes('jszip')) {
                return 'vendor-jszip';
              }
              return 'vendor-misc';
            }
            if (id.includes('calculatorConfig') || id.includes('CalculatorView')) {
              return 'feature-calculator';
            }
            if (id.includes('nepaliDate')) {
              return 'feature-date';
            }
            if (id.includes('exportHtml') || id.includes('exportManager')) {
              return 'feature-export';
            }
          },
        },
      },
    },
    clearScreen: false,
    server: {
      port: 3000,
      strictPort: true,
      host: host || '0.0.0.0',
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    envPrefix: ['VITE_', 'TAURI_ENV_*'],
  };
});
