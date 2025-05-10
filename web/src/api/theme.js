import service from '@/utils/request'

// 获取主题列表
export const getThemes = (params) => {
  return service({
    url: '/api/themes/list',
    method: 'get',
    params
  })
}

// 获取主题详情
export const getThemeDetail = (id) => {
  return service({
    url: `/api/themes/${id}`,
    method: 'get'
  })
}

// 创建主题
export const createTheme = (data) => {
  return service({
    url: '/api/themes/create',
    method: 'post',
    data
  })
}

// 更新主题
export const updateTheme = (id, data) => {
  return service({
    url: `/api/themes/${id}`,
    method: 'put',
    data
  })
}

// 删除主题
export const deleteTheme = (id) => {
  return service({
    url: `/api/themes/${id}`,
    method: 'delete'
  })
}

// 设置默认主题
export const setDefaultTheme = (id) => {
  return service({
    url: `/api/themes/${id}/default`,
    method: 'put'
  })
} 