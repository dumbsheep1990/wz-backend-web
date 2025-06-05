export default {
  path: '/tenant',
  name: 'tenant',
  component: () => import('../view/routerHolder.vue'),
  meta: {
    title: '租户管理',
    icon: 'building'
  },
  children: [
    {
      path: 'list',
      name: 'tenantList',
      component: () => import('../view/tenant/index.vue'),
      meta: {
        title: '租户列表',
        icon: 'list'
      }
    },
    {
      path: 'create',
      name: 'tenantCreate',
      component: () => import('../view/tenant/create/index.vue'),
      meta: {
        title: '创建租户',
        icon: 'plus'
      }
    },
    {
      path: 'config',
      name: 'tenantConfig',
      component: () => import('../view/tenant/config/index.vue'),
      meta: {
        title: '租户配置',
        icon: 'sliders'
      }
    },
    {
      path: 'stats',
      name: 'tenantStats',
      component: () => import('../view/tenant/index.vue'),
      meta: {
        title: '租户统计',
        icon: 'chart-bar'
      }
    },
    {
      path: 'detail/:id',
      name: 'tenantDetail',
      component: () => import('../view/tenant/detail.vue'),
      meta: {
        title: '租户详情',
        icon: 'info-circle',
        hidden: true
      }
    },
    {
      path: 'edit/:id',
      name: 'editTenant',
      component: () => import('../view/tenant/edit.vue'),
      meta: {
        title: '编辑租户',
        icon: 'edit',
        hidden: true
      }
    }
  ]
}
