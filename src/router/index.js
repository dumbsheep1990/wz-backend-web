import Vue from 'vue'
import Router from 'vue-router'

// 导入路由模块
import linksRoutes from './links'
import siteConfigRoutes from './site_config'
import statisticsRoutes from './statistics'
import userRoutes from './user'
import tradeRoutes from './modules/trade'

Vue.use(Router)

// 基础路由
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/',
    component: () => import('@/views/layout/index'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      }
    ]
  }
]

// 异步加载路由
export const asyncRoutes = [
  // 系统管理
  {
    path: '/system',
    component: () => import('@/views/layout/index'),
    redirect: '/system/user',
    alwaysShow: true,
    name: 'System',
    meta: { title: '系统管理', icon: 'setting' },
    children: [
      {
        path: 'user',
        component: () => import('@/views/system/user/index'),
        name: 'UserManage',
        meta: { title: '用户管理', icon: 'user' }
      },
      {
        path: 'role',
        component: () => import('@/views/system/role/index'),
        name: 'RoleManage',
        meta: { title: '角色管理', icon: 'peoples' }
      },
      {
        path: 'menu',
        component: () => import('@/views/system/menu/index'),
        name: 'MenuManage',
        meta: { title: '菜单管理', icon: 'tree-table' }
      }
    ]
  },
  
  // 整合友情链接路由
  ...linksRoutes,
  
  // 整合站点配置路由
  ...siteConfigRoutes,
  
  // 整合统计分析路由
  ...statisticsRoutes,
  
  // 整合用户相关路由
  ...userRoutes,
  
  // 整合交易管理路由
  ...tradeRoutes,
  
  // 404页面必须放在最后
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  mode: 'history',
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// 重置路由
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher
}

export default router 