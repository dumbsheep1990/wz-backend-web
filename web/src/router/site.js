export default {
  path: '/site',
  name: 'site',
  component: () => import('../view/routerHolder.vue'),
  meta: {
    title: '网站管理',
    icon: 'globe'
  },
  children: [
    {
      path: 'pages',
      name: 'sitePages',
      component: () => import('../view/site/pages/index.vue'),
      meta: {
        title: '页面管理',
        icon: 'file-lines'
      }
    },
    {
      path: 'navigation',
      name: 'siteNavigation',
      component: () => import('../view/site/navigation/index.vue'),
      meta: {
        title: '导航管理',
        icon: 'bars'
      }
    },
    {
      path: 'theme',
      name: 'siteTheme',
      component: () => import('../view/site/theme/index.vue'),
      meta: {
        title: '主题管理',
        icon: 'palette'
      }
    },
    {
      path: 'components',
      name: 'siteComponents',
      component: () => import('../view/site/components/index.vue'),
      meta: {
        title: '组件管理',
        icon: 'puzzle-piece'
      }
    },
    {
      path: 'links',
      name: 'siteLinks',
      component: () => import('../view/site/links/index.vue'),
      meta: {
        title: '链接管理',
        icon: 'link'
      }
    }
  ]
}
