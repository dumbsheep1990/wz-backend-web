export default {
  path: '/user',
  name: 'user',
  component: () => import('@/view/layout/routerView/layout.vue'),
  meta: {
    title: '用户管理',
    icon: 'user'
  },
  children: [
    {
      path: 'message',
      name: 'userMessage',
      component: () => import('@/view/user/message/index.vue'),
      meta: {
        title: '消息管理',
        icon: 'envelope'
      }
    },
    {
      path: 'points',
      name: 'userPoints',
      component: () => import('@/view/user/points/index.vue'),
      meta: {
        title: '积分管理',
        icon: 'coins'
      }
    },
    {
      path: 'favorites',
      name: 'userFavorites',
      component: () => import('@/view/user/favorites/index.vue'),
      meta: {
        title: '收藏管理',
        icon: 'star'
      }
    }
  ]
} 