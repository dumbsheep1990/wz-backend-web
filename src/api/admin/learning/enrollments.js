import request from '@/utils/request'

const baseUrl = '/admin/api/v1/learning/enrollments'

export default {
  // 获取报名列表
  getEnrollments(params) {
    return request({
      url: baseUrl,
      method: 'get',
      params
    })
  },

  // 获取单个报名
  getEnrollment(id) {
    return request({
      url: `${baseUrl}/${id}`,
      method: 'get'
    })
  },

  // 创建报名
  createEnrollment(data) {
    return request({
      url: baseUrl,
      method: 'post',
      data
    })
  },

  // 更新报名
  updateEnrollment(id, data) {
    return request({
      url: `${baseUrl}/${id}`,
      method: 'put',
      data
    })
  },

  // 删除报名
  deleteEnrollment(id) {
    return request({
      url: `${baseUrl}/${id}`,
      method: 'delete'
    })
  },

  // 获取用户报名
  getUserEnrollments(userId, params) {
    return request({
      url: `${baseUrl}/user/${userId}`,
      method: 'get',
      params
    })
  },
  
  // 获取课程报名
  getCourseEnrollments(courseId, params) {
    return request({
      url: `${baseUrl}/course/${courseId}`,
      method: 'get',
      params
    })
  },

  // 获取报名统计
  getEnrollmentStats() {
    return request({
      url: `${baseUrl}/stats`,
      method: 'get'
    })
  }
}
