import service from '@/utils/request'

// 获取导航树
export const getNavigationTree = (params) => {
  return service({
    url: '/admin/tree-navigation',
    method: 'get',
    params
  })
}

// 创建导航项
export const createNavigationItem = (data) => {
  return service({
    url: '/admin/tree-navigation',
    method: 'post',
    data
  })
}

// 获取导航项详情
export const getNavigationItem = (id) => {
  return service({
    url: `/admin/tree-navigation/${id}`,
    method: 'get'
  })
}

// 更新导航项
export const updateNavigationItem = (id, data) => {
  return service({
    url: `/admin/tree-navigation/${id}`,
    method: 'put',
    data
  })
}

// 删除导航项
export const deleteNavigationItem = (id) => {
  return service({
    url: `/admin/tree-navigation/${id}`,
    method: 'delete'
  })
}

// 更新导航排序
export const updateNavigationOrder = (data) => {
  return service({
    url: '/admin/tree-navigation/order',
    method: 'put',
    data
  })
}

// 切换导航项可见性
export const toggleNavigationVisibility = (id, data) => {
  return service({
    url: `/admin/tree-navigation/${id}/visibility`,
    method: 'put',
    data
  })
}

// 批量删除导航项
export const batchDeleteNavigationItems = (data) => {
  return service({
    url: '/admin/tree-navigation/batch',
    method: 'delete',
    data
  })
}

// 导出导航树
export const exportNavigationTree = (params) => {
  return service({
    url: '/admin/tree-navigation/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 导入导航树
export const importNavigationTree = (data) => {
  return service({
    url: '/admin/tree-navigation/import',
    method: 'post',
    data
  })
} 