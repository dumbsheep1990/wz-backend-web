import request from '@/utils/request'

// 创建支付订单
export const createPayment = (data) => {
  return request({
    url: '/api/v1/payments',
    method: 'post',
    data
  })
}

// 查询支付状态
export const queryPaymentStatus = (orderNo) => {
  return request({
    url: `/api/v1/payments/status/${orderNo}`,
    method: 'get'
  })
}

// 申请退款
export const refundPayment = (data) => {
  return request({
    url: '/api/v1/payments/refund',
    method: 'post',
    data
  })
}

// 获取支付记录
export const getPaymentByOrderNo = (orderNo) => {
  return request({
    url: `/api/v1/payments/order/${orderNo}`,
    method: 'get'
  })
}

// 获取支付统计
export const getPaymentStatistics = () => {
  return request({
    url: '/api/v1/payments/statistics',
    method: 'get'
  })
}

// 获取支付配置列表
export const getPaymentConfigs = () => {
  return request({
    url: '/api/v1/payment-configs',
    method: 'get'
  })
}

// 获取指定支付方式配置
export const getPaymentConfigByType = (type) => {
  return request({
    url: `/api/v1/payment-configs/${type}`,
    method: 'get'
  })
}

// 保存支付配置
export const savePaymentConfig = (data) => {
  return request({
    url: '/api/v1/payment-configs',
    method: 'post',
    data
  })
}

// 更新支付配置状态
export const updatePaymentConfigStatus = (id, status) => {
  return request({
    url: `/api/v1/payment-configs/${id}/status`,
    method: 'put',
    data: { status }
  })
}

// 删除支付配置
export const deletePaymentConfig = (id) => {
  return request({
    url: `/api/v1/payment-configs/${id}`,
    method: 'delete'
  })
} 