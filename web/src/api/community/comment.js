import service from '@/utils/request'

// 创建评论
export const createComment = (data) => {
  return service({
    url: '/community/createComment',
    method: 'post',
    data
  })
}

// 删除评论
export const deleteComment = (data) => {
  return service({
    url: '/community/deleteComment',
    method: 'delete',
    data
  })
}

// 批量删除评论
export const deleteCommentByIds = (data) => {
  return service({
    url: '/community/deleteCommentByIds',
    method: 'delete',
    data
  })
}

// 根据ID获取评论
export const findComment = (params) => {
  return service({
    url: '/community/findComment',
    method: 'get',
    params
  })
}

// 分页获取评论列表
export const getCommentList = (params) => {
  return service({
    url: '/community/getCommentList',
    method: 'get',
    params
  })
}

// 修改评论状态
export const changeCommentStatus = (data) => {
  return service({
    url: '/community/changeCommentStatus',
    method: 'put',
    data
  })
}
