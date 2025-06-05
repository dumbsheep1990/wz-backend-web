export default {
  path: '/logistics',
  name: 'logistics',
  component: () => import('../view/routerHolder.vue'),
  meta: {
    title: '物流管理',
    icon: 'truck'
  },
  children: [
    {
      path: 'shipping',
      name: 'shipping',
      component: () => import('../view/EmptyPage.vue'),
      meta: {
        title: '发货管理',
        icon: 'box'
      }
    },
    {
      path: 'tracking',
      name: 'tracking',
      component: () => import('../view/EmptyPage.vue'),
      meta: {
        title: '物流跟踪',
        icon: 'location-dot'
      }
    },
    {
      path: 'return',
      name: 'return',
      component: () => import('../view/EmptyPage.vue'),
      meta: {
        title: '退货管理',
        icon: 'rotate-left'
      }
    },
    {
      path: 'company',
      name: 'logisticsCompany',
      component: () => import('../view/EmptyPage.vue'),
      meta: {
        title: '物流公司',
        icon: 'building'
      }
    },
    {
      path: 'settings',
      name: 'logisticsSettings',
      component: () => import('../view/EmptyPage.vue'),
      meta: {
        title: '物流设置',
        icon: 'gear'
      }
    }
  ]
}
