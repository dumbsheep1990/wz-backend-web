import request from '@/utils/request'

// 获取订单列表
export const listOrders = (params) => {
  return request({
    url: '/api/v1/orders',
    method: 'get',
    params
  })
}

// 获取订单详情
export const getOrderDetail = (id) => {
  return request({
    url: `/api/v1/orders/${id}`,
    method: 'get'
  })
}

// 取消订单
export const cancelOrder = (id) => {
  return request({
    url: `/api/v1/orders/${id}/cancel`,
    method: 'put'
  })
}

// 订单发货
export const shipOrder = (id, data) => {
  return request({
    url: `/api/v1/orders/${id}/ship`,
    method: 'put',
    data
  })
}

// 确认收货
export const confirmReceipt = (id) => {
  return request({
    url: `/api/v1/orders/${id}/confirm`,
    method: 'put'
  })
}

// 申请退款
export const refundOrder = (id, data) => {
  return request({
    url: `/api/v1/orders/${id}/refund`,
    method: 'post',
    data
  })
}

// 删除订单
export const deleteOrder = (id) => {
  return request({
    url: `/api/v1/orders/${id}`,
    method: 'delete'
  })
}

// 导出订单数据
export const exportOrdersData = (params) => {
  return request({
    url: '/api/v1/orders/export',
    method: 'post',
    data: params,
    responseType: 'blob'
  })
}

// 获取订单统计信息
export const getOrdersStatistics = () => {
  return request({
    url: '/api/v1/orders/statistics',
    method: 'get'
  })
}

// 获取订单状态统计
export const getStatusStatistics = () => {
  return request({
    url: '/api/v1/orders/status-statistics',
    method: 'get'
  })
}

// 获取支付方式统计
export const getPaymentTypeStatistics = () => {
  return request({
    url: '/api/v1/orders/payment-statistics',
    method: 'get'
  })
}

// 获取订单趋势
export const getOrdersTrend = (period) => {
  return request({
    url: '/api/v1/orders/trend',
    method: 'get',
    params: { period }
  })
} 