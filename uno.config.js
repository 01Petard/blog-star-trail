// uno.config.ts
import { defineConfig, presetAttributify, presetIcons, presetMini, presetTypography, presetUno } from 'unocss'

export default defineConfig({
  content: {
    // 三个入口共用一份原子类 CSS（preset 相同、原子类语义一致，不会互相覆盖）。
    // 显式扫描全部版本源码，保证 v-html 字符串里的图标类名也能被生成。
    filesystem: [
      // 三版源码与各自的入口 HTML 都在 vN/ 下；根 index.html 只是跳转页。
      'v1/**/*.{vue,js,html}',
      'v2/**/*.{vue,js,html}',
      'v3/**/*.{vue,js,html}',
      'index.html',
    ],
    pipeline: {
      // 默认不扫描纯 .js/.ts，data.js 中的图标类名需要额外纳入扫描。
      include: [/\.(vue|svelte|[jt]sx|vine.ts|mdx?|astro|elm|php|phtml|marko|html|js)($|\?)/],
    },
  },
  presets: [
    // mini
    presetMini(),
    // 默认预设
    presetUno(),
    // 图标
    presetIcons(),
    // 属性化
    presetAttributify(),
    // 排版
    presetTypography(),
  ],
  rules: [
    // 自定义规则
    ['wv', { 'writing-mode': 'vertical-rl' }],
  ],
  shortcuts: [
    ['wh-full', 'w-full h-full'],
    ['f-b-c', 'flex justify-between items-center'],
    ['f-c-c', 'flex justify-center items-center'],
    ['flex-col', 'flex flex-col'],
    ['icon-btn', 'text-5 inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-primary !outline-none'],
  ],
})
