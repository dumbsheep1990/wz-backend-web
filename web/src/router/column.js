export default {
  path: '/column',
  name: 'column',
  component: () => import('../view/routerHolder.vue'),
  meta: {
    title: '栏目管理',
    icon: 'columns'
  },
  children: [
    {
      path: 'list',
      name: 'columnList',
      component: () => import('../view/EmptyPage.vue'),
      meta: {
        title: '栏目列表',
        icon: 'list'
      }
    },
    {
      path: 'category',
      name: 'columnCategory',
      component: () => import('../view/EmptyPage.vue'),
      meta: {
        title: '栏目分类',
        icon: 'sitemap'
      }
    },
    {
      path: 'template',
      name: 'columnTemplate',
      component: () => import('../view/EmptyPage.vue'),
      meta: {
        title: '栏目模板',
        icon: 'object-group'
      }
    },
    {
      path: 'permission',
      name: 'columnPermission',
      component: () => import('../view/EmptyPage.vue'),
      meta: {
        title: '栏目权限',
        icon: 'lock'
      }
    }
  ]
}
