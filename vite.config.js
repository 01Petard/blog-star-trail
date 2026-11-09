import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'

// 一律相对本配置文件解析，避免 cwd 差异导致路径漂移。
const at = path => fileURLToPath(new URL(path, import.meta.url))

// 一个版本 = 一个独立 HTML 入口 = 一个独立 document。
// 这是「三版互不冲突」的基础：浏览器任一时刻只加载一个版本的 JS、全局 CSS 和 DOM，
// 同名 id / 全局样式 / window 事件监听 / document 副作用不会跨版本相遇。
const entries = {
  v3: at('./index.html'),
  v1: at('./v1/index.html'),
  v2: at('./v2/index.html'),
}

export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    UnoCSS(),
    Components({
      // 三版存在大量同名组件（MiniPlayer / StarTrails），禁止生成全局组件声明，
      // 否则 components.d.ts 会把不同版本的同名组件混在一起。
      dts: false,
      resolvers: [
        AntDesignVueResolver({
          importStyle: false, // css in js
        }),
      ],
    }),
  ],
  resolve: {
    // 只提供版本专属别名，刻意不保留通用 '@'：
    // 任何 import 都能一眼看出归属，编译期就杜绝跨版本误引。
    alias: {
      '@v1': at('./versions/v1'),
      '@v2': at('./versions/v2'),
      '@v3': at('./versions/v3'),
      '@shared': at('./versions/shared'),
    },
  },
  build: {
    rollupOptions: { input: entries },
  },
  server: {
    open: false,
  },
})
