import styles from './switcher.css?inline'
import { currentVersionId, findVersion, nextVersion } from './versions.js'

/**
 * 版本切换器（临时单按钮形态）。
 *
 * 独立性保证：
 * - 不 import 任何 versions/v1|v2|v3 代码，不依赖 Vue / UnoCSS；
 * - 由各版本 main.js 以一行 import 引入，但挂载到独立的 #version-switcher 节点，
 *   与页面自身的 Vue 应用是两棵互不交叉的树；
 * - 样式以 ?inline 注入，全部选择器限定在 #version-switcher 内，不污染版本页面。
 *
 * 说明：刻意不放在 HTML 的第二个 <script type="module"> 里 —— 多入口构建时
 * Vite 可能把它并入共享 chunk 且不再生成 <script> 标签，执行时机不确定。
 * 由入口显式 import 则由 ESM 语义保证一定执行。
 */
const host = document.getElementById('version-switcher')

if (host && !host.dataset.stMounted) {
  host.dataset.stMounted = '1'

  const style = document.createElement('style')
  style.dataset.stSwitcher = ''
  style.textContent = styles
  document.head.appendChild(style)

  const current = findVersion(currentVersionId())
  const target = nextVersion(current.id)

  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'st-switcher'
  button.title = `当前 ${current.label} · ${current.name}，点击切换到 ${target.label} · ${target.name}`
  button.setAttribute('aria-label', button.title)
  button.innerHTML = `
    <span class="st-badge">${current.label}</span>
    <span class="st-copy">
      <span class="st-name">${current.name}</span>
      <span class="st-next">切换到 ${target.label} ›</span>
    </span>
  `

  button.addEventListener('click', () => {
    window.location.assign(target.path)
  })

  host.appendChild(button)
}
