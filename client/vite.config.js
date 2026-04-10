import { defineConfig } from 'vite';

// https://vitejs.dev/config/

export default defineConfig({
  envDir: '../',
  server: {
    allowedHosts: [
      'basics-forums-acrylic-theories.trycloudflare.com',
    ],
    proxy: {
      '/.proxy/assets': {
        target: 'http://localhost:5173/assets',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/.proxy\/assets/, ''),
        },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
    hmr: {
      clientPort: 443,
    },
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
//         '/.proxy/assets': {
//           target: 'http://localhost:5173/assets',
//           changeOrigin: true,
//           ws: true,
//           rewrite: (path) => path.replace(/^\/.proxy\/assets/, ''),
//         },
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
