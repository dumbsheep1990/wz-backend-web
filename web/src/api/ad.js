import service from '@/utils/request'

// 广告位相关接口

// 获取广告位列表
export const getAdSpaceList = (params) => {
  return service({
    url: '/api/v1/admin/ad/spaces',
    method: 'get',
    params
  })
}

// 获取广告位详情
export const getAdSpaceDetail = (id) => {
  return service({
    url: `/api/v1/admin/ad/spaces/${id}`,
    method: 'get'
  })
}

// 创建广告位
export const createAdSpace = (data) => {
  return service({
    url: '/api/v1/admin/ad/spaces',
    method: 'post',
    data
  })
}

// 更新广告位
export const updateAdSpace = (id, data) => {
  return service({
    url: `/api/v1/admin/ad/spaces/${id}`,
    method: 'put',
    data
  })
}

// 删除广告位
export const deleteAdSpace = (id) => {
  return service({
    url: `/api/v1/admin/ad/spaces/${id}`,
    method: 'delete'
  })
}

// 广告内容相关接口

// 获取广告列表
export const getAdList = (params) => {
  return service({
    url: '/api/v1/admin/ad/contents',
    method: 'get',
    params
  })
}

// 获取广告详情
export const getAdDetail = (id) => {
  return service({
    url: `/api/v1/admin/ad/contents/${id}`,
    method: 'get'
  })
}

// 创建广告
export const createAd = (data) => {
  return service({
    url: '/api/v1/admin/ad/contents',
    method: 'post',
    data
  })
}

// 更新广告
export const updateAd = (id, data) => {
  return service({
    url: `/api/v1/admin/ad/contents/${id}`,
    method: 'put',
    data
  })
}

// 删除广告
export const deleteAd = (id) => {
  return service({
    url: `/api/v1/admin/ad/contents/${id}`,
    method: 'delete'
  })
}

// 广告统计相关接口

// 获取广告统计数据
export const getAdStats = (params) => {
  return service({
    url: '/api/v1/admin/ad/stats',
    method: 'get',
    params
  })
} 