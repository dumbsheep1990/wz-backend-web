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

type CommentApi struct{}

// CreateComment 创建评论
// @Tags Comment
// @Summary 创建评论
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body community.Comment true "评论信息"
// @Success 200 {object} response.Response{msg=string} "创建评论成功"
// @Router /community/createComment [post]
func (comm *CommentApi) CreateComment(c *gin.Context) {
	var comment community.Comment
	err := c.ShouldBindJSON(&comment)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	
	// 校验必填字段
	if comment.Content == "" {
		response.FailWithMessage("评论内容不能为空", c)
		return
	}
	
	if comment.PostId == 0 {
		response.FailWithMessage("帖子ID不能为空", c)
		return
	}
	
	// 获取当前用户ID
	userID := getUserID(c)
	if userID != 0 {
		comment.AuthorId = userID
	}
	
	err = communityService.CreateComment(comment)
	if err != nil {
		global.GVA_LOG.Error("创建评论失败!", zap.Error(err))
		response.FailWithMessage("创建评论失败: "+err.Error(), c)
		return
	}
	
	response.OkWithMessage("创建评论成功", c)
}

// DeleteComment 删除评论
// @Tags Comment
// @Summary 删除评论
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.GetById true "评论ID"
// @Success 200 {object} response.Response{msg=string} "删除评论成功"
// @Router /community/deleteComment [delete]
func (comm *CommentApi) DeleteComment(c *gin.Context) {
	var reqId request.GetById
	err := c.ShouldBindJSON(&reqId)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	
	if err := communityService.DeleteComment(reqId.ID); err != nil {
		global.GVA_LOG.Error("删除评论失败!", zap.Error(err))
		response.FailWithMessage("删除评论失败: "+err.Error(), c)
		return
	}
	
	response.OkWithMessage("删除评论成功", c)
}

// DeleteCommentByIds 批量删除评论
// @Tags Comment
// @Summary 批量删除评论
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.IdsReq true "评论ID列表"
// @Success 200 {object} response.Response{msg=string} "批量删除评论成功"
// @Router /community/deleteCommentByIds [delete]
func (comm *CommentApi) DeleteCommentByIds(c *gin.Context) {
	var IDS request.IdsReq
	err := c.ShouldBindJSON(&IDS)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	
	if err := communityService.DeleteCommentByIds(IDS); err != nil {
		global.GVA_LOG.Error("批量删除评论失败!", zap.Error(err))
		response.FailWithMessage("批量删除评论失败: "+err.Error(), c)
		return
	}
	
	response.OkWithMessage("批量删除评论成功", c)
}

// GetComment 根据ID获取评论
// @Tags Comment
// @Summary 根据ID获取评论
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query request.GetById true "评论ID"
// @Success 200 {object} response.Response{data=community.Comment,msg=string} "获取评论成功"
// @Router /community/findComment [get]
func (comm *CommentApi) FindComment(c *gin.Context) {
	var reqId request.GetById
	if err := c.ShouldBindQuery(&reqId); err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	
	result, err := communityService.GetComment(reqId.ID)
	if err != nil {
		global.GVA_LOG.Error("获取评论信息失败!", zap.Error(err))
		response.FailWithMessage("获取评论信息失败: "+err.Error(), c)
		return
	}
	
	response.OkWithData(result, c)
}

// GetCommentList 分页获取评论列表
// @Tags Comment
// @Summary 分页获取评论列表
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query communityReq.CommentSearch true "查询参数"
// @Success 200 {object} response.Response{data=response.PageResult,msg=string} "获取评论列表成功"
// @Router /community/getCommentList [get]
func (comm *CommentApi) GetCommentList(c *gin.Context) {
	var pageInfo communityReq.CommentSearch
	err := c.ShouldBindQuery(&pageInfo)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	
	list, total, err := communityService.GetCommentInfoList(pageInfo)
	if err != nil {
		global.GVA_LOG.Error("获取评论列表失败!", zap.Error(err))
		response.FailWithMessage("获取评论列表失败: "+err.Error(), c)
		return
	}
	
	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     pageInfo.Page,
		PageSize: pageInfo.PageSize,
	}, "获取评论列表成功", c)
}

// ChangeCommentStatus 修改评论状态
// @Tags Comment
// @Summary 修改评论状态
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body struct{ID uint;Status int} true "评论ID和状态"
// @Success 200 {object} response.Response{msg=string} "修改评论状态成功"
// @Router /community/changeCommentStatus [put]
func (comm *CommentApi) ChangeCommentStatus(c *gin.Context) {
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
		response.FailWithMessage("评论ID不能为空", c)
		return
	}
	
	if err := communityService.ChangeCommentStatus(req.ID, req.Status); err != nil {
		global.GVA_LOG.Error("修改评论状态失败!", zap.Error(err))
		response.FailWithMessage("修改评论状态失败: "+err.Error(), c)
		return
	}
	
	response.OkWithMessage("修改评论状态成功", c)
}
