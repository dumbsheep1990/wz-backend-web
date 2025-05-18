export default {
  path: '/favorites',
  name: 'favorites',
  component: () => import('@/view/routerHolder.vue'),
  meta: {
    title: '收藏管理',
    icon: 'star'
  },
  children: [
    {
      path: 'list',
      name: 'favoritesList',
      component: () => import('@/view/favorites/index.vue'),
      meta: {
        title: '收藏列表',
        icon: 'list'
      }
    },
    {
      path: 'detail/:id',
      name: 'favoritesDetail',
      component: () => import('@/view/favorites/detail.vue'),
      meta: {
        title: '收藏详情',
        icon: 'info-circle',
        hidden: true
      }
    },
    {
      path: 'statistics',
      name: 'favoritesStatistics',
      component: () => import('@/view/favorites/statistics.vue'),
      meta: {
        title: '收藏统计',
        icon: 'pie-chart'
      }
    },
    {
      path: 'user/:userId',
      name: 'userFavorites',
      component: () => import('@/view/favorites/user.vue'),
      meta: {
        title: '用户收藏',
        icon: 'user',
        hidden: true
      }
    }
  ]
}
