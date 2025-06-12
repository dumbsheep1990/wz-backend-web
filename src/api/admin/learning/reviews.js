import request from '@/utils/request'

const baseUrl = '/admin/api/v1/learning/reviews'

export default {
  // 获取评价列表
  getReviews(params) {
    return request({
      url: baseUrl,
      method: 'get',
      params
    })
  },

  // 获取单个评价
  getReview(id) {
    return request({
      url: `${baseUrl}/${id}`,
      method: 'get'
    })
  },

  // 创建评价
  createReview(data) {
    return request({
      url: baseUrl,
      method: 'post',
      data
    })
  },

  // 更新评价
  updateReview(id, data) {
    return request({
      url: `${baseUrl}/${id}`,
      method: 'put',
      data
    })
  },

  // 删除评价
  deleteReview(id) {
    return request({
      url: `${baseUrl}/${id}`,
      method: 'delete'
    })
  },

  // 获取用户评价
  getUserReviews(userId, params) {
    return request({
      url: `${baseUrl}/user/${userId}`,
      method: 'get',
      params
    })
  },
  
  // 获取课程评价
  getCourseReviews(courseId, params) {
    return request({
      url: `${baseUrl}/course/${courseId}`,
      method: 'get',
      params
    })
  },
  
  // 获取教师评价
  getTeacherReviews(teacherId, params) {
    return request({
      url: `${baseUrl}/teacher/${teacherId}`,
      method: 'get',
      params
    })
  },

  // 审核评价
  approveReview(id) {
    return request({
      url: `${baseUrl}/${id}/approve`,
      method: 'put'
    })
  },
  
  // 拒绝评价
  rejectReview(id, reason) {
    return request({
      url: `${baseUrl}/${id}/reject`,
      method: 'put',
      data: { reason }
    })
  }
}
