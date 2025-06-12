import request from '@/utils/request'

const baseUrl = '/admin/api/v1/learning/certificates'

export default {
  // 获取证书列表
  getCertificates(params) {
    return request({
      url: baseUrl,
      method: 'get',
      params
    })
  },

  // 获取单个证书
  getCertificate(id) {
    return request({
      url: `${baseUrl}/${id}`,
      method: 'get'
    })
  },

  // 创建证书
  createCertificate(data) {
    return request({
      url: baseUrl,
      method: 'post',
      data
    })
  },

  // 更新证书
  updateCertificate(id, data) {
    return request({
      url: `${baseUrl}/${id}`,
      method: 'put',
      data
    })
  },

  // 删除证书
  deleteCertificate(id) {
    return request({
      url: `${baseUrl}/${id}`,
      method: 'delete'
    })
  },

  // 获取用户证书
  getUserCertificates(userId, params) {
    return request({
      url: `${baseUrl}/user/${userId}`,
      method: 'get',
      params
    })
  },
  
  // 获取课程证书
  getCourseCertificates(courseId, params) {
    return request({
      url: `${baseUrl}/course/${courseId}`,
      method: 'get',
      params
    })
  },

  // 验证证书
  verifyCertificate(code) {
    return request({
      url: `${baseUrl}/verify/${code}`,
      method: 'get'
    })
  },

  // 获取证书统计
  getCertificateStats() {
    return request({
      url: `${baseUrl}/stats`,
      method: 'get'
    })
  },
  
  // 批量生成证书
  generateCertificatesBulk(courseId, data) {
    return request({
      url: `${baseUrl}/generate/course/${courseId}`,
      method: 'post',
      data
    })
  }
}
