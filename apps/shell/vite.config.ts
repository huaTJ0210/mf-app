import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      federation({
        name: 'shell',
        remotes: {
          'system-admin': env.VITE_SYSTEM_ADMIN_REMOTE_URL || 'http://localhost:5001/assets/remoteEntry.js',
          business: env.VITE_BUSINESS_REMOTE_URL || 'http://localhost:5002/assets/remoteEntry.js',
        },
        shared: {
          vue: { singleton: true, requiredVersion: '^3.5.0' },
          'vue-router': { singleton: true, requiredVersion: '^4.5.0' },
          pinia: { singleton: true, requiredVersion: '^3.0.0' },
          'element-plus': { singleton: true, requiredVersion: '^2.14.0' },
          '@element-plus/icons-vue': { singleton: true, requiredVersion: '^2.3.1' },
          '@mf/shared': { singleton: true },
        },
      }),
      AutoImport({
        resolvers: [ElementPlusResolver()],
        imports: ['vue', 'vue-router', 'pinia'],
        dts: 'src/auto-imports.d.ts',
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        dts: 'src/components.d.ts',
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@mf/shared': fileURLToPath(new URL('../../packages/shared', import.meta.url)),
      },
    },
    server: {
      port: Number(env.VITE_PORT) || 5000,
      host: true,
      cors: true,
    },
    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]',
        },
      },
    },
  }
})
