export default {
  path: '/audit',
  name: 'audit',
  component: () => import('../view/routerHolder.vue'),
  meta: {
    title: '审核管理',
    icon: 'shield-halved'
  },
  children: [
    {
      path: 'article',
      name: 'auditArticle',
      component: () => import('../view/EmptyPage.vue'),
      meta: {
        title: '文章审核',
        icon: 'file-lines'
      }
    },
    {
      path: 'comment',
      name: 'auditComment',
      component: () => import('../view/EmptyPage.vue'),
      meta: {
        title: '评论审核',
        icon: 'comments'
      }
    },
    {
      path: 'user',
      name: 'auditUser',
      component: () => import('../view/EmptyPage.vue'),
      meta: {
        title: '用户审核',
        icon: 'user-check'
      }
    },
    {
      path: 'community',
      name: 'auditCommunity',
      component: () => import('../view/EmptyPage.vue'),
      meta: {
        title: '社区内容审核',
        icon: 'users-rectangle'
      }
    },
    {
      path: 'rules',
      name: 'auditRules',
      component: () => import('../view/EmptyPage.vue'),
      meta: {
        title: '审核规则',
        icon: 'book'
      }
    },
    {
      path: 'log',
      name: 'auditLog',
      component: () => import('../view/EmptyPage.vue'),
      meta: {
        title: '审核日志',
        icon: 'list-check'
      }
    }
  ]
}
