package community

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/request"
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/response"
	"github.com/flipped-aurora/gin-vue-admin/server/model/community"
	communityReq "github.com/flipped-aurora/gin-vue-admin/server/model/community/request"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type GroupApi struct{}

// CreateGroup 创建群组
// @Tags Group
// @Summary 创建群组
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body community.Group true "群组信息"
// @Success 200 {object} response.Response{msg=string} "创建群组成功"
// @Router /community/createGroup [post]
func (g *GroupApi) CreateGroup(c *gin.Context) {
	var group community.Group
	err := c.ShouldBindJSON(&group)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	
	// 校验必填字段
	if group.Name == "" {
		response.FailWithMessage("群组名称不能为空", c)
		return
	}
	
	if group.CommunityId == 0 {
		response.FailWithMessage("所属社区ID不能为空", c)
		return
	}
	
	// 获取当前用户ID
	userID := getUserID(c)
	if userID != 0 {
		group.OwnerId = userID
	}
	
	err = communityService.CreateGroup(group)
	if err != nil {
		global.GVA_LOG.Error("创建群组失败!", zap.Error(err))
		response.FailWithMessage("创建群组失败: "+err.Error(), c)
		return
	}
	
	response.OkWithMessage("创建群组成功", c)
}

// DeleteGroup 删除群组
// @Tags Group
// @Summary 删除群组
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.GetById true "群组ID"
// @Success 200 {object} response.Response{msg=string} "删除群组成功"
// @Router /community/deleteGroup [delete]
func (g *GroupApi) DeleteGroup(c *gin.Context) {
	var reqId request.GetById
	err := c.ShouldBindJSON(&reqId)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	
	if err := communityService.DeleteGroup(reqId.ID); err != nil {
		global.GVA_LOG.Error("删除群组失败!", zap.Error(err))
		response.FailWithMessage("删除群组失败: "+err.Error(), c)
		return
	}
	
	response.OkWithMessage("删除群组成功", c)
}

// DeleteGroupByIds 批量删除群组
// @Tags Group
// @Summary 批量删除群组
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.IdsReq true "群组ID列表"
// @Success 200 {object} response.Response{msg=string} "批量删除群组成功"
// @Router /community/deleteGroupByIds [delete]
func (g *GroupApi) DeleteGroupByIds(c *gin.Context) {
	var IDS request.IdsReq
	err := c.ShouldBindJSON(&IDS)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	
	if err := communityService.DeleteGroupByIds(IDS); err != nil {
		global.GVA_LOG.Error("批量删除群组失败!", zap.Error(err))
		response.FailWithMessage("批量删除群组失败: "+err.Error(), c)
		return
	}
	
	response.OkWithMessage("批量删除群组成功", c)
}

// UpdateGroup 更新群组
// @Tags Group
// @Summary 更新群组
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body community.Group true "群组信息"
// @Success 200 {object} response.Response{msg=string} "更新群组成功"
// @Router /community/updateGroup [put]
func (g *GroupApi) UpdateGroup(c *gin.Context) {
	var group community.Group
	err := c.ShouldBindJSON(&group)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	
	// 校验ID
	if group.ID == 0 {
		response.FailWithMessage("群组ID不能为空", c)
		return
	}
	
	if err := communityService.UpdateGroup(group); err != nil {
		global.GVA_LOG.Error("更新群组失败!", zap.Error(err))
		response.FailWithMessage("更新群组失败: "+err.Error(), c)
		return
	}
	
	response.OkWithMessage("更新群组成功", c)
}

// FindGroup 根据ID获取群组
// @Tags Group
// @Summary 根据ID获取群组
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query request.GetById true "群组ID"
// @Success 200 {object} response.Response{data=community.Group,msg=string} "获取群组成功"
// @Router /community/findGroup [get]
func (g *GroupApi) FindGroup(c *gin.Context) {
	var reqId request.GetById
	if err := c.ShouldBindQuery(&reqId); err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	
	result, err := communityService.GetGroup(reqId.ID)
	if err != nil {
		global.GVA_LOG.Error("获取群组信息失败!", zap.Error(err))
		response.FailWithMessage("获取群组信息失败: "+err.Error(), c)
		return
	}
	
	response.OkWithData(result, c)
}

// GetGroupList 分页获取群组列表
// @Tags Group
// @Summary 分页获取群组列表
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query communityReq.GroupSearch true "查询参数"
// @Success 200 {object} response.Response{data=response.PageResult,msg=string} "获取群组列表成功"
// @Router /community/getGroupList [get]
func (g *GroupApi) GetGroupList(c *gin.Context) {
	var pageInfo communityReq.GroupSearch
	err := c.ShouldBindQuery(&pageInfo)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	
	list, total, err := communityService.GetGroupInfoList(pageInfo)
	if err != nil {
		global.GVA_LOG.Error("获取群组列表失败!", zap.Error(err))
		response.FailWithMessage("获取群组列表失败: "+err.Error(), c)
		return
	}
	
	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     pageInfo.Page,
		PageSize: pageInfo.PageSize,
	}, "获取群组列表成功", c)
}

// ChangeGroupStatus 修改群组状态
// @Tags Group
// @Summary 修改群组状态
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body struct{ID uint;Status int} true "群组ID和状态"
// @Success 200 {object} response.Response{msg=string} "修改群组状态成功"
// @Router /community/changeGroupStatus [put]
func (g *GroupApi) ChangeGroupStatus(c *gin.Context) {
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
		response.FailWithMessage("群组ID不能为空", c)
		return
	}
	
	if err := communityService.ChangeGroupStatus(req.ID, req.Status); err != nil {
		global.GVA_LOG.Error("修改群组状态失败!", zap.Error(err))
		response.FailWithMessage("修改群组状态失败: "+err.Error(), c)
		return
	}
	
	response.OkWithMessage("修改群组状态成功", c)
}
