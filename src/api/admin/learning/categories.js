import request from '@/utils/request'

const baseUrl = '/admin/api/v1/learning/categories'

export default {
  // 获取分类列表
  getCategories(params) {
    return request({
      url: baseUrl,
      method: 'get',
      params
    })
  },

  // 获取单个分类
  getCategory(id) {
    return request({
      url: `${baseUrl}/${id}`,
      method: 'get'
    })
  },

  // 创建分类
  createCategory(data) {
    return request({
      url: baseUrl,
      method: 'post',
      data
    })
  },

  // 更新分类
  updateCategory(id, data) {
    return request({
      url: `${baseUrl}/${id}`,
      method: 'put',
      data
    })
  },

  // 删除分类
  deleteCategory(id) {
    return request({
      url: `${baseUrl}/${id}`,
      method: 'delete'
    })
  },

  // 获取分类树结构
  getCategoryTree() {
    return request({
      url: `${baseUrl}/tree`,
      method: 'get'
    })
  },
  
  // 获取分类下的课程
  getCategoryCourses(categoryId, params) {
    return request({
      url: `${baseUrl}/${categoryId}/courses`,
      method: 'get',
      params
    })
  }
}
