package community

import (
	"github.com/flipped-aurora/gin-vue-admin/server/api/v1"
	"github.com/flipped-aurora/gin-vue-admin/server/middleware"
	"github.com/gin-gonic/gin"
)

type CommunityRouter struct{}

// InitCommunityRouter 初始化社区管理相关路由
func (r *CommunityRouter) InitCommunityRouter(Router *gin.RouterGroup) {
	communityRouter := Router.Group("community").Use(middleware.OperationRecord())
	communityRouterWithoutRecord := Router.Group("community")
	
	var communityApi = v1.ApiGroupApp.CommunityApiGroup
	{
		// 需要记录操作日志的路由
		communityRouter.POST("createCommunity", communityApi.CreateCommunity)        // 创建社区
		communityRouter.PUT("updateCommunity", communityApi.UpdateCommunity)         // 更新社区
		communityRouter.DELETE("deleteCommunity", communityApi.DeleteCommunity)      // 删除社区
		communityRouter.DELETE("deleteCommunityByIds", communityApi.DeleteCommunityByIds) // 批量删除社区
		communityRouter.PUT("changeCommunityStatus", communityApi.ChangeCommunityStatus) // 修改社区状态
		
		communityRouter.POST("createGroup", communityApi.CreateGroup)         // 创建群组
		communityRouter.PUT("updateGroup", communityApi.UpdateGroup)          // 更新群组
		communityRouter.DELETE("deleteGroup", communityApi.DeleteGroup)       // 删除群组
		communityRouter.DELETE("deleteGroupByIds", communityApi.DeleteGroupByIds) // 批量删除群组
		communityRouter.PUT("changeGroupStatus", communityApi.ChangeGroupStatus) // 修改群组状态
		
		communityRouter.PUT("updatePost", communityApi.UpdatePost)            // 更新帖子
		communityRouter.DELETE("deletePost", communityApi.DeletePost)         // 删除帖子
		communityRouter.DELETE("deletePostByIds", communityApi.DeletePostByIds)   // 批量删除帖子
		communityRouter.PUT("changePostStatus", communityApi.ChangePostStatus)   // 修改帖子状态
		
		communityRouter.DELETE("deleteComment", communityApi.DeleteComment)       // 删除评论
		communityRouter.DELETE("deleteCommentByIds", communityApi.DeleteCommentByIds) // 批量删除评论
		communityRouter.PUT("changeCommentStatus", communityApi.ChangeCommentStatus) // 修改评论状态
		
		// 不需要记录操作日志的路由
		communityRouterWithoutRecord.GET("findCommunity", communityApi.FindCommunity)  // 获取社区详情
		communityRouterWithoutRecord.GET("getCommunityList", communityApi.GetCommunityList) // 获取社区列表
		
		communityRouterWithoutRecord.GET("findGroup", communityApi.FindGroup)      // 获取群组详情
		communityRouterWithoutRecord.GET("getGroupList", communityApi.GetGroupList)    // 获取群组列表
		
		communityRouterWithoutRecord.POST("createPost", communityApi.CreatePost)      // 创建帖子
		communityRouterWithoutRecord.GET("findPost", communityApi.FindPost)        // 获取帖子详情
		communityRouterWithoutRecord.GET("getPostList", communityApi.GetPostList)     // 获取帖子列表
		
		communityRouterWithoutRecord.POST("createComment", communityApi.CreateComment)   // 创建评论
		communityRouterWithoutRecord.GET("findComment", communityApi.FindComment)     // 获取评论详情
		communityRouterWithoutRecord.GET("getCommentList", communityApi.GetCommentList)  // 获取评论列表
	}
}
