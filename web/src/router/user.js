export default {
  path: '/user',
  name: 'user',
  component: () => import('../view/routerHolder.vue'),
  meta: {
    title: '用户管理',
    icon: 'user'
  },
  children: [
    {
      path: 'list',
      name: 'userList',
      component: () => import('../view/user/index.vue'),
      meta: {
        title: '用户列表',
        icon: 'users'
      }
    },
    {
      path: 'roles',
      name: 'userRoles',
      component: () => import('../view/EmptyPage.vue'),
      meta: {
        title: '用户角色',
        icon: 'user-tag'
      }
    },
    {
      path: 'points',
      name: 'userPoints',
      component: () => import('../view/user/points/index.vue'),
      meta: {
        title: '用户积分',
        icon: 'coins'
      }
    },
    {
      path: 'favorites',
      name: 'userFavorites',
      component: () => import('../view/user/favorites/index.vue'),
      meta: {
        title: '用户收藏',
        icon: 'star'
      }
    },
    {
      path: 'message',
      name: 'userMessage',
      component: () => import('../view/user/message/index.vue'),
      meta: {
        title: '用户消息',
        icon: 'envelope'
      }
    },
    {
      path: 'user-detail',
      name: 'userDetail',
      component: () => import('../view/superAdmin/user/userDetail.vue'),
      meta: {
        title: '用户详情',
        icon: 'user',
        hidden: true
      }
    }
  ]
}