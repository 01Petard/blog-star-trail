import { createApp } from 'vue'
import App from '@v3/App.vue'
// 版本切换器：独立模块、独立 DOM 节点，不引用本版本任何内部代码。
import '@shared/switcher.js'

import '@shared/uno.js'
import '@v3/assets/css/main.css'

const app = createApp(App)

app.mount('#app')
