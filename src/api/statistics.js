import request from '@/utils/request'

// 统计分析API接口

// 记录统计数据
export function recordStatistics(data) {
  return request({
    url: '/api/v1/statistics/record',
    method: 'post',
    data
  })
}

// 获取概览数据
export function getOverview() {
  return request({
    url: '/api/v1/statistics/overview',
    method: 'get'
  })
}

// 获取特定类型的统计数据
export function getStatisticsByType(params) {
  return request({
    url: '/api/v1/statistics/by-type',
    method: 'get',
    params
  })
}

// 获取内容排行榜
export function getContentRanking(params) {
  return request({
    url: '/api/v1/statistics/content-ranking',
    method: 'get',
    params
  })
}

// 获取用户访问统计
export function getUserVisitStats(params) {
  return request({
    url: '/api/v1/statistics/user-visit',
    method: 'get',
    params
  })
}

// 获取内容趋势统计
export function getContentTrendStats(params) {
  return request({
    url: '/api/v1/statistics/content-trend',
    method: 'get',
    params
  })
} 