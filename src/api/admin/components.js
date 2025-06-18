import request from '@/utils/request'

// 组件管理API接口

// 获取组件列表
export function getComponentList(params) {
  return request({
    url: '/api/v1/admin/components',
    method: 'get',
    params
  })
}

// 创建组件
export function createComponent(data) {
  return request({
    url: '/api/v1/admin/components',
    method: 'post',
    data
  })
}

// 获取组件详情
export function getComponentDetail(id) {
  return request({
    url: `/api/v1/admin/components/${id}`,
    method: 'get'
  })
}

// 更新组件
export function updateComponent(id, data) {
  return request({
    url: `/api/v1/admin/components/${id}`,
    method: 'put',
    data
  })
}

// 删除组件
export function deleteComponent(id) {
  return request({
    url: `/api/v1/admin/components/${id}`,
    method: 'delete'
  })
}

// 预览组件
export function previewComponent(id) {
  return request({
    url: `/api/v1/admin/components/${id}/preview`,
    method: 'get'
  })
}

// 导入组件
export function importComponent(data) {
  return request({
    url: '/api/v1/admin/components/import',
    method: 'post',
    data
  })
}

// 获取组件类型列表
export function getComponentTypes() {
  return request({
    url: '/api/v1/admin/components/types',
    method: 'get'
  })
}

// 复制组件
export function copyComponent(id, data) {
  return request({
    url: `/api/v1/admin/components/${id}/copy`,
    method: 'post',
    data
  })
}

// 发布组件
export function publishComponent(id) {
  return request({
    url: `/api/v1/admin/components/${id}/publish`,
    method: 'post'
  })
}

// 下架组件
export function unpublishComponent(id) {
  return request({
    url: `/api/v1/admin/components/${id}/unpublish`,
    method: 'post'
  })
}

// 获取组件版本列表
export function getComponentVersions(id) {
  return request({
    url: `/api/v1/admin/components/${id}/versions`,
    method: 'get'
  })
}

// 创建组件版本
export function createComponentVersion(id, data) {
  return request({
    url: `/api/v1/admin/components/${id}/versions`,
    method: 'post',
    data
  })
}

// 回滚到指定版本
export function rollbackComponentVersion(id, versionId) {
  return request({
    url: `/api/v1/admin/components/${id}/versions/${versionId}/rollback`,
    method: 'post'
  })
}

// 导出组件
export function exportComponent(id) {
  return request({
    url: `/api/v1/admin/components/${id}/export`,
    method: 'get',
    responseType: 'blob'
  })
}

// 批量导出组件
export function batchExportComponents(ids) {
  return request({
    url: '/api/v1/admin/components/batch-export',
    method: 'post',
    data: { ids },
    responseType: 'blob'
  })
}

// 批量删除组件
export function batchDeleteComponents(ids) {
  return request({
    url: '/api/v1/admin/components/batch-delete',
    method: 'post',
    data: { ids }
  })
}

// 上传组件缩略图
export function uploadComponentThumbnail(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/api/v1/admin/components/upload-thumbnail',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取组件统计信息
export function getComponentStatistics() {
  return request({
    url: '/api/v1/admin/components/statistics',
    method: 'get'
  })
}

// 搜索组件
export function searchComponents(keyword, params) {
  return request({
    url: '/api/v1/admin/components/search',
    method: 'get',
    params: {
      keyword,
      ...params
    }
  })
} 