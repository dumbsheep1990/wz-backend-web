import request from '@/utils/request'

// 主题管理API接口

// 获取主题列表
export function getThemeList(params) {
  return request({
    url: '/api/v1/admin/themes',
    method: 'get',
    params
  })
}

// 创建主题
export function createTheme(data) {
  return request({
    url: '/api/v1/admin/themes',
    method: 'post',
    data
  })
}

// 获取主题详情
export function getThemeDetail(id) {
  return request({
    url: `/api/v1/admin/themes/${id}`,
    method: 'get'
  })
}

// 更新主题
export function updateTheme(id, data) {
  return request({
    url: `/api/v1/admin/themes/${id}`,
    method: 'put',
    data
  })
}

// 删除主题
export function deleteTheme(id) {
  return request({
    url: `/api/v1/admin/themes/${id}`,
    method: 'delete'
  })
}

// 应用主题
export function applyTheme(id) {
  return request({
    url: `/api/v1/admin/themes/${id}/apply`,
    method: 'post'
  })
}

// 预览主题
export function previewTheme(id) {
  return request({
    url: `/api/v1/admin/themes/${id}/preview`,
    method: 'get'
  })
}

// 导出主题
export function exportTheme(id) {
  return request({
    url: `/api/v1/admin/themes/${id}/export`,
    method: 'get',
    responseType: 'blob'
  })
}

// 导入主题
export function importTheme(data) {
  return request({
    url: '/api/v1/admin/themes/import',
    method: 'post',
    data
  })
}

// 获取当前主题
export function getCurrentTheme() {
  return request({
    url: '/api/v1/admin/themes/current',
    method: 'get'
  })
} 