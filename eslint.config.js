// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu({
  // Enable stylistic formatting rules
  // stylistic: true,

  // Or customize the stylistic rules
  stylistic: {
    indent: 2, // 4, or 'tab'
    quotes: 'single', // or 'double'
  },

  unocss: true,

  // TypeScript and Vue are auto-detected, you can also explicitly enable them:
  typescript: true,
  vue: true,

  // Disable jsonc and yaml support
  jsonc: true,
  yaml: true,

  // `.eslintignore` is no longer supported in Flat config, use `ignores` instead
  ignores: [
    './fixtures',
    // 1.0 / 2.0 是历史版本快照，保持原始代码风格，不参与格式化与静态检查。
    './versions/v1/**',
    './versions/v2/**',
    // ...globs
  ],

  // Use external formatters to format files that ESLint cannot handle yet (.css, .html, etc).
  formatters: {
    /**
     * Format CSS, LESS, SCSS files, also the `<style>` blocks in Vue
     * By default uses Prettier
     */
    css: true,
    /**
     * Format HTML files
     * By default uses Prettier
     */
    html: true,
    /**
     * Format Markdown files
     * Supports Prettier and dprint
     * By default uses Prettier
     */
    markdown: 'prettier',
  },
})
