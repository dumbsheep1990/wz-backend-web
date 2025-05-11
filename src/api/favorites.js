import request from '@/utils/request'

// 用户收藏API接口

// 创建收藏
export function createFavorite(data) {
  return request({
    url: '/api/v1/favorites',
    method: 'post',
    data
  })
}

// 获取收藏详情
export function getFavoriteById(id) {
  return request({
    url: `/api/v1/favorites/${id}`,
    method: 'get'
  })
}

// 获取用户收藏列表
export function listFavoritesByUser(params) {
  return request({
    url: '/api/v1/favorites',
    method: 'get',
    params
  })
}

// 删除用户收藏
export function deleteFavorite(id) {
  return request({
    url: `/api/v1/favorites/${id}`,
    method: 'delete'
  })
}

// 检查是否已收藏
export function checkFavorite(params) {
  return request({
    url: '/api/v1/favorites/check',
    method: 'get',
    params
  })
} 