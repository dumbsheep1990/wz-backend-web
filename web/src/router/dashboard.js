export default {
  path: '/dashboard',
  name: 'dashboard',
  component: () => import('../view/routerHolder.vue'),
  meta: {
    title: '仪表盘',
    icon: 'house'
  },
  children: [
    {
      path: 'overview',
      name: 'dashboardOverview',
      component: () => import('../view/statistics/overview.vue'),
      meta: {
        title: '系统概览',
        icon: 'chart-line'
      }
    },
    {
      path: 'monitor',
      name: 'systemMonitor',
      component: () => import('../view/EmptyPage.vue'),
      meta: {
        title: '系统监控',
        icon: 'chart-simple'
      }
    }
  ]
}
