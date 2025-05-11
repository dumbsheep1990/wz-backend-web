// 站点配置路由配置
const siteConfigRoutes = [
  {
    path: '/site',
    component: () => import('@/views/layout/index'),
    redirect: '/site/config',
    alwaysShow: true,
    name: 'Site',
    meta: { title: '站点管理', icon: 'global' },
    children: [
      {
        path: 'config',
        component: () => import('@/views/site/config'),
        name: 'SiteConfig',
        meta: { title: '站点配置', icon: 'setting' }
      },
      {
        path: 'theme',
        component: () => import('@/views/site/theme'),
        name: 'ThemeManage',
        meta: { title: '主题管理', icon: 'theme' }
      }
    ]
  }
]

export default siteConfigRoutes 