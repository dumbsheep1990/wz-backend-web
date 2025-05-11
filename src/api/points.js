import request from '@/utils/request'

// 用户积分API接口

// 创建积分记录
export function createPoints(data) {
  return request({
    url: '/api/v1/points',
    method: 'post',
    data
  })
}

// 获取积分记录详情
export function getPointsById(id) {
  return request({
    url: `/api/v1/points/${id}`,
    method: 'get'
  })
}

// 获取用户积分记录列表
export function listPointsByUser(params) {
  return request({
    url: '/api/v1/points',
    method: 'get',
    params
  })
}

// 获取用户总积分
export function getUserTotalPoints(userId) {
  return request({
    url: `/api/v1/points/users/${userId}/total`,
    method: 'get'
  })
} 