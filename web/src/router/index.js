import { createRouter, createWebHashHistory } from 'vue-router'
import tradeRouter from './trade'
import adRouter from './ad'
import recommendRouter from './recommend'
import navigationRouter from './navigation'
import contentRouter from './content'
import linksRouter from './links'
import siteConfigRouter from './site_config'
import statisticsRouter from './statistics'
import userRouter from './user'
import systemRouter from './system'
// 新增路由模块
import favoritesRouter from './favorites'
import tenantRouter from './tenant'
// 以下路由文件还未创建完成
// import pointsRouter from './points'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/init',
    name: 'Init',
    component: () => import('@/view/init/index.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/view/login/index.vue')
  },
  tradeRouter,
  adRouter,
  recommendRouter,
  navigationRouter,
  contentRouter,
  linksRouter,
  siteConfigRouter,
  statisticsRouter,
  userRouter,
  systemRouter,
  // 新增路由模块
  favoritesRouter,
  tenantRouter,
  // 以下路由文件还未创建完成页面
  // pointsRouter,
  {
    path: '/scanUpload',
    name: 'ScanUpload',
    meta: {
      title: '扫码上传',
      client: true
    },
    component: () => import('@/view/example/upload/scanUpload.vue')
  },
  {
    path: '/:catchAll(.*)',
    meta: {
      closeTab: true
    },
    component: () => import('@/view/error/index.vue')
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
