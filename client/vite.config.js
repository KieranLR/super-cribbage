import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

// https://vitejs.dev/config/

const tunnelHost = process.env.VITE_TUNNEL_HOST;
export default defineConfig({
  optimizeDeps: {
      include: ['phaser'],
      force: true
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        editor: resolve(__dirname, 'editor.html'),
      },
    },
  },
  envDir: '../',
  server: {
    allowedHosts: tunnelHost
        ? ['localhost', '127.0.0.1', tunnelHost]
        : ['localhost', '127.0.0.1'],

    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
    hmr: tunnelHost
        ? {
          protocol: 'wss',
          host: tunnelHost,
          clientPort: 443,
        }
        : undefined,
  },
});

// export default ({ mode }) => {
//   return defineConfig({
//     envDir: '../',
//     server: {
//       allowedHosts: [
//         'basics-forums-acrylic-theories.trycloudflare.com',
//       ],
//       proxy: {
//         '/.proxy/api': {
//           target: 'http://localhost:3001',
//           changeOrigin: true,
//           secure: false,
//           ws: true,
//           rewrite: (path) => path.replace(/^\/\.proxy/, ''),
//         },
//       },
//       hmr: {
//         protocol: 'wss',
//         host: 'basics-forums-acrylic-theories.trycloudflare.com',
//         clientPort: 443,
//       },
//     },
//   });
// };
