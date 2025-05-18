export default {
  path: '/tenant',
  name: 'tenant',
  component: () => import('@/view/routerHolder.vue'),
  meta: {
    title: '租户管理',
    icon: 'office-building'
  },
  children: [
    {
      path: 'list',
      name: 'tenantList',
      component: () => import('@/view/tenant/index.vue'),
      meta: {
        title: '租户列表',
        icon: 'list'
      }
    },
    {
      path: 'create',
      name: 'createTenant',
      component: () => import('@/view/tenant/create.vue'),
      meta: {
        title: '创建租户',
        icon: 'plus'
      }
    },
    {
      path: 'detail/:id',
      name: 'tenantDetail',
      component: () => import('@/view/tenant/detail.vue'),
      meta: {
        title: '租户详情',
        icon: 'info-circle',
        hidden: true
      }
    },
    {
      path: 'edit/:id',
      name: 'editTenant',
      component: () => import('@/view/tenant/edit.vue'),
      meta: {
        title: '编辑租户',
        icon: 'edit',
        hidden: true
      }
    }
  ]
}
