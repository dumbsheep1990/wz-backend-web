import request from '@/utils/request'

// 链接管理API接口

// 获取链接列表
export function getLinkList(params) {
  return request({
    url: '/api/v1/admin/links',
    method: 'get',
    params
  })
}

// 创建链接
export function createLink(data) {
  return request({
    url: '/api/v1/admin/links',
    method: 'post',
    data
  })
}

// 获取链接详情
export function getLinkDetail(id) {
  return request({
    url: `/api/v1/admin/links/${id}`,
    method: 'get'
  })
}

// 更新链接
export function updateLink(id, data) {
  return request({
    url: `/api/v1/admin/links/${id}`,
    method: 'put',
    data
  })
}

// 删除链接
export function deleteLink(id) {
  return request({
    url: `/api/v1/admin/links/${id}`,
    method: 'delete'
  })
}

// 验证链接有效性
export function verifyLink(id) {
  return request({
    url: `/api/v1/admin/links/${id}/verify`,
    method: 'post'
  })
}

// 批量验证链接
export function batchVerifyLinks(data) {
  return request({
    url: '/api/v1/admin/links/batch-verify',
    method: 'post',
    data
  })
}

// 获取链接分类列表
export function getLinkCategories() {
  return request({
    url: '/api/v1/admin/links/categories',
    method: 'get'
  })
}

// 更新链接排序
export function updateLinkSort(data) {
  return request({
    url: '/api/v1/admin/links/sort',
    method: 'put',
    data
  })
}

// 启用链接
export function enableLink(id) {
  return updateLink(id, { is_active: true })
}

// 禁用链接
export function disableLink(id) {
  return updateLink(id, { is_active: false })
}

// 批量启用链接
export function batchEnableLinks(ids) {
  return request({
    url: '/api/v1/admin/links/batch-enable',
    method: 'post',
    data: { ids }
  })
}

// 批量禁用链接
export function batchDisableLinks(ids) {
  return request({
    url: '/api/v1/admin/links/batch-disable',
    method: 'post',
    data: { ids }
  })
}

// 批量删除链接
export function batchDeleteLinks(ids) {
  return request({
    url: '/api/v1/admin/links/batch-delete',
    method: 'post',
    data: { ids }
  })
}

// 导出链接数据
export function exportLinks(params) {
  return request({
    url: '/api/v1/admin/links/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 导入链接数据
export function importLinks(data) {
  return request({
    url: '/api/v1/admin/links/import',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取链接统计信息
export function getLinkStatistics() {
  return request({
    url: '/api/v1/admin/links/statistics',
    method: 'get'
  })
} 