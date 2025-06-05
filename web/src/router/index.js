import { createRouter, createWebHashHistory } from 'vue-router'
// 主要业务模块路由
import dashboardRouter from './dashboard'
import userRouter from './user'
import contentRouter from './content'
import orderRouter from './order'
import tradeRouter from './trade'
import logisticsRouter from './logistics'
import communityRouter from './community'
import tenantRouter from './tenant'
import siteRouter from './site'
import columnRouter from './column'
import auditRouter from './audit'
import systemRouter from './system'
import searchRouter from './search'
import analyticsRouter from './analytics'
// 扩展业务模块路由
import adRouter from './ad'
import navigationRouter from './navigation'
import recommendRouter from './recommend'
import pointsRouter from './points'
import favoritesRouter from './favorites'
import linksRouter from './links'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
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
  // 按照后端DDD业务领域划分的路由
  dashboardRouter,   // 仪表盘
  
  // 核心业务管理
  userRouter,        // 用户管理
  contentRouter,     // 内容管理
  columnRouter,      // 栏目管理
  auditRouter,       // 审核管理
  communityRouter,   // 社区管理
  
  // 交易与物流
  orderRouter,       // 订单管理
  tradeRouter,       // 交易管理
  logisticsRouter,   // 物流管理
  
  // 网站功能与配置
  siteRouter,        // 网站管理
  navigationRouter,  // 导航管理
  tenantRouter,      // 租户管理
  
  // 营销与数据
  recommendRouter,   // 推荐系统
  adRouter,          // 广告管理
  searchRouter,      // 搜索管理
  pointsRouter,      // 积分管理
  favoritesRouter,   // 收藏管理
  linksRouter,       // 链接管理
  analyticsRouter,   // 统计分析
  
  // 系统配置
  systemRouter,      // 系统设置
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
