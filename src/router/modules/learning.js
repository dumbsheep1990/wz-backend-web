const learningRouter = {
  path: '/learning',
  component: () => import('@/views/layout/index'),
  meta: {
    title: '学习管理',
    icon: 'el-icon-reading'
  },
  children: [
    {
      path: 'teachers',
      name: 'Teachers',
      component: () => import('@/view/learning/teachers/index'),
      meta: {
        title: '教师管理',
        icon: 'el-icon-user',
        keepAlive: true,
        permissions: ['learning:teachers:view']
      }
    },
    {
      path: 'courses',
      name: 'Courses',
      component: () => import('@/view/learning/courses/index'),
      meta: {
        title: '课程管理',
        icon: 'el-icon-notebook-2',
        keepAlive: true,
        permissions: ['learning:courses:view']
      }
    },
    {
      path: 'categories',
      name: 'Categories',
      component: () => import('@/view/learning/categories/index'),
      meta: {
        title: '分类管理',
        icon: 'el-icon-collection-tag',
        keepAlive: true,
        permissions: ['learning:categories:view']
      }
    },
    {
      path: 'enrollments',
      name: 'Enrollments',
      component: () => import('@/view/learning/enrollments/index'),
      meta: {
        title: '报名管理',
        icon: 'el-icon-document-checked',
        keepAlive: true,
        permissions: ['learning:enrollments:view']
      }
    },
    {
      path: 'certificates',
      name: 'Certificates',
      component: () => import('@/view/learning/certificates/index'),
      meta: {
        title: '证书管理',
        icon: 'el-icon-medal',
        keepAlive: true,
        permissions: ['learning:certificates:view']
      }
    },
    {
      path: 'reviews',
      name: 'Reviews',
      component: () => import('@/view/learning/reviews/index'),
      meta: {
        title: '评价管理',
        icon: 'el-icon-chat-line-square',
        keepAlive: true,
        permissions: ['learning:reviews:view']
      }
    },
    {
      path: 'progress',
      name: 'Progress',
      component: () => import('@/view/learning/progress/index'),
      meta: {
        title: '学习进度',
        icon: 'el-icon-data-analysis',
        keepAlive: true,
        permissions: ['learning:progress:view']
      }
    }
  ]
}

export default learningRouter
