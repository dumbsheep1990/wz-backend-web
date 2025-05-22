import service from '@/utils/request'

// 相同圈子申请管理API

// 获取相同圈子申请列表
export const getSimilarApplicationList = (data) => {
  return service({
    url: '/community/similar/application/list',
    method: 'get',
    params: data
  })
}

// 获取单个相同圈子申请详情
export const getSimilarApplication = (params) => {
  return service({
    url: '/community/similar/application',
    method: 'get',
    params
  })
}

// 创建相同圈子申请
export const createSimilarApplication = (data) => {
  return service({
    url: '/community/similar/application',
    method: 'post',
    data
  })
}

// 更新相同圈子申请
export const updateSimilarApplication = (data) => {
  return service({
    url: '/community/similar/application',
    method: 'put',
    data
  })
}

// 删除相同圈子申请
export const deleteSimilarApplication = (data) => {
  return service({
    url: '/community/similar/application',
    method: 'delete',
    data
  })
}

// 更新相同圈子申请状态
export const updateSimilarApplicationStatus = (data) => {
  return service({
    url: '/community/similar/application/status',
    method: 'patch',
    data
  })
}

// 相同圈子分类API

// 获取所有相同圈子分类
export const getSimilarCategories = () => {
  return service({
    url: '/community/similar/categories',
    method: 'get'
  })
}

// 相同圈子管理API

// 获取相同圈子列表
export const getSimilarCircles = (params) => {
  return service({
    url: '/community/similar/circles',
    method: 'get',
    params
  })
}

// 更新相同圈子状态
export const updateSimilarCircleStatus = (data) => {
  return service({
    url: '/community/similar/circle/status',
    method: 'patch',
    data
  })
}

// 相同圈子成员管理API

// 获取相同圈子成员列表
export const getSimilarCircleMembers = (params) => {
  return service({
    url: '/community/similar/circle/members',
    method: 'get',
    params
  })
}

// 更新成员角色
export const updateMemberRole = (data) => {
  return service({
    url: '/community/similar/circle/member/role',
    method: 'patch',
    data
  })
}

// 更新成员状态
export const updateMemberStatus = (data) => {
  return service({
    url: '/community/similar/circle/member/status',
    method: 'patch',
    data
  })
}

// 移除成员
export const removeMember = (data) => {
  return service({
    url: '/community/similar/circle/member',
    method: 'delete',
    data
  })
}
