import request from '@/utils/request'

// 用户消息API接口

// 创建用户消息
export function createMessage(data) {
  return request({
    url: '/api/v1/messages',
    method: 'post',
    data
  })
}

// 获取消息详情
export function getMessageById(id) {
  return request({
    url: `/api/v1/messages/${id}`,
    method: 'get'
  })
}

// 获取用户消息列表
export function listMessagesByUser(params) {
  return request({
    url: '/api/v1/messages',
    method: 'get',
    params
  })
}

// 标记消息为已读
export function markAsRead(id) {
  return request({
    url: `/api/v1/messages/${id}/read`,
    method: 'put'
  })
}

// 标记所有消息为已读
export function markAllAsRead() {
  return request({
    url: '/api/v1/messages/read/all',
    method: 'put'
  })
}

// 删除用户消息
export function deleteMessage(id) {
  return request({
    url: `/api/v1/messages/${id}`,
    method: 'delete'
  })
}

// 统计未读消息数量
export function countUnread() {
  return request({
    url: '/api/v1/messages/unread/count',
    method: 'get'
  })
} 