import service from '@/utils/request'

// 获取友情链接列表
export const getLinks = (params) => {
  return service({
    url: '/api/links/list',
    method: 'get',
    params
  })
}

// 获取友情链接详情
export const getLinkDetail = (id) => {
  return service({
    url: `/api/links/${id}`,
    method: 'get'
  })
}

// 创建友情链接
export const createLink = (data) => {
  return service({
    url: '/api/links/create',
    method: 'post',
    data
  })
}

// 更新友情链接
export const updateLink = (id, data) => {
  return service({
    url: `/api/links/${id}`,
    method: 'put',
    data
  })
}

// 删除友情链接
export const deleteLink = (id) => {
  return service({
    url: `/api/links/${id}`,
    method: 'delete'
  })
} 