export default {
  path: '/points',
  name: 'points',
  component: () => import('@/view/routerHolder.vue'),
  meta: {
    title: '积分管理',
    icon: 'coin'
  },
  children: [
    {
      path: 'list',
      name: 'pointsList',
      component: () => import('@/view/EmptyPage.vue'),
      meta: {
        title: '积分记录',
        icon: 'list'
      }
    },
    {
      path: 'rules',
      name: 'pointsRules',
      component: () => import('@/view/EmptyPage.vue'),
      meta: {
        title: '积分规则',
        icon: 'setting'
      }
    },
    {
      path: 'statistics',
      name: 'pointsStatistics',
      component: () => import('@/view/EmptyPage.vue'),
      meta: {
        title: '积分统计',
        icon: 'data-line'
      }
    },
    {
      path: 'user/:userId',
      name: 'userPoints',
      component: () => import('@/view/EmptyPage.vue'),
      meta: {
        title: '用户积分',
        icon: 'user',
        hidden: true
      }
    }
  ]
}
