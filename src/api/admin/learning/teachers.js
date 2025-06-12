import request from '@/utils/request'

const baseUrl = '/admin/api/v1/learning/teachers'

export default {
  // 获取教师列表
  getTeachers(params) {
    return request({
      url: baseUrl,
      method: 'get',
      params
    })
  },

  // 获取单个教师
  getTeacher(id) {
    return request({
      url: `${baseUrl}/${id}`,
      method: 'get'
    })
  },

  // 创建教师
  createTeacher(data) {
    return request({
      url: baseUrl,
      method: 'post',
      data
    })
  },

  // 更新教师
  updateTeacher(id, data) {
    return request({
      url: `${baseUrl}/${id}`,
      method: 'put',
      data
    })
  },

  // 删除教师
  deleteTeacher(id) {
    return request({
      url: `${baseUrl}/${id}`,
      method: 'delete'
    })
  },

  // 获取热门教师列表
  getPopularTeachers(limit = 10) {
    return request({
      url: `${baseUrl}/popular`,
      method: 'get',
      params: { limit }
    })
  },

  // 获取教师统计
  getTeacherStats() {
    return request({
      url: `${baseUrl}/stats`,
      method: 'get'
    })
  },

  // 搜索教师
  searchTeachers(keyword, params = {}) {
    return request({
      url: `${baseUrl}/search`,
      method: 'get',
      params: { keyword, ...params }
    })
  }
}
