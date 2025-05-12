import request from '@/utils/request'

// 管理员积分API接口

// 获取积分记录列表(管理员)
export function listPoints(params) {
  return request({
    url: '/api/v1/admin/points',
    method: 'get',
    params
  })
}

// 根据ID获取积分记录
export function getPointById(id) {
  return request({
    url: `/api/v1/admin/points/${id}`,
    method: 'get'
  })
}

// 获取用户积分明细
export function getUserPoints(userId) {
  return request({
    url: `/api/v1/admin/users/${userId}/points`,
    method: 'get'
  })
}

// 添加/调整用户积分
export function addPoints(data) {
  return request({
    url: '/api/v1/admin/points',
    method: 'post',
    data
  })
}

// 撤销积分调整
export function deletePoints(id) {
  return request({
    url: `/api/v1/admin/points/${id}`,
    method: 'delete'
  })
}

// 导出积分数据
export function exportPointsData(params) {
  return request({
    url: '/api/v1/admin/points/export',
    method: 'get',
    params,
    responseType: 'blob' // 设置响应类型为blob
  })
}

// 获取积分统计数据
export function getPointsStatistics(params) {
  return request({
    url: '/api/v1/admin/points/statistics',
    method: 'get',
    params
  })
}

// 批量导入积分
export function importPoints(data) {
  return request({
    url: '/api/v1/admin/points/import',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 积分规则设置
export function getPointsRules() {
  return request({
    url: '/api/v1/admin/points/rules',
    method: 'get'
  })
}

export function updatePointsRules(data) {
  return request({
    url: '/api/v1/admin/points/rules',
    method: 'put',
    data
  })
} 