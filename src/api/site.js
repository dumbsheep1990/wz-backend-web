import request from '@/utils/request'

// 站点配置API接口

// 获取站点配置
export function getSiteConfig() {
  return request({
    url: '/api/v1/site/config',
    method: 'get'
  })
}

// 更新站点配置
export function updateSiteConfig(data) {
  return request({
    url: '/api/v1/site/config',
    method: 'put',
    data
  })
} 