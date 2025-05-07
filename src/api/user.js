// 用户管理相关的 API 请求 
import service from '@/utils/request' // 假设 gin-vue-admin 的请求工具路径

// 获取用户列表
export const getUserList = (params) => {
  return service({
    url: '/api/v1/admin/users',
    method: 'get',
    params
  })
}

// 获取用户详情
export const getUserDetail = (id) => {
  return service({
    url: `/api/v1/admin/users/${id}`,
    method: 'get'
  })
}

// 创建用户
export const createUser = (data) => {
  return service({
    url: '/api/v1/admin/users',
    method: 'post',
    data
  })
}

// 更新用户
export const updateUser = (id, data) => {
  return service({
    url: `/api/v1/admin/users/${id}`,
    method: 'put',
    data
  })
}

// 删除用户
export const deleteUser = (id) => {
  return service({
    url: `/api/v1/admin/users/${id}`,
    method: 'delete'
  })
}

// 获取单个用户信息 (通常用于编辑前回填表单)
export const getUserInfo = (id) => {
  return service({
    url: `/users/${id}`,
    method: 'get'
  })
} 