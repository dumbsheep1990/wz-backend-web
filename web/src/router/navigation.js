export default {
  path: '/navigation',
  name: 'navigation',
  component: () => import('@/view/layout/routerView/layout.vue'),
  meta: {
    title: '导航管理',
    icon: 'compass'
  },
  children: [
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