import request from '@/utils/request'

// 页面管理API接口

// 获取页面列表
export function getPageList(params) {
  return request({
    url: '/api/v1/admin/pages',
    method: 'get',
    params
  })
}

// 创建页面
export function createPage(data) {
  return request({
    url: '/api/v1/admin/pages',
    method: 'post',
    data
  })
}

// 获取页面详情
export function getPageDetail(id) {
  return request({
    url: `/api/v1/admin/pages/${id}`,
    method: 'get'
  })
}

// 更新页面
export function updatePage(id, data) {
  return request({
    url: `/api/v1/admin/pages/${id}`,
    method: 'put',
    data
  })
}

// 删除页面
export function deletePage(id) {
  return request({
    url: `/api/v1/admin/pages/${id}`,
    method: 'delete'
  })
}

// 切换页面状态
export function togglePageStatus(id, data) {
  return request({
    url: `/api/v1/admin/pages/${id}/toggle-status`,
    method: 'post',
    data
  })
}

// 预览页面
export function previewPage(id) {
  return request({
    url: `/api/v1/admin/pages/${id}/preview`,
    method: 'get'
  })
}

// 批量更新页面
export function batchUpdatePages(data) {
  return request({
    url: '/api/v1/admin/pages/batch-update',
    method: 'post',
    data
  })
}

// 发布页面
export function publishPage(id) {
  return togglePageStatus(id, { status: '已发布' })
}

// 下线页面
export function unpublishPage(id) {
  return togglePageStatus(id, { status: '草稿' })
}

// 复制页面
export function copyPage(id, data) {
  return request({
    url: `/api/v1/admin/pages/${id}/copy`,
    method: 'post',
    data
  })
}

// 导出页面
export function exportPages(params) {
  return request({
    url: '/api/v1/admin/pages/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 导入页面
export function importPages(data) {
  return request({
    url: '/api/v1/admin/pages/import',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
} 