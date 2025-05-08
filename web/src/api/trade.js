import service from '@/utils/request'

// 获取订单列表
export const getOrderList = (params) => {
  return service({
    url: '/api/v1/admin/orders',
    method: 'get',
    params
  })
}

// 获取订单详情
export const getOrderDetail = (id) => {
  return service({
    url: `/api/v1/admin/orders/${id}`,
    method: 'get'
  })
}

// 更新订单状态
export const updateOrderStatus = (id, data) => {
  return service({
    url: `/api/v1/admin/orders/${id}/status`,
    method: 'put',
    data
  })
}

// 获取退款列表
export const getRefundList = (params) => {
  return service({
    url: '/api/v1/admin/refunds',
    method: 'get',
    params
  })
}

// 获取退款详情
export const getRefundDetail = (id) => {
  return service({
    url: `/api/v1/admin/refunds/${id}`,
    method: 'get'
  })
}

// 处理退款申请
export const processRefund = (id, data) => {
  return service({
    url: `/api/v1/admin/refunds/${id}/process`,
    method: 'put',
    data
  })
}

// 获取交易记录列表
export const getTransactionList = (params) => {
  return service({
    url: '/api/v1/admin/transactions',
    method: 'get',
    params
  })
}

// 获取财务报表
export const getFinancialReport = (params) => {
  return service({
    url: '/api/v1/admin/reports/financial',
    method: 'get',
    params
  })
} 