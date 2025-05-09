export default {
  path: '/recommend',
  name: 'recommend',
  component: () => import('@/view/layout/routerView/layout.vue'),
  meta: {
    title: '推荐系统',
    icon: 'thumbs-up'
  },
  children: [
    {
      path: 'rules',
      name: 'recommendRules',
      component: () => import('@/view/recommend/rules/index.vue'),
      meta: {
        title: '推荐规则管理',
        icon: 'tools'
      }
    },
    {
      path: 'hotContent',
      name: 'hotContent',
      component: () => import('@/view/recommend/hotContent/index.vue'),
      meta: {
        title: '热门内容管理',
        icon: 'fire'
      }
    },
    {
      path: 'hotKeywords',
      name: 'hotKeywords',
      component: () => import('@/view/recommend/hotKeywords/index.vue'),
      meta: {
        title: '热门关键词',
        icon: 'tag'
      }
    },
    {
      path: 'hotCategories',
      name: 'hotCategories',
      component: () => import('@/view/recommend/hotCategories/index.vue'),
      meta: {
        title: '热门分类',
        icon: 'folder'
      }
    }
  ]
} 