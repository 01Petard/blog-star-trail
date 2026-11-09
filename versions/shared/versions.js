/**
 * 版本清单 —— 全站唯一维护点。
 * 新增版本时：建 versions/vX/ + 根目录 vX/index.html + vite.config.js 的 entries，
 * 再在此数组补一项即可，无需改动任何已有版本的代码。
 *
 * path 为站点根绝对路径，必须与 vite.config.js 的 rollup input 文件名对应。
 */
export const VERSIONS = Object.freeze([
  Object.freeze({ id: 'v1', label: 'v1', name: '线性星轨', path: '/v1/' }),
  Object.freeze({ id: 'v2', label: 'v2', name: '彩色星轨', path: '/v2/' }),
  Object.freeze({ id: 'v3', label: 'v3', name: '星轨之下', path: '/' }),
])

/** 由当前 URL 判定所处版本；根路径及其余情况均归入 3.0。 */
export function currentVersionId() {
  const { pathname } = window.location
  const matched = VERSIONS.find(
    item => item.path !== '/' && (pathname === item.path || pathname.startsWith(item.path)),
  )
  return matched?.id ?? 'v3'
}

/** 循环到下一个版本，供「单按钮」临时切换交互使用。 */
export function nextVersion(id) {
  const index = VERSIONS.findIndex(item => item.id === id)
  return VERSIONS[(index + 1) % VERSIONS.length]
}

export function findVersion(id) {
  return VERSIONS.find(item => item.id === id) ?? VERSIONS[VERSIONS.length - 1]
}
