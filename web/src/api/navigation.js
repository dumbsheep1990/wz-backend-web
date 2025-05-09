import service from '@/utils/request'

// 主导航相关接口
export const getMainNavigation = (params) => {
  return service({
    url: '/api/v1/admin/navigation/main',
    method: 'get',
    params
  })
}

export const saveMainNavigation = (data) => {
  return service({
    url: '/api/v1/admin/navigation/main',
    method: 'post',
    data
  })
}

export const deleteMainNavigationItem = (id) => {
  return service({
    url: `/api/v1/admin/navigation/main/${id}`,
    method: 'delete'
  })
}

// 底部导航相关接口
export const getFooterNavigation = (params) => {
  return service({
    url: '/api/v1/admin/navigation/footer',
    method: 'get',
    params
  })
}

export const saveFooterNavigation = (data) => {
  return service({
    url: '/api/v1/admin/navigation/footer',
    method: 'post',
    data
  })
}

export const deleteFooterNavigationItem = (id) => {
  return service({
    url: `/api/v1/admin/navigation/footer/${id}`,
    method: 'delete'
  })
}

// 侧边导航相关接口
export const getSideNavigation = (params) => {
  return service({
    url: '/api/v1/admin/navigation/side',
    method: 'get',
    params
  })
}

export const saveSideNavigation = (data) => {
  return service({
    url: '/api/v1/admin/navigation/side',
    method: 'post',
    data
  })
}

export const deleteSideNavigationItem = (id) => {
  return service({
    url: `/api/v1/admin/navigation/side/${id}`,
    method: 'delete'
  })
} 