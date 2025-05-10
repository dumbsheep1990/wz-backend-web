export default {
  path: '/statistics',
  name: 'statistics',
  component: () => import('@/view/layout/routerView/layout.vue'),
  meta: {
    title: '统计分析',
    icon: 'chart-line'
  },
  children: [
    {
      path: 'overview',
      name: 'statsOverview',
      component: () => import('@/view/statistics/overview.vue'),
      meta: {
        title: '概览统计',
        icon: 'tachometer-alt'
      }
    },
    {
      path: 'content',
      name: 'contentStats',
      component: () => import('@/view/statistics/content.vue'),
      meta: {
        title: '内容统计',
        icon: 'file-alt'
      }
    },
    {
      path: 'user',
      name: 'userStats',
      component: () => import('@/view/statistics/user.vue'),
      meta: {
        title: '用户统计',
        icon: 'users'
      }
    }
  ]
} 