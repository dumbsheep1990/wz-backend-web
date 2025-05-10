import service from '@/utils/request'

// 获取站点配置
export const getSiteConfig = () => {
  return service({
    url: '/api/site/config',
    method: 'get'
  })
}

// 更新站点配置
export const updateSiteConfig = (data) => {
  return service({
    url: '/api/site/config',
    method: 'put',
    data
  })
} 