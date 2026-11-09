/**
 * UnoCSS 唯一入口，三个版本共用。
 *
 * - 三份历史/当前配置的 preset 完全相同，原子类语义一致，合并成一份 CSS 不会互相覆盖；
 * - 类名覆盖由 uno.config.js 的 content.filesystem 扫描 v1|v2|v3 保证；
 * - 集中在一处 import，避免多入口构建时 virtual:uno.css 被重复导入的告警。
 */
import 'virtual:uno.css'
