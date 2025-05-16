import service from '@/utils/request'
// @Tags jwt
// @Summary jwt加入黑名单
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Success 200 {string} string "{"success":true,"data":{},"msg":"拉黑成功"}"
// @Router /jwt/jsonInBlacklist [post]
export const jsonInBlacklist = () => {
  return service({
    url: '/jwt/jsonInBlacklist',
    method: 'post'
  })
}

// @Tags jwt
// @Summary 获取JWT黑名单
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body modelInterface.PageInfo true "分页获取JWT黑名单"
// @Success 200 {string} json "{"success":true,"data":{},"msg":"获取成功"}"
// @Router /jwt/getJwtBlacklist [post]
export const getJwtBlacklist = (data) => {
  return service({
    url: '/jwt/getJwtBlacklist',
    method: 'post',
    data
  })
}

// @Tags jwt
// @Summary 创建JWT黑名单
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body model.JwtBlacklist true "创建JWT黑名单"
// @Success 200 {string} json "{"success":true,"data":{},"msg":"创建成功"}"
// @Router /jwt/createJwtBlacklist [post]
export const createJwtBlacklist = (data) => {
  return service({
    url: '/jwt/createJwtBlacklist',
    method: 'post',
    data
  })
}

// @Tags jwt
// @Summary 删除JWT黑名单
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body model.JwtBlacklist true "删除JWT黑名单"
// @Success 200 {string} json "{"success":true,"data":{},"msg":"删除成功"}"
// @Router /jwt/deleteJwt [delete]
export const deleteJwt = (data) => {
  return service({
    url: '/jwt/deleteJwt',
    method: 'delete',
    data
  })
}

// @Tags jwt
// @Summary 批量删除JWT黑名单
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.IdsReq true "批量删除JWT黑名单"
// @Success 200 {string} json "{"success":true,"data":{},"msg":"批量删除成功"}"
// @Router /jwt/deleteJwtsByIds [delete]
export const deleteJwtsByIds = (data) => {
  return service({
    url: '/jwt/deleteJwtsByIds',
    method: 'delete',
    data
  })
}

// @Tags jwt
// @Summary 清理过期JWT黑名单
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Success 200 {string} json "{"success":true,"data":{},"msg":"清理成功"}"
// @Router /jwt/cleanupExpiredJwt [post]
export const cleanupExpiredJwt = () => {
  return service({
    url: '/jwt/cleanupExpiredJwt',
    method: 'post'
  })
}
