export default {
  path: '/ad',
  name: 'ad',
  component: () => import('@/view/routerHolder.vue'),
  meta: {
    title: '广告管理',
    icon: 'advertisement'
  },
  children: [
    {
      path: 'space',
      name: 'adSpace',
      component: () => import('@/view/EmptyPage.vue'),
      meta: {
        title: '广告位管理',
        icon: 'rectangle-ad'
      }
    },
    {
      path: 'content',
      name: 'adContent',
      component: () => import('@/view/EmptyPage.vue'),
      meta: {
        title: '广告内容管理',
        icon: 'image-ad'
      }
    },
    {
      path: 'statistics',
      name: 'adStatistics',
      component: () => import('@/view/EmptyPage.vue'),
      meta: {
        title: '广告统计',
        icon: 'chart-line'
      }
    }
  ]
} 