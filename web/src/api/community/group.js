import service from '@/utils/request'

// 创建群组
export const createGroup = (data) => {
  return service({
    url: '/community/createGroup',
    method: 'post',
    data
  })
}

// 删除群组
export const deleteGroup = (data) => {
  return service({
    url: '/community/deleteGroup',
    method: 'delete',
    data
  })
}

// 批量删除群组
export const deleteGroupByIds = (data) => {
  return service({
    url: '/community/deleteGroupByIds',
    method: 'delete',
    data
  })
}

// 更新群组
export const updateGroup = (data) => {
  return service({
    url: '/community/updateGroup',
    method: 'put',
    data
  })
}

// 根据ID获取群组
export const findGroup = (params) => {
  return service({
    url: '/community/findGroup',
    method: 'get',
    params
  })
}

// 分页获取群组列表
export const getGroupList = (params) => {
  return service({
    url: '/community/getGroupList',
    method: 'get',
    params
  })
}

// 修改群组状态
export const changeGroupStatus = (data) => {
  return service({
    url: '/community/changeGroupStatus',
    method: 'put',
    data
  })
}
