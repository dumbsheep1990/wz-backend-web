export default {
  path: '/user',
  name: 'user',
  component: () => import('@/view/routerHolder.vue'),
  meta: {
    title: '用户管理',
    icon: 'user'
  },
  children: [
    {
      path: 'admin',
      name: 'admin',
      component: () => import('@/view/user/index.vue'),
      meta: {
        title: '用户列表',
        icon: 'coordinate'
      }
    },
    {
      path: 'user-detail',
      name: 'UserDetail',
      component: () => import('@/view/superAdmin/user/userDetail.vue'),
      meta: {
        title: '用户详情',
        icon: 'user',
        hidden: true // 在侧边栏菜单中隐藏
      }
    },
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