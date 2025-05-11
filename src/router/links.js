// 友情链接路由配置
const linksRoutes = [
  {
    path: '/links',
    component: () => import('@/views/layout/index'),
    redirect: '/links/list',
    alwaysShow: true,
    name: 'Links',
    meta: { title: '友情链接', icon: 'link' },
    children: [
      {
        path: 'list',
        component: () => import('@/views/links/list'),
        name: 'LinksList',
        meta: { title: '链接管理', icon: 'list' }
      }
    ]
  }
]

export default linksRoutes 