export default {
  path: '/community',
  name: 'community',
  component: () => import('../view/routerHolder.vue'),
  meta: {
    title: '社区管理',
    icon: 'users-between-lines'
  },
  children: [
    {
      path: 'comments',
      name: 'communityComments',
      component: () => import('../view/community/comment/commentList.vue'),
      meta: {
        title: '评论管理',
        icon: 'comments'
      }
    },
    {
      path: 'activities',
      name: 'communityActivities',
      component: () => import('../view/EmptyPage.vue'),
      meta: {
        title: '活动管理',
        icon: 'calendar-days'
      }
    },
    {
      path: 'stats',
      name: 'communityStats',
      component: () => import('../view/EmptyPage.vue'),
      meta: {
        title: '互动统计',
        icon: 'chart-column'
      }
    }
  ]
}
