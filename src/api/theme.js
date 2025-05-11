import request from '@/utils/request'

// 主题管理API接口

// 创建主题
export function createTheme(data) {
  return request({
    url: '/api/v1/themes',
    method: 'post',
    data
  })
}

// 获取主题详情
export function getThemeById(id) {
  return request({
    url: `/api/v1/themes/${id}`,
    method: 'get'
  })
}

// 获取主题列表
export function listThemes(params) {
  return request({
    url: '/api/v1/themes',
    method: 'get',
    params
  })
}

// 更新主题
export function updateTheme(id, data) {
  return request({
    url: `/api/v1/themes/${id}`,
    method: 'put',
    data
  })
}

// 删除主题
export function deleteTheme(id) {
  return request({
    url: `/api/v1/themes/${id}`,
    method: 'delete'
  })
}

// 设置默认主题
export function setDefaultTheme(id) {
  return request({
    url: `/api/v1/themes/${id}/default`,
    method: 'put'
  })
}

// 获取默认主题
export function getDefaultTheme() {
  return request({
    url: '/api/v1/themes/default',
    method: 'get'
  })
} 