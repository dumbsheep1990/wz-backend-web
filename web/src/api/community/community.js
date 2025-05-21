import service from '@/utils/request'

// 创建社区
export const createCommunity = (data) => {
  return service({
    url: '/community/createCommunity',
    method: 'post',
    data
  })
}

// 删除社区
export const deleteCommunity = (data) => {
  return service({
    url: '/community/deleteCommunity',
    method: 'delete',
    data
  })
}

// 批量删除社区
export const deleteCommunityByIds = (data) => {
  return service({
    url: '/community/deleteCommunityByIds',
    method: 'delete',
    data
  })
}

// 更新社区
export const updateCommunity = (data) => {
  return service({
    url: '/community/updateCommunity',
    method: 'put',
    data
  })
}

// 根据ID获取社区
export const findCommunity = (params) => {
  return service({
    url: '/community/findCommunity',
    method: 'get',
    params
  })
}

// 分页获取社区列表
export const getCommunityList = (params) => {
  return service({
    url: '/community/getCommunityList',
    method: 'get',
    params
  })
}

// 修改社区状态
export const changeCommunityStatus = (data) => {
  return service({
    url: '/community/changeCommunityStatus',
    method: 'put',
    data
  })
}
