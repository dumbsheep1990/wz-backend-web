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

type PostApi struct{}

// CreatePost 创建帖子
// @Tags Post
// @Summary 创建帖子
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body community.Post true "帖子信息"
// @Success 200 {object} response.Response{msg=string} "创建帖子成功"
// @Router /community/createPost [post]
func (p *PostApi) CreatePost(c *gin.Context) {
	var post community.Post
	err := c.ShouldBindJSON(&post)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	
	// 校验必填字段
	if post.Title == "" {
		response.FailWithMessage("帖子标题不能为空", c)
		return
	}
	
	if post.Content == "" {
		response.FailWithMessage("帖子内容不能为空", c)
		return
	}
	
	// 获取当前用户ID
	userID := getUserID(c)
	if userID != 0 {
		post.AuthorId = userID
	}
	
	err = communityService.CreatePost(post)
	if err != nil {
		global.GVA_LOG.Error("创建帖子失败!", zap.Error(err))
		response.FailWithMessage("创建帖子失败: "+err.Error(), c)
		return
	}
	
	response.OkWithMessage("创建帖子成功", c)
}

// DeletePost 删除帖子
// @Tags Post
// @Summary 删除帖子
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.GetById true "帖子ID"
// @Success 200 {object} response.Response{msg=string} "删除帖子成功"
// @Router /community/deletePost [delete]
func (p *PostApi) DeletePost(c *gin.Context) {
	var reqId request.GetById
	err := c.ShouldBindJSON(&reqId)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	
	if err := communityService.DeletePost(reqId.ID); err != nil {
		global.GVA_LOG.Error("删除帖子失败!", zap.Error(err))
		response.FailWithMessage("删除帖子失败: "+err.Error(), c)
		return
	}
	
	response.OkWithMessage("删除帖子成功", c)
}

// DeletePostByIds 批量删除帖子
// @Tags Post
// @Summary 批量删除帖子
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.IdsReq true "帖子ID列表"
// @Success 200 {object} response.Response{msg=string} "批量删除帖子成功"
// @Router /community/deletePostByIds [delete]
func (p *PostApi) DeletePostByIds(c *gin.Context) {
	var IDS request.IdsReq
	err := c.ShouldBindJSON(&IDS)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	
	if err := communityService.DeletePostByIds(IDS); err != nil {
		global.GVA_LOG.Error("批量删除帖子失败!", zap.Error(err))
		response.FailWithMessage("批量删除帖子失败: "+err.Error(), c)
		return
	}
	
	response.OkWithMessage("批量删除帖子成功", c)
}

// UpdatePost 更新帖子
// @Tags Post
// @Summary 更新帖子
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body community.Post true "帖子信息"
// @Success 200 {object} response.Response{msg=string} "更新帖子成功"
// @Router /community/updatePost [put]
func (p *PostApi) UpdatePost(c *gin.Context) {
	var post community.Post
	err := c.ShouldBindJSON(&post)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	
	// 校验ID
	if post.ID == 0 {
		response.FailWithMessage("帖子ID不能为空", c)
		return
	}
	
	if err := communityService.UpdatePost(post); err != nil {
		global.GVA_LOG.Error("更新帖子失败!", zap.Error(err))
		response.FailWithMessage("更新帖子失败: "+err.Error(), c)
		return
	}
	
	response.OkWithMessage("更新帖子成功", c)
}

// FindPost 根据ID获取帖子
// @Tags Post
// @Summary 根据ID获取帖子
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query request.GetById true "帖子ID"
// @Success 200 {object} response.Response{data=community.Post,msg=string} "获取帖子成功"
// @Router /community/findPost [get]
func (p *PostApi) FindPost(c *gin.Context) {
	var reqId request.GetById
	if err := c.ShouldBindQuery(&reqId); err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	
	result, err := communityService.GetPost(reqId.ID)
	if err != nil {
		global.GVA_LOG.Error("获取帖子信息失败!", zap.Error(err))
		response.FailWithMessage("获取帖子信息失败: "+err.Error(), c)
		return
	}
	
	response.OkWithData(result, c)
}

// GetPostList 分页获取帖子列表
// @Tags Post
// @Summary 分页获取帖子列表
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query communityReq.PostSearch true "查询参数"
// @Success 200 {object} response.Response{data=response.PageResult,msg=string} "获取帖子列表成功"
// @Router /community/getPostList [get]
func (p *PostApi) GetPostList(c *gin.Context) {
	var pageInfo communityReq.PostSearch
	err := c.ShouldBindQuery(&pageInfo)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	
	list, total, err := communityService.GetPostInfoList(pageInfo)
	if err != nil {
		global.GVA_LOG.Error("获取帖子列表失败!", zap.Error(err))
		response.FailWithMessage("获取帖子列表失败: "+err.Error(), c)
		return
	}
	
	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     pageInfo.Page,
		PageSize: pageInfo.PageSize,
	}, "获取帖子列表成功", c)
}

// ChangePostStatus 修改帖子状态
// @Tags Post
// @Summary 修改帖子状态
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body struct{ID uint;Status int} true "帖子ID和状态"
// @Success 200 {object} response.Response{msg=string} "修改帖子状态成功"
// @Router /community/changePostStatus [put]
func (p *PostApi) ChangePostStatus(c *gin.Context) {
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
		response.FailWithMessage("帖子ID不能为空", c)
		return
	}
	
	if err := communityService.ChangePostStatus(req.ID, req.Status); err != nil {
		global.GVA_LOG.Error("修改帖子状态失败!", zap.Error(err))
		response.FailWithMessage("修改帖子状态失败: "+err.Error(), c)
		return
	}
	
	response.OkWithMessage("修改帖子状态成功", c)
}
