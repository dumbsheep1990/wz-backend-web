// 交易管理相关的 API 请求
import request from '../utils/request'

// 订单相关接口
/**
 * 获取当前用户的订单列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getUserOrders(params) {
  return request({
    url: '/api/v1/orders',
    method: 'get',
    params
  })
}

/**
 * 获取订单详情
 * @param {string} id - 订单ID
 * @returns {Promise}
 */
export function getOrderDetail(id) {
  return request({
    url: `/api/v1/orders/${id}`,
    method: 'get'
  })
}

/**
 * 创建订单
 * @param {Object} data - 订单数据
 * @returns {Promise}
 */
export function createOrder(data) {
  return request({
    url: '/api/v1/orders',
    method: 'post',
    data
  })
}

/**
 * 取消订单
 * @param {string} id - 订单ID
 * @param {Object} data - 取消原因等信息
 * @returns {Promise}
 */
export function cancelOrder(id, data) {
  return request({
    url: `/api/v1/orders/${id}/cancel`,
    method: 'post',
    data
  })
}

/**
 * 支付订单
 * @param {string} id - 订单ID
 * @param {Object} data - 支付方式等信息
 * @returns {Promise}
 */
export function payOrder(id, data) {
  return request({
    url: `/api/v1/orders/${id}/pay`,
    method: 'post',
    data
  })
}

// 退款相关接口
/**
 * 申请退款
 * @param {Object} data - 退款申请数据
 * @returns {Promise}
 */
export function applyRefund(data) {
  return request({
    url: '/api/v1/refunds',
    method: 'post',
    data
  })
}

/**
 * 获取当前用户的退款列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getUserRefunds(params) {
  return request({
    url: '/api/v1/refunds',
    method: 'get',
    params
  })
}

/**
 * 获取退款详情
 * @param {string} id - 退款ID
 * @returns {Promise}
 */
export function getRefundDetail(id) {
  return request({
    url: `/api/v1/refunds/${id}`,
    method: 'get'
  })
}

/**
 * 取消退款申请
 * @param {string} id - 退款ID
 * @returns {Promise}
 */
export function cancelRefund(id) {
  return request({
    url: `/api/v1/refunds/${id}/cancel`,
    method: 'post'
  })
}

// 交易记录相关接口
/**
 * 获取当前用户的交易记录
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getUserTransactions(params) {
  return request({
    url: '/api/v1/transactions',
    method: 'get',
    params
  })
}

// 支付方式相关接口
/**
 * 获取可用的支付方式列表
 * @returns {Promise}
 */
export function getPaymentMethods() {
  return request({
    url: '/api/v1/payments/methods',
    method: 'get'
  })
}

/**
 * 获取支付状态
 * @param {string} id - 支付ID
 * @returns {Promise}
 */
export function getPaymentStatus(id) {
  return request({
    url: `/api/v1/payments/${id}/status`,
    method: 'get'
  })
}

// 钱包相关接口
/**
 * 获取用户钱包余额
 * @returns {Promise}
 */
export function getWalletBalance() {
  return request({
    url: '/api/v1/wallet/balance',
    method: 'get'
  })
}

/**
 * 钱包充值
 * @param {Object} data - 充值数据
 * @returns {Promise}
 */
export function rechargeWallet(data) {
  return request({
    url: '/api/v1/wallet/recharge',
    method: 'post',
    data
  })
}

/**
 * 钱包提现
 * @param {Object} data - 提现数据
 * @returns {Promise}
 */
export function withdrawWallet(data) {
  return request({
    url: '/api/v1/wallet/withdraw',
    method: 'post',
    data
  })
} 