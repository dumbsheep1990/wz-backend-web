export default {
  path: '/system',
  name: 'System',
  component: () => import('@/view/layout/routerView/parent.vue'),
  meta: {
    title: '系统管理',
    icon: 'setting'
  },
  children: [
    {
      path: 'systemConfig',
      name: 'SystemConfig',
      component: () => import('@/view/superAdmin/systemConfig/systemConfig.vue'),
      meta: {
        title: '系统配置',
        icon: 'setting',
        closeTab: false
      }
    },
    {
      path: 'jwt',
      name: 'Jwt',
      component: () => import('@/view/superAdmin/jwt/jwtBlacklist.vue'),
      meta: {
        title: 'JWT管理',
        icon: 'key',
        closeTab: false
      }
    }
  ]
} 