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
        name: 'system-admin',
        // 暴露给宿主应用的组件
        exposes: {
          './UserList': './src/views/UserList.vue',
          './RoleList': './src/views/RoleList.vue',
          './MenuList': './src/views/MenuList.vue',
        },
        // 共享依赖（singleton 确保跨应用单例）
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
      port: Number(env.VITE_PORT) || 5001,
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
