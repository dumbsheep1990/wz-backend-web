import request from '@/utils/request'

const baseUrl = '/admin/api/v1/learning/progress'

export default {
  // 获取学习进度列表
  getProgressList(params) {
    return request({
      url: baseUrl,
      method: 'get',
      params
    })
  },

  // 获取单个学习进度
  getProgress(id) {
    return request({
      url: `${baseUrl}/${id}`,
      method: 'get'
    })
  },

  // 创建学习进度
  createProgress(data) {
    return request({
      url: baseUrl,
      method: 'post',
      data
    })
  },

  // 更新学习进度
  updateProgress(id, data) {
    return request({
      url: `${baseUrl}/${id}`,
      method: 'put',
      data
    })
  },

  // 删除学习进度
  deleteProgress(id) {
    return request({
      url: `${baseUrl}/${id}`,
      method: 'delete'
    })
  },

  // 获取用户学习进度
  getUserProgress(userId, params) {
    return request({
      url: `${baseUrl}/user/${userId}`,
      method: 'get',
      params
    })
  },
  
  // 获取课程学习进度
  getCourseProgress(courseId, params) {
    return request({
      url: `${baseUrl}/course/${courseId}`,
      method: 'get',
      params
    })
  },
  
  // 获取课时学习进度
  getLessonProgress(lessonId, params) {
    return request({
      url: `${baseUrl}/lesson/${lessonId}`,
      method: 'get',
      params
    })
  },
  
  // 获取学习进度统计
  getProgressStats() {
    return request({
      url: `${baseUrl}/stats`,
      method: 'get'
    })
  },
  
  // 重置用户课程的学习进度
  resetUserCourseProgress(userId, courseId) {
    return request({
      url: `${baseUrl}/user/${userId}/course/${courseId}/reset`,
      method: 'put'
    })
  }
}
