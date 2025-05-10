export default {
  path: '/site',
  name: 'site',
  component: () => import('@/view/layout/routerView/layout.vue'),
  meta: {
    title: '站点设置',
    icon: 'cog'
  },
  children: [
    {
      path: 'config',
      name: 'siteConfig',
      component: () => import('@/view/site/config.vue'),
      meta: {
        title: '站点配置',
        icon: 'sliders'
      }
    },
    {
      path: 'theme',
      name: 'themeConfig',
      component: () => import('@/view/site/theme.vue'),
      meta: {
        title: '主题管理',
        icon: 'palette'
      }
    }
  ]
} 