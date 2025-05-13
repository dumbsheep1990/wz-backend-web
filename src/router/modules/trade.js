const tradeRouter = {
  path: '/trade',
  component: () => import('@/views/layout/index'),
  meta: {
    title: '交易管理',
    icon: 'el-icon-shopping-cart-full'
  },
  children: [
    {
      path: 'orders',
      name: 'Orders',
      component: () => import('@/view/trade/orders/index'),
      meta: {
        title: '订单管理',
        icon: 'el-icon-tickets',
        keepAlive: true,
        permissions: ['orders:view']
      }
    },
    {
      path: 'payment-config',
      name: 'PaymentConfig',
      component: () => import('@/view/trade/payment/config'),
      meta: {
        title: '支付配置',
        icon: 'el-icon-money',
        keepAlive: true,
        permissions: ['payment:config']
      }
    }
  ]
}

export default tradeRouter 