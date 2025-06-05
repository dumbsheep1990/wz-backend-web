export default {
  path: '/content',
  name: 'content',
  component: () => import('../view/routerHolder.vue'),
  meta: {
    title: '内容管理',
    icon: 'file-alt'
  },
  children: [
    {
      path: 'category',
      name: 'categoryContent',
      component: () => import('../view/content/category/index.vue'),
      meta: {
        title: '分类管理',
        icon: 'folder-tree'
      }
    },
    {
      path: 'list',
      name: 'contentList',
      component: () => import('../view/content/article/index.vue'),
      meta: {
        title: '内容列表',
        icon: 'newspaper'
      }
    },
    {
      path: 'moderation',
      name: 'contentModeration',
      component: () => import('../view/EmptyPage.vue'),
      meta: {
        title: '内容审核',
        icon: 'shield-check'
      }
    },
    {
      path: 'template',
      name: 'contentTemplate',
      component: () => import('../view/systemTools/exportTemplate/exportTemplate.vue'),
      meta: {
        title: '内容模板',
        icon: 'puzzle-piece'
      }
    },
    {
      path: 'tag',
      name: 'tagContent',
      component: () => import('../view/content/tag/index.vue'),
      meta: {
        title: '标签管理',
        icon: 'tags'
      }
    },
    {
      path: 'comment',
      name: 'commentContent',
      component: () => import('../view/content/comment/index.vue'),
      meta: {
        title: '评论管理',
        icon: 'comments'
      }
    }
  ]
}