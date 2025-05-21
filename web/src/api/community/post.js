import service from '@/utils/request'

// 创建帖子
export const createPost = (data) => {
  return service({
    url: '/community/createPost',
    method: 'post',
    data
  })
}

// 删除帖子
export const deletePost = (data) => {
  return service({
    url: '/community/deletePost',
    method: 'delete',
    data
  })
}

// 批量删除帖子
export const deletePostByIds = (data) => {
  return service({
    url: '/community/deletePostByIds',
    method: 'delete',
    data
  })
}

// 更新帖子
export const updatePost = (data) => {
  return service({
    url: '/community/updatePost',
    method: 'put',
    data
  })
}

// 根据ID获取帖子
export const findPost = (params) => {
  return service({
    url: '/community/findPost',
    method: 'get',
    params
  })
}

// 分页获取帖子列表
export const getPostList = (params) => {
  return service({
    url: '/community/getPostList',
    method: 'get',
    params
  })
}

// 修改帖子状态
export const changePostStatus = (data) => {
  return service({
    url: '/community/changePostStatus',
    method: 'put',
    data
  })
}
