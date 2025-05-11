// 统计分析路由配置
const statisticsRoutes = [
  {
    path: '/statistics',
    component: () => import('@/views/layout/index'),
    redirect: '/statistics/overview',
    alwaysShow: true,
    name: 'Statistics',
    meta: { title: '统计分析', icon: 'chart' },
    children: [
      {
        path: 'overview',
        component: () => import('@/views/statistics/overview'),
        name: 'StatsOverview',
        meta: { title: '数据概览', icon: 'dashboard' }
      },
      {
        path: 'content',
        component: () => import('@/views/statistics/content'),
        name: 'ContentStats',
        meta: { title: '内容统计', icon: 'documentation' }
      },
      {
        path: 'user',
        component: () => import('@/views/statistics/user'),
        name: 'UserStats',
        meta: { title: '用户统计', icon: 'peoples' }
      }
    ]
  }
]

export default statisticsRoutes 