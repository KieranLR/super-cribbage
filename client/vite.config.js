import { defineConfig } from 'vite';

// https://vitejs.dev/config/

const tunnelHost = process.env.VITE_TUNNEL_HOST;
export default defineConfig({
  envDir: '../',
  server: {
    allowedHosts: tunnelHost
        ? ['localhost', '127.0.0.1', tunnelHost]
        : ['localhost', '127.0.0.1'],

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
