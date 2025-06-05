export default {
  path: '/analytics',
  name: 'analytics',
  component: () => import('../view/routerHolder.vue'),
  meta: {
    title: '统计分析',
    icon: 'chart-line'
  },
  children: [
    {
      path: 'traffic',
      name: 'trafficAnalytics',
      component: () => import('../view/analytics/traffic/index.vue'),
      meta: {
        title: '流量统计',
        icon: 'signal'
      }
    },
    {
      path: 'user',
      name: 'userAnalytics',
      component: () => import('../view/analytics/user/index.vue'),
      meta: {
        title: '用户分析',
        icon: 'user-group'
      }
    },
    {
      path: 'content',
      name: 'contentAnalytics',
      component: () => import('../view/analytics/content/index.vue'),
      meta: {
        title: '内容分析',
        icon: 'file-invoice'
      }
    },
    {
      path: 'trade',
      name: 'tradeAnalytics',
      component: () => import('../view/analytics/trade/index.vue'),
      meta: {
        title: '交易分析',
        icon: 'money-bill-trend-up'
      }
    }
  ]
}
