package community

import (
	"github.com/gin-gonic/gin"
	"github.com/wz-project/wz-backend-web/server/global"
	"github.com/wz-project/wz-backend-web/server/model/common/request"
	"github.com/wz-project/wz-backend-web/server/model/common/response"
	"github.com/wz-project/wz-backend-web/server/model/community"
	communityReq "github.com/wz-project/wz-backend-web/server/model/community/request"
	"github.com/wz-project/wz-backend-web/server/service"
	"github.com/wz-project/wz-backend-web/server/utils"
	"go.uber.org/zap"
)

type SimilarApi struct {
}

// CreateSimilarApplication 创建相同圈子申请
// @Tags Similar
// @Summary 创建相同圈子申请
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body community.SimilarApplication true "申请数据"
// @Success 200 {object} response.Response{data=community.SimilarApplication} "创建成功"
// @Router /community/similar/application [post]
func (s *SimilarApi) CreateSimilarApplication(c *gin.Context) {
	var application community.SimilarApplication
	err := c.ShouldBindJSON(&application)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	verify := utils.Rules{
		"ApplicationType": {utils.NotEmpty()},
		"Name":            {utils.NotEmpty()},
		"Gender":          {utils.NotEmpty()},
		"Birthplace":      {utils.NotEmpty()},
	}
	if err := utils.Verify(application, verify); err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	
	// 设置用户ID，从JWT获取
	userID := utils.GetUserID(c)
	application.UserID = userID
	
	if err := service.ServiceGroupApp.CommunityServiceGroup.SimilarService.CreateSimilarApplication(application); err != nil {
		global.GVA_LOG.Error("创建失败!", zap.Error(err))
		response.FailWithMessage("创建失败: "+err.Error(), c)
		return
	}
	response.OkWithMessage("创建成功", c)
}

// DeleteSimilarApplication 删除相同圈子申请
// @Tags Similar
// @Summary 删除相同圈子申请
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body community.SimilarApplication true "删除申请"
// @Success 200 {object} response.Response{} "删除成功"
// @Router /community/similar/application [delete]
func (s *SimilarApi) DeleteSimilarApplication(c *gin.Context) {
	var application community.SimilarApplication
	err := c.ShouldBindJSON(&application)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	if err := service.ServiceGroupApp.CommunityServiceGroup.SimilarService.DeleteSimilarApplication(application); err != nil {
		global.GVA_LOG.Error("删除失败!", zap.Error(err))
		response.FailWithMessage("删除失败: "+err.Error(), c)
		return
	}
	response.OkWithMessage("删除成功", c)
}

// UpdateSimilarApplication 更新相同圈子申请
// @Tags Similar
// @Summary 更新相同圈子申请
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body community.SimilarApplication true "更新申请"
// @Success 200 {object} response.Response{} "更新成功"
// @Router /community/similar/application [put]
func (s *SimilarApi) UpdateSimilarApplication(c *gin.Context) {
	var application community.SimilarApplication
	err := c.ShouldBindJSON(&application)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	verify := utils.Rules{
		"ID": {utils.NotEmpty()},
	}
	if err := utils.Verify(application, verify); err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	if err := service.ServiceGroupApp.CommunityServiceGroup.SimilarService.UpdateSimilarApplication(application); err != nil {
		global.GVA_LOG.Error("更新失败!", zap.Error(err))
		response.FailWithMessage("更新失败: "+err.Error(), c)
		return
	}
	response.OkWithMessage("更新成功", c)
}

// UpdateSimilarApplicationStatus 更新相同圈子申请状态
// @Tags Similar
// @Summary 更新相同圈子申请状态
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body communityReq.StatusRequest true "申请ID和状态"
// @Success 200 {object} response.Response{} "更新成功"
// @Router /community/similar/application/status [patch]
func (s *SimilarApi) UpdateSimilarApplicationStatus(c *gin.Context) {
	var statusReq communityReq.StatusRequest
	err := c.ShouldBindJSON(&statusReq)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	verify := utils.Rules{
		"ID":     {utils.NotEmpty()},
		"Status": {utils.NotEmpty()},
	}
	if err := utils.Verify(statusReq, verify); err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	if err := service.ServiceGroupApp.CommunityServiceGroup.SimilarService.UpdateSimilarApplicationStatus(statusReq.ID, statusReq.Status); err != nil {
		global.GVA_LOG.Error("更新状态失败!", zap.Error(err))
		response.FailWithMessage("更新状态失败: "+err.Error(), c)
		return
	}
	response.OkWithMessage("更新状态成功", c)
}

// GetSimilarApplication 获取单个相同圈子申请
// @Tags Similar
// @Summary 获取单个相同圈子申请
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query community.SimilarApplication true "申请ID"
// @Success 200 {object} response.Response{data=community.SimilarApplication} "获取成功"
// @Router /community/similar/application [get]
func (s *SimilarApi) GetSimilarApplication(c *gin.Context) {
	var application community.SimilarApplication
	err := c.ShouldBindQuery(&application)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	if application, err = service.ServiceGroupApp.CommunityServiceGroup.SimilarService.GetSimilarApplication(application.ID); err != nil {
		global.GVA_LOG.Error("获取失败!", zap.Error(err))
		response.FailWithMessage("获取失败: "+err.Error(), c)
		return
	}
	response.OkWithData(application, c)
}

// GetSimilarApplicationList 获取相同圈子申请列表
// @Tags Similar
// @Summary 获取相同圈子申请列表
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query communityReq.SimilarApplicationSearch true "页码, 每页大小, 搜索条件"
// @Success 200 {object} response.Response{data=response.PageResult{list=[]community.SimilarApplication}} "获取成功"
// @Router /community/similar/application/list [get]
func (s *SimilarApi) GetSimilarApplicationList(c *gin.Context) {
	var pageInfo communityReq.SimilarApplicationSearch
	err := c.ShouldBindQuery(&pageInfo)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	list, total, err := service.ServiceGroupApp.CommunityServiceGroup.SimilarService.GetSimilarApplicationList(pageInfo)
	if err != nil {
		global.GVA_LOG.Error("获取列表失败!", zap.Error(err))
		response.FailWithMessage("获取列表失败: "+err.Error(), c)
		return
	}
	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     pageInfo.Page,
		PageSize: pageInfo.PageSize,
	}, "获取成功", c)
}

// GetSimilarCategories 获取所有相同圈子分类
// @Tags Similar
// @Summary 获取所有相同圈子分类
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Success 200 {object} response.Response{data=[]community.SimilarCategory} "获取成功"
// @Router /community/similar/categories [get]
func (s *SimilarApi) GetSimilarCategories(c *gin.Context) {
	categories, err := service.ServiceGroupApp.CommunityServiceGroup.SimilarService.GetSimilarCategories()
	if err != nil {
		global.GVA_LOG.Error("获取分类失败!", zap.Error(err))
		response.FailWithMessage("获取分类失败: "+err.Error(), c)
		return
	}
	response.OkWithData(categories, c)
}

// GetSimilarCircles 获取相同圈子列表
// @Tags Similar
// @Summary 获取相同圈子列表
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query request.PageInfo true "页码, 每页大小"
// @Success 200 {object} response.Response{data=response.PageResult{list=[]community.SimilarCircle}} "获取成功"
// @Router /community/similar/circles [get]
func (s *SimilarApi) GetSimilarCircles(c *gin.Context) {
	var pageInfo request.PageInfo
	err := c.ShouldBindQuery(&pageInfo)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	list, total, err := service.ServiceGroupApp.CommunityServiceGroup.SimilarService.GetSimilarCircles(pageInfo)
	if err != nil {
		global.GVA_LOG.Error("获取列表失败!", zap.Error(err))
		response.FailWithMessage("获取列表失败: "+err.Error(), c)
		return
	}
	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     pageInfo.Page,
		PageSize: pageInfo.PageSize,
	}, "获取成功", c)
}

// GetSimilarCircleMembers 获取相同圈子成员列表
// @Tags Similar
// @Summary 获取相同圈子成员列表
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query communityReq.CircleMemberSearch true "圈子ID、页码、每页大小"
// @Success 200 {object} response.Response{data=response.PageResult{list=[]community.SimilarCircleMember}} "获取成功"
// @Router /community/similar/circle/members [get]
func (s *SimilarApi) GetSimilarCircleMembers(c *gin.Context) {
	var search communityReq.CircleMemberSearch
	err := c.ShouldBindQuery(&search)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	verify := utils.Rules{
		"CircleID": {utils.NotEmpty()},
	}
	if err := utils.Verify(search, verify); err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	list, total, err := service.ServiceGroupApp.CommunityServiceGroup.SimilarService.GetSimilarCircleMembers(search)
	if err != nil {
		global.GVA_LOG.Error("获取成员列表失败!", zap.Error(err))
		response.FailWithMessage("获取成员列表失败: "+err.Error(), c)
		return
	}
	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     search.Page,
		PageSize: search.PageSize,
	}, "获取成功", c)
}

// UpdateSimilarCircleStatus 更新相同圈子状态
// @Tags Similar
// @Summary 更新相同圈子状态
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body communityReq.StatusRequest true "圈子ID和状态"
// @Success 200 {object} response.Response{} "更新成功"
// @Router /community/similar/circle/status [patch]
func (s *SimilarApi) UpdateSimilarCircleStatus(c *gin.Context) {
	var statusReq communityReq.StatusRequest
	err := c.ShouldBindJSON(&statusReq)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	verify := utils.Rules{
		"ID":     {utils.NotEmpty()},
		"Status": {utils.NotEmpty()},
	}
	if err := utils.Verify(statusReq, verify); err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	if err := service.ServiceGroupApp.CommunityServiceGroup.SimilarService.UpdateSimilarCircleStatus(statusReq.ID, statusReq.Status); err != nil {
		global.GVA_LOG.Error("更新状态失败!", zap.Error(err))
		response.FailWithMessage("更新状态失败: "+err.Error(), c)
		return
	}
	response.OkWithMessage("更新状态成功", c)
}

// UpdateMemberRole 更新成员角色
// @Tags Similar
// @Summary 更新成员角色
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body communityReq.RoleRequest true "成员ID和角色"
// @Success 200 {object} response.Response{} "更新成功"
// @Router /community/similar/circle/member/role [patch]
func (s *SimilarApi) UpdateMemberRole(c *gin.Context) {
	var roleReq communityReq.RoleRequest
	err := c.ShouldBindJSON(&roleReq)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	verify := utils.Rules{
		"ID":   {utils.NotEmpty()},
		"Role": {utils.NotEmpty()},
	}
	if err := utils.Verify(roleReq, verify); err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	if err := service.ServiceGroupApp.CommunityServiceGroup.SimilarService.UpdateMemberRole(roleReq.ID, roleReq.Role); err != nil {
		global.GVA_LOG.Error("更新角色失败!", zap.Error(err))
		response.FailWithMessage("更新角色失败: "+err.Error(), c)
		return
	}
	response.OkWithMessage("更新角色成功", c)
}

// UpdateMemberStatus 更新成员状态
// @Tags Similar
// @Summary 更新成员状态
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body communityReq.StatusRequest true "成员ID和状态"
// @Success 200 {object} response.Response{} "更新成功"
// @Router /community/similar/circle/member/status [patch]
func (s *SimilarApi) UpdateMemberStatus(c *gin.Context) {
	var statusReq communityReq.StatusRequest
	err := c.ShouldBindJSON(&statusReq)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	verify := utils.Rules{
		"ID":     {utils.NotEmpty()},
		"Status": {utils.NotEmpty()},
	}
	if err := utils.Verify(statusReq, verify); err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	if err := service.ServiceGroupApp.CommunityServiceGroup.SimilarService.UpdateMemberStatus(statusReq.ID, statusReq.Status); err != nil {
		global.GVA_LOG.Error("更新状态失败!", zap.Error(err))
		response.FailWithMessage("更新状态失败: "+err.Error(), c)
		return
	}
	response.OkWithMessage("更新状态成功", c)
}

// RemoveMember 移除成员
// @Tags Similar
// @Summary 移除成员
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.GetById true "成员ID"
// @Success 200 {object} response.Response{} "移除成功"
// @Router /community/similar/circle/member [delete]
func (s *SimilarApi) RemoveMember(c *gin.Context) {
	var idReq request.GetById
	err := c.ShouldBindJSON(&idReq)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	verify := utils.Rules{
		"ID": {utils.NotEmpty()},
	}
	if err := utils.Verify(idReq, verify); err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	if err := service.ServiceGroupApp.CommunityServiceGroup.SimilarService.RemoveMember(idReq.ID); err != nil {
		global.GVA_LOG.Error("移除成员失败!", zap.Error(err))
		response.FailWithMessage("移除成员失败: "+err.Error(), c)
		return
	}
	response.OkWithMessage("移除成员成功", c)
}
