package community

import (
	"strconv"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/request"
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/response"
	"github.com/flipped-aurora/gin-vue-admin/server/model/community"
	communityReq "github.com/flipped-aurora/gin-vue-admin/server/model/community/request"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type CommunityApi struct{}

// CreateCommunity 创建社区
// @Tags Community
// @Summary 创建社区
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body community.Community true "社区信息"
// @Success 200 {object} response.Response{msg=string} "创建社区成功"
// @Router /community/createCommunity [post]
func (comm *CommunityApi) CreateCommunity(c *gin.Context) {
	var community community.Community
	err := c.ShouldBindJSON(&community)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	
	// 校验必填字段
	if community.Name == "" {
		response.FailWithMessage("社区名称不能为空", c)
		return
	}
	
	// 获取当前用户ID
	userID := getUserID(c)
	if userID != 0 {
		community.OwnerId = userID
	}
	
	err = communityService.CreateCommunity(community)
	if err != nil {
		global.GVA_LOG.Error("创建社区失败!", zap.Error(err))
		response.FailWithMessage("创建社区失败: "+err.Error(), c)
		return
	}
	
	response.OkWithMessage("创建社区成功", c)
}

// DeleteCommunity 删除社区
// @Tags Community
// @Summary 删除社区
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.GetById true "社区ID"
// @Success 200 {object} response.Response{msg=string} "删除社区成功"
// @Router /community/deleteCommunity [delete]
func (comm *CommunityApi) DeleteCommunity(c *gin.Context) {
	var reqId request.GetById
	err := c.ShouldBindJSON(&reqId)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	
	if err := communityService.DeleteCommunity(reqId.ID); err != nil {
		global.GVA_LOG.Error("删除社区失败!", zap.Error(err))
		response.FailWithMessage("删除社区失败: "+err.Error(), c)
		return
	}
	
	response.OkWithMessage("删除社区成功", c)
}

// DeleteCommunityByIds 批量删除社区
// @Tags Community
// @Summary 批量删除社区
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.IdsReq true "社区ID列表"
// @Success 200 {object} response.Response{msg=string} "批量删除社区成功"
// @Router /community/deleteCommunityByIds [delete]
func (comm *CommunityApi) DeleteCommunityByIds(c *gin.Context) {
	var IDS request.IdsReq
	err := c.ShouldBindJSON(&IDS)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	
	if err := communityService.DeleteCommunityByIds(IDS); err != nil {
		global.GVA_LOG.Error("批量删除社区失败!", zap.Error(err))
		response.FailWithMessage("批量删除社区失败: "+err.Error(), c)
		return
	}
	
	response.OkWithMessage("批量删除社区成功", c)
}

// UpdateCommunity 更新社区
// @Tags Community
// @Summary 更新社区
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body community.Community true "社区信息"
// @Success 200 {object} response.Response{msg=string} "更新社区成功"
// @Router /community/updateCommunity [put]
func (comm *CommunityApi) UpdateCommunity(c *gin.Context) {
	var community community.Community
	err := c.ShouldBindJSON(&community)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	
	// 校验ID
	if community.ID == 0 {
		response.FailWithMessage("社区ID不能为空", c)
		return
	}
	
	if err := communityService.UpdateCommunity(community); err != nil {
		global.GVA_LOG.Error("更新社区失败!", zap.Error(err))
		response.FailWithMessage("更新社区失败: "+err.Error(), c)
		return
	}
	
	response.OkWithMessage("更新社区成功", c)
}

// FindCommunity 根据ID获取社区
// @Tags Community
// @Summary 根据ID获取社区
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query request.GetById true "社区ID"
// @Success 200 {object} response.Response{data=community.Community,msg=string} "获取社区成功"
// @Router /community/findCommunity [get]
func (comm *CommunityApi) FindCommunity(c *gin.Context) {
	var reqId request.GetById
	if err := c.ShouldBindQuery(&reqId); err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	
	result, err := communityService.GetCommunity(reqId.ID)
	if err != nil {
		global.GVA_LOG.Error("获取社区信息失败!", zap.Error(err))
		response.FailWithMessage("获取社区信息失败: "+err.Error(), c)
		return
	}
	
	response.OkWithData(result, c)
}

// GetCommunityList 分页获取社区列表
// @Tags Community
// @Summary 分页获取社区列表
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query communityReq.CommunitySearch true "查询参数"
// @Success 200 {object} response.Response{data=response.PageResult,msg=string} "获取社区列表成功"
// @Router /community/getCommunityList [get]
func (comm *CommunityApi) GetCommunityList(c *gin.Context) {
	var pageInfo communityReq.CommunitySearch
	err := c.ShouldBindQuery(&pageInfo)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	
	list, total, err := communityService.GetCommunityInfoList(pageInfo)
	if err != nil {
		global.GVA_LOG.Error("获取社区列表失败!", zap.Error(err))
		response.FailWithMessage("获取社区列表失败: "+err.Error(), c)
		return
	}
	
	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     pageInfo.Page,
		PageSize: pageInfo.PageSize,
	}, "获取社区列表成功", c)
}

// ChangeCommunityStatus 修改社区状态
// @Tags Community
// @Summary 修改社区状态
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body struct{ID uint;Status int} true "社区ID和状态"
// @Success 200 {object} response.Response{msg=string} "修改社区状态成功"
// @Router /community/changeCommunityStatus [put]
func (comm *CommunityApi) ChangeCommunityStatus(c *gin.Context) {
	type StatusReq struct {
		ID     uint `json:"id"`
		Status int  `json:"status"`
	}
	
	var req StatusReq
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	
	if req.ID == 0 {
		response.FailWithMessage("社区ID不能为空", c)
		return
	}
	
	if err := communityService.ChangeCommunityStatus(req.ID, req.Status); err != nil {
		global.GVA_LOG.Error("修改社区状态失败!", zap.Error(err))
		response.FailWithMessage("修改社区状态失败: "+err.Error(), c)
		return
	}
	
	response.OkWithMessage("修改社区状态成功", c)
}

// 获取当前用户ID
func getUserID(c *gin.Context) uint {
	userID := c.GetString("user_id")
	if userID == "" {
		userID = c.GetHeader("X-User-ID")
	}
	
	if userID == "" {
		return 0
	}
	
	uid, err := strconv.ParseUint(userID, 10, 32)
	if err != nil {
		return 0
	}
	return uint(uid)
}
