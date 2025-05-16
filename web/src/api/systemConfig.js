import service from '@/utils/request'

// @Tags SystemConfig
// @Summary 获取系统配置
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Success 200 {string} json "{"success":true,"data":{},"msg":"获取成功"}"
// @Router /system/getSystemConfig [get]
export const getSystemConfig = () => {
  return service({
    url: '/system/getSystemConfig',
    method: 'get'
  })
}

// @Tags SystemConfig
// @Summary 更新系统配置
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body model.SystemConfig true "更新系统配置"
// @Success 200 {string} json "{"success":true,"data":{},"msg":"更新成功"}"
// @Router /system/updateSystemConfig [post]
export const updateSystemConfig = (data) => {
  return service({
    url: '/system/updateSystemConfig',
    method: 'post',
    data
  })
} 