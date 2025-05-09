export default {
  path: '/ad',
  name: 'ad',
  component: () => import('@/view/layout/routerView/layout.vue'),
  meta: {
    title: '广告管理',
    icon: 'advertisement'
  },
  children: [
    {
      path: 'space',
      name: 'adSpace',
      component: () => import('@/view/ad/adSpace/index.vue'),
      meta: {
        title: '广告位管理',
        icon: 'rectangle-ad'
      }
    },
    {
      path: 'content',
      name: 'adContent',
      component: () => import('@/view/ad/adContent/index.vue'),
      meta: {
        title: '广告内容管理',
        icon: 'image-ad'
      }
    },
    {
      path: 'statistics',
      name: 'adStatistics',
      component: () => import('@/view/ad/adStatistics/index.vue'),
      meta: {
        title: '广告统计',
        icon: 'chart-line'
      }
    }
  ]
} 