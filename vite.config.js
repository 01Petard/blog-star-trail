import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import { VERSIONS } from './shared/versions.js'

// 一律相对本配置文件解析，避免 cwd 差异导致路径漂移。
const at = p => fileURLToPath(new URL(p, import.meta.url))

// 「最新版本」= 版本清单最后一项。根跳转页的目标由它决定，新增版本无需改跳转页。
const latestPath = VERSIONS[VERSIONS.length - 1].path

// 一个版本 = 一个目录 = 一个独立 HTML 入口 = 一个独立 document。
// 这是「三版互不冲突」的基础：浏览器任一时刻只加载一个版本的 JS、全局 CSS 和 DOM，
// 同名 id / 全局样式 / window 事件监听 / document 副作用不会跨版本相遇。
//
// 入口 HTML 与源码同目录（vN/index.html + vN/main.js），所以 Vite 产物天然落在
// dist/vN/ 下，URL 就是 /vN/，无需产物重写。根 index.html 只做「跳到最新版本」。
const entries = {
  index: at('./index.html'),
  v1: at('./v1/index.html'),
  v2: at('./v2/index.html'),
  v3: at('./v3/index.html'),
}

/**
 * 根 index.html 里的 __LATEST_VERSION__ 占位符注入为最新版本路径。
 * 三个版本入口不含该占位符，原样返回。
 */
function latestVersionRedirect() {
  return {
    name: 'star-trail:latest-version-redirect',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        if (!html.includes('__LATEST_VERSION__'))
          return html
        return html.replaceAll('__LATEST_VERSION__', latestPath)
      },
    },
  }
}

/**
 * 每个版本的静态资源（img / audio / assets）跟着版本目录走，不再放 public/。
 *
 * 它们不是模块、也没有被 import，Vite 不会自动产出，因此构建后原样复制到 dist/vN/。
 * 只复制 vN/assets 下的顶层文件：vN/assets/css 是源码样式，已由 JS 打包进 dist/assets。
 * dev 下无需处理，Vite 直接以项目根为静态根提供 /vN/img/... 等路径。
 */
function copyVersionStatic() {
  const outDir = at('./dist')

  return {
    name: 'star-trail:copy-version-static',
    apply: 'build',
    closeBundle() {
      for (const { id } of VERSIONS) {
        for (const dir of ['img', 'audio', 'assets']) {
          const from = at(`./${id}/${dir}`)
          if (!existsSync(from))
            continue

          const to = path.join(outDir, id, dir)
          mkdirSync(to, { recursive: true })

          if (dir === 'assets') {
            for (const name of readdirSync(from)) {
              const src = path.join(from, name)
              if (statSync(src).isDirectory())
                continue
              cpSync(src, path.join(to, name))
            }
            continue
          }

          cpSync(from, to, { recursive: true })
        }
      }
    },
  }
}

export default defineConfig({
  base: '/',
  plugins: [
    vue({
      template: {
        // 三个版本的模板里图片都用 /vN/img/... 绝对路径，且资源随版本目录部署。
        // 关闭资源 URL 转换，避免 Vite 把它们打包进 dist/assets 后与 dist/vN/img 重复。
        transformAssetUrls: false,
      },
    }),
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
    latestVersionRedirect(),
    copyVersionStatic(),
  ],
  resolve: {
    // 只提供版本专属别名，刻意不保留通用 '@'：
    // 任何 import 都能一眼看出归属，编译期就杜绝跨版本误引。
    alias: {
      '@v1': at('./v1'),
      '@v2': at('./v2'),
      '@v3': at('./v3'),
      '@shared': at('./shared'),
    },
  },
  build: {
    rollupOptions: { input: entries },
  },
  server: {
    open: false,
  },
})
