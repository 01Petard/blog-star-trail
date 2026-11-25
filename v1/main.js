/**
 * [INPUT]: 引入 Vue、线性星轨页面及共享切换器与 UnoCSS。
 * [OUTPUT]: 将页面挂载到 #app。
 * [POS]: v1 页面的独立入口。
 * [PROTOCOL]: Update this header on change, then check AGENTS.md
 */
import { createApp } from 'vue'
import App from '@v1/App.vue'
// 版本切换器：独立模块、独立 DOM 节点，不引用本版本任何内部代码。
import '@shared/js/switcher.js'

import '@v1/assets/css/main.css'

import '@shared/js/uno.js'

const app = createApp(App)

app.mount('#app')
