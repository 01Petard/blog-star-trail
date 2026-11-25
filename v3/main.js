/**
 * [INPUT]: 引入 Vue、星轨之下页面及共享切换器与 UnoCSS。
 * [OUTPUT]: 将页面挂载到 #app。
 * [POS]: v3 页面的独立入口。
 * [PROTOCOL]: Update this header on change, then check AGENTS.md
 */
import { createApp } from 'vue'
import App from '@v3/App.vue'
// 版本切换器：独立模块、独立 DOM 节点，不引用本版本任何内部代码。
import '@shared/js/switcher.js'

import '@shared/js/uno.js'
import '@v3/assets/css/main.css'

const app = createApp(App)

app.mount('#app')
