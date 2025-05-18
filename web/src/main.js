import './style/element_visiable.scss'
import 'element-plus/theme-chalk/dark/css-vars.css'
import { createApp } from 'vue'
import ElementPlus from 'element-plus'

import 'element-plus/dist/index.css'
// 引入gin-vue-admin前端初始化相关内容
import './core/gin-vue-admin'
// 引入封装的router
import router from '@/router/index'
import '@/permission'
import run from '@/core/gin-vue-admin.js'
import auth from '@/directive/auth'
import { store } from '@/pinia'
import App from './App.vue'
// 引入mock服务
import { setupMock } from '@/mock'
// 引入XHR拦截器
import { setupMockXHR } from './mock-xhr'

// 启用mock服务（强制开启，无论什么环境）
setupMock()

// 启用XHR拦截器，模拟所有API请求
setupMockXHR()

const app = createApp(App)
app.config.productionTip = false

app.use(run).use(ElementPlus).use(store).use(auth).use(router).mount('#app')
export default app
