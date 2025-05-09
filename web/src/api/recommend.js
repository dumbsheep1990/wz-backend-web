import service from '@/utils/request'

// 推荐规则相关接口

// 获取推荐规则列表
export const getRecommendRules = (params) => {
  return service({
    url: '/api/v1/admin/recommend/rules',
    method: 'get',
    params
  })
}

// 创建/更新推荐规则
export const saveRecommendRule = (data) => {
  return service({
    url: '/api/v1/admin/recommend/rules',
    method: 'post',
    data
  })
}

// 设置内容权重
export const setContentWeight = (data) => {
  return service({
    url: '/api/v1/admin/recommend/content/weight',
    method: 'post',
    data
  })
}

// 热门内容相关接口

// 获取热门内容
export const getHotContent = (params) => {
  return service({
    url: '/api/v1/admin/recommend/hot/content',
    method: 'get',
    params
  })
}

// 热门关键词相关接口

// 获取热门关键词
export const getHotKeywords = (params) => {
  return service({
    url: '/api/v1/admin/recommend/hot/keywords',
    method: 'get',
    params
  })
}

// 热门分类相关接口

// 获取热门分类
export const getHotCategories = (params) => {
  return service({
    url: '/api/v1/admin/recommend/hot/categories',
    method: 'get',
    params
  })
} 