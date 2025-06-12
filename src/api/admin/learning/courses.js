import request from '@/utils/request'

const baseUrl = '/admin/api/v1/learning/courses'

export default {
  // 获取课程列表
  getCourses(params) {
    return request({
      url: baseUrl,
      method: 'get',
      params
    })
  },

  // 获取单个课程
  getCourse(id) {
    return request({
      url: `${baseUrl}/${id}`,
      method: 'get'
    })
  },

  // 创建课程
  createCourse(data) {
    return request({
      url: baseUrl,
      method: 'post',
      data
    })
  },

  // 更新课程
  updateCourse(id, data) {
    return request({
      url: `${baseUrl}/${id}`,
      method: 'put',
      data
    })
  },

  // 删除课程
  deleteCourse(id) {
    return request({
      url: `${baseUrl}/${id}`,
      method: 'delete'
    })
  },

  // 获取推荐课程
  getRecommendedCourses(limit = 10) {
    return request({
      url: `${baseUrl}/recommended`,
      method: 'get',
      params: { limit }
    })
  },
  
  // 获取热门课程
  getPopularCourses(limit = 10) {
    return request({
      url: `${baseUrl}/popular`,
      method: 'get',
      params: { limit }
    })
  },

  // 获取课程统计
  getCourseStats() {
    return request({
      url: `${baseUrl}/stats`,
      method: 'get'
    })
  },

  // 搜索课程
  searchCourses(keyword, params = {}) {
    return request({
      url: `${baseUrl}/search`,
      method: 'get',
      params: { keyword, ...params }
    })
  },
  
  // 获取课程章节
  getCourseChapters(courseId) {
    return request({
      url: `${baseUrl}/${courseId}/chapters`,
      method: 'get'
    })
  }
}
