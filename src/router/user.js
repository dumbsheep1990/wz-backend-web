// 用户相关功能路由配置
const userRoutes = [
  {
    path: '/user',
    component: () => import('@/view/layout/index'),
    redirect: '/user/message',
    alwaysShow: true,
    name: 'UserCenter',
    meta: { title: '用户中心', icon: 'user' },
    children: [
      {
        path: 'message',
        component: () => import('@/view/user/message/index'),
        name: 'UserMessage',
        meta: { title: '消息管理', icon: 'message' }
      },
      {
        path: 'points',
        component: () => import('@/view/user/points/index'),
        name: 'UserPoints',
        meta: { title: '积分管理', icon: 'star' }
      },
      {
        path: 'favorites',
        component: () => import('@/view/user/favorites/index'),
        name: 'UserFavorites',
        meta: { title: '收藏管理', icon: 'bookmark' }
      }
    ]
  }
]

export default userRoutes 