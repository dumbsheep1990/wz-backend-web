export default {
  path: '/links',
  name: 'links',
  component: () => import('@/view/routerHolder.vue'),
  meta: {
    title: '友情链接',
    icon: 'link'
  },
  children: [
    {
      path: 'list',
      name: 'linksList',
      component: () => import('@/view/links/list.vue'),
      meta: {
        title: '友情链接管理',
        icon: 'list'
      }
    }
  ]
}