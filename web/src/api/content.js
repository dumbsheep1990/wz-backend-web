import service from '@/utils/request'

// 文章管理相关接口
export const getArticles = (params) => {
  return service({
    url: '/api/v1/admin/content/articles',
    method: 'get',
    params
  })
}

export const getArticleDetail = (id) => {
  return service({
    url: `/api/v1/admin/content/articles/${id}`,
    method: 'get'
  })
}

export const createArticle = (data) => {
  return service({
    url: '/api/v1/admin/content/articles',
    method: 'post',
    data
  })
}

export const updateArticle = (id, data) => {
  return service({
    url: `/api/v1/admin/content/articles/${id}`,
    method: 'put',
    data
  })
}

export const deleteArticle = (id) => {
  return service({
    url: `/api/v1/admin/content/articles/${id}`,
    method: 'delete'
  })
}

// 分类管理相关接口
export const getCategories = (params) => {
  return service({
    url: '/api/v1/admin/content/categories',
    method: 'get',
    params
  })
}

export const saveCategory = (data) => {
  return service({
    url: '/api/v1/admin/content/categories',
    method: 'post',
    data
  })
}

export const deleteCategory = (id) => {
  return service({
    url: `/api/v1/admin/content/categories/${id}`,
    method: 'delete'
  })
}

// 标签管理相关接口
export const getTags = (params) => {
  return service({
    url: '/api/v1/admin/content/tags',
    method: 'get',
    params
  })
}

export const saveTag = (data) => {
  return service({
    url: '/api/v1/admin/content/tags',
    method: 'post',
    data
  })
}

export const deleteTag = (id) => {
  return service({
    url: `/api/v1/admin/content/tags/${id}`,
    method: 'delete'
  })
}

// 评论管理相关接口
export const getComments = (params) => {
  return service({
    url: '/api/v1/admin/content/comments',
    method: 'get',
    params
  })
}

export const approveComment = (id) => {
  return service({
    url: `/api/v1/admin/content/comments/${id}/approve`,
    method: 'put'
  })
}

export const rejectComment = (id) => {
  return service({
    url: `/api/v1/admin/content/comments/${id}/reject`,
    method: 'put'
  })
}

export const deleteComment = (id) => {
  return service({
    url: `/api/v1/admin/content/comments/${id}`,
    method: 'delete'
  })
} 