export default {
  path: '/navigation',
  name: 'navigation',
  component: () => import('@/view/routerHolder.vue'),
  meta: {
    title: '导航管理',
    icon: 'compass'
  },
  children: [
    {
      path: 'guide',
      name: 'navigationGuide',
      component: () => import('@/view/navigation/Guide.vue'),
      meta: {
        title: '导航指南',
        icon: 'book'
      }
    },
    {
      path: 'layout-switch',
      name: 'layoutSwitch',
      component: () => import('@/view/navigation/LayoutSwitch.vue'),
      meta: {
        title: '布局切换',
        icon: 'expand'
      }
    },
    {
      path: 'modern',
      name: 'modernNavigation',
      component: () => import('@/view/navigation/index.vue'),
      meta: {
        title: '现代化导航',
        icon: 'palette'
      }
    },
    {
      path: 'main',
      name: 'mainNavigation',
      component: () => import('@/view/navigation/main/index.vue'),
      meta: {
        title: '主导航配置',
        icon: 'list'
      }
    },
    {
      path: 'footer',
      name: 'footerNavigation',
      component: () => import('@/view/navigation/footer/index.vue'),
      meta: {
        title: '底部导航配置',
        icon: 'shoe-prints'
      }
    },
    {
      path: 'side',
      name: 'sideNavigation',
      component: () => import('@/view/navigation/side/index.vue'),
      meta: {
        title: '侧边导航配置',
        icon: 'indent'
      }
    }
  ]
}