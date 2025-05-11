import request from '@/utils/request'

// 友情链接API接口

// 创建友情链接
export function createLink(data) {
  return request({
    url: '/api/v1/links',
    method: 'post',
    data
  })
}

// 获取友情链接详情
export function getLinkById(id) {
  return request({
    url: `/api/v1/links/${id}`,
    method: 'get'
  })
}

// 获取友情链接列表
export function listLinks(params) {
  return request({
    url: '/api/v1/links',
    method: 'get',
    params
  })
}

// 更新友情链接
export function updateLink(id, data) {
  return request({
    url: `/api/v1/links/${id}`,
    method: 'put',
    data
  })
}

// 删除友情链接
export function deleteLink(id) {
  return request({
    url: `/api/v1/links/${id}`,
    method: 'delete'
  })
} 