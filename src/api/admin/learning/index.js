import request from '@/utils/request'

// Base API URL for admin learning module
const baseUrl = '/admin/api/v1/learning'

export default {
  // Base endpoints that don't fit in specific entity files
  fetchDashboard() {
    return request({
      url: `${baseUrl}/dashboard`,
      method: 'get'
    })
  },
  
  searchGlobal(keyword, page = 1, pageSize = 10) {
    return request({
      url: `${baseUrl}/search`,
      method: 'get',
      params: { keyword, page, pageSize }
    })
  }
}
