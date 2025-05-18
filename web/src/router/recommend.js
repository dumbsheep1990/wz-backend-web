export default {
  path: '/recommend',
  name: 'recommend',
  component: () => import('@/view/routerHolder.vue'),
  meta: {
    title: '推荐系统',
    icon: 'thumbs-up'
  },
  children: [
    {
      path: 'rules',
      name: 'recommendRules',
      component: () => import('@/view/EmptyPage.vue'),
      meta: {
        title: '推荐规则管理',
        icon: 'tools'
      }
    },
    {
      path: 'hotContent',
      name: 'hotContent',
      component: () => import('@/view/EmptyPage.vue'),
      meta: {
        title: '热门内容管理',
        icon: 'fire'
      }
    },
    {
      path: 'hotKeywords',
      name: 'hotKeywords',
      component: () => import('@/view/EmptyPage.vue'),
      meta: {
        title: '热门关键词',
        icon: 'tag'
      }
    },
    {
      path: 'hotCategories',
      name: 'hotCategories',
      component: () => import('@/view/EmptyPage.vue'),
      meta: {
        title: '热门分类',
        icon: 'folder'
      }
    }
  ]
} 