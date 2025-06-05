export default {
  path: '/search',
  name: 'search',
  component: () => import('../view/routerHolder.vue'),
  meta: {
    title: '搜索管理',
    icon: 'magnifying-glass'
  },
  children: [
    {
      path: 'config',
      name: 'searchConfig',
      component: () => import('../view/search/config/index.vue'),
      meta: {
        title: '搜索配置',
        icon: 'sliders'
      }
    },
    {
      path: 'index',
      name: 'searchIndex',
      component: () => import('../view/search/index/index.vue'),
      meta: {
        title: '索引管理',
        icon: 'database'
      }
    },
    {
      path: 'popular',
      name: 'popularSearches',
      component: () => import('../view/search/popular/index.vue'),
      meta: {
        title: '热门搜索',
        icon: 'fire'
      }
    }
  ]
}
