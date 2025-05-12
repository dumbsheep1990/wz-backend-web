import request from '@/utils/request'

// 管理员收藏API接口

// 获取收藏记录列表(管理员)
export function listFavorites(params) {
  return request({
    url: '/api/v1/admin/favorites',
    method: 'get',
    params
  })
}

// 获取收藏详情
export function getFavoriteDetail(id) {
  return request({
    url: `/api/v1/admin/favorites/${id}`,
    method: 'get'
  })
}

// 删除收藏记录
export function deleteFavorite(id) {
  return request({
    url: `/api/v1/admin/favorites/${id}`,
    method: 'delete'
  })
}

// 导出收藏数据
export function exportFavoritesData(params) {
  return request({
    url: '/api/v1/admin/favorites/export',
    method: 'get',
    params,
    responseType: 'blob' // 设置响应类型为blob
  })
}

// 获取收藏统计数据
export function getFavoritesStatistics() {
  return request({
    url: '/api/v1/admin/favorites/statistics',
    method: 'get'
  })
}

// 获取热门收藏内容
export function getHotContent() {
  return request({
    url: '/api/v1/admin/favorites/hot',
    method: 'get'
  })
}

// 获取收藏趋势数据
export function getFavoritesTrend(period) {
  return request({
    url: '/api/v1/admin/favorites/trend',
    method: 'get',
    params: { period }
  })
}

// 批量删除收藏记录
export function batchDeleteFavorites(ids) {
  return request({
    url: '/api/v1/admin/favorites/batch',
    method: 'delete',
    data: { ids }
  })
}

// 获取用户的收藏列表
export function getUserFavorites(userId, params) {
  return request({
    url: `/api/v1/admin/users/${userId}/favorites`,
    method: 'get',
    params
  })
} 