export default {
  path: '/system',
  name: 'System',
  component: () => import('../view/routerHolder.vue'),
  meta: {
    title: '系统设置',
    icon: 'gear'
  },
  children: [
    {
      path: 'basic',
      name: 'BasicConfig',
      component: () => import('../view/superAdmin/systemConfig/systemConfig.vue'),
      meta: {
        title: '基础设置',
        icon: 'sliders'
      }
    },
    {
      path: 'security',
      name: 'SecurityConfig',
      component: () => import('../view/superAdmin/security/index.vue'),
      meta: {
        title: '安全设置',
        icon: 'shield'
      }
    },
    {
      path: 'api',
      name: 'ApiConfig',
      component: () => import('../view/superAdmin/api/index.vue'),
      meta: {
        title: 'API配置',
        icon: 'code'
      }
    },
    {
      path: 'cache',
      name: 'CacheConfig',
      component: () => import('../view/superAdmin/cache/index.vue'),
      meta: {
        title: '缓存管理',
        icon: 'database'
      }
    },
    {
      path: 'jwt',
      name: 'Jwt',
      component: () => import('../view/superAdmin/jwt/jwtBlacklist.vue'),
      meta: {
        title: 'JWT管理',
        icon: 'key'
      }
    }
  ]
}