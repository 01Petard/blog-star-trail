/**
 * [INPUT]: 读取 versions.js 的版本顺序和 ../css/switcher.css 的作用域样式。
 * [OUTPUT]: 在 #version-switcher 中挂载常显按钮，点击跳转到下一版本。
 * [POS]: 由各版本入口引入，独立于 Vue 应用挂载。
 * [PROTOCOL]: Update this header on change, then check AGENTS.md
 */
import styles from '../css/switcher.css?inline'
import { currentVersionId, findVersion, nextVersion } from './versions.js'

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
