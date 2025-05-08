export default {
  path: '/trade',
  name: 'trade',
  component: () => import('@/view/layout/routerView/parent.vue'),
  meta: {
    title: '交易管理',
    icon: 'shopping-cart'
  },
  children: [
    {
      path: 'order',
      name: 'order',
      component: () => import('@/view/layout/routerView/parent.vue'),
      meta: {
        title: '订单管理',
        icon: 'tickets'
      },
      children: [
        {
          path: 'list',
          name: 'orderList',
          component: () => import('@/view/trade/order/orderList.vue'),
          meta: {
            title: '订单列表',
            icon: 'list'
          }
        },
        {
          path: 'detail/:id',
          name: 'orderDetail',
          component: () => import('@/view/trade/order/orderDetail.vue'),
          meta: {
            title: '订单详情',
            icon: 'data-analysis',
            hidden: true
          }
        }
      ]
    },
    {
      path: 'refund',
      name: 'refund',
      component: () => import('@/view/layout/routerView/parent.vue'),
      meta: {
        title: '退款管理',
        icon: 'money'
      },
      children: [
        {
          path: 'list',
          name: 'refundList',
          component: () => import('@/view/trade/refund/refundList.vue'),
          meta: {
            title: '退款列表',
            icon: 'list'
          }
        },
        {
          path: 'detail/:id',
          name: 'refundDetail',
          component: () => import('@/view/trade/refund/refundDetail.vue'),
          meta: {
            title: '退款详情',
            icon: 'data-analysis',
            hidden: true
          }
        }
      ]
    },
    {
      path: 'transaction',
      name: 'transactionList',
      component: () => import('@/view/trade/transaction/transactionList.vue'),
      meta: {
        title: '交易记录',
        icon: 'bank-card'
      }
    },
    {
      path: 'report',
      name: 'financialReport',
      component: () => import('@/view/trade/report/financialReport.vue'),
      meta: {
        title: '财务报表',
        icon: 'pie-chart'
      }
    }
  ]
} 