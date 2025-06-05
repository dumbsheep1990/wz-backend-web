export default {
  path: '/order',
  name: 'order',
  component: () => import('../view/routerHolder.vue'),
  meta: {
    title: '订单管理',
    icon: 'clipboard-list'
  },
  children: [
    {
      path: 'list',
      name: 'orderManagement',
      component: () => import('../view/trade/order/orderList.vue'),
      meta: {
        title: '订单列表',
        icon: 'list'
      }
    },
    {
      path: 'detail/:id',
      name: 'orderManagementDetail',
      component: () => import('../view/trade/order/orderDetail.vue'),
      meta: {
        title: '订单详情',
        icon: 'info-circle',
        hidden: true
      }
    },
    {
      path: 'pending',
      name: 'pendingOrders',
      component: () => import('../view/EmptyPage.vue'),
      meta: {
        title: '待处理订单',
        icon: 'clock'
      }
    },
    {
      path: 'completed',
      name: 'completedOrders',
      component: () => import('../view/EmptyPage.vue'),
      meta: {
        title: '已完成订单',
        icon: 'check-circle'
      }
    },
    {
      path: 'cancelled',
      name: 'cancelledOrders',
      component: () => import('../view/EmptyPage.vue'),
      meta: {
        title: '已取消订单',
        icon: 'ban'
      }
    },
    {
      path: 'export',
      name: 'exportOrders',
      component: () => import('../view/EmptyPage.vue'),
      meta: {
        title: '订单导出',
        icon: 'file-export'
      }
    }
  ]
}
