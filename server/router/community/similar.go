package community

import (
	"github.com/gin-gonic/gin"
	v1 "github.com/wz-project/wz-backend-web/server/api/v1"
	"github.com/wz-project/wz-backend-web/server/middleware"
)

type SimilarRouter struct{}

// InitSimilarRouter 初始化相同圈子路由
func (s *SimilarRouter) InitSimilarRouter(Router *gin.RouterGroup) {
	similarRouter := Router.Group("similar").Use(middleware.OperationRecord())
	similarRouterWithoutRecord := Router.Group("similar")
	similarPublicRouter := Router.Group("similar")
	
	var similarApi = v1.ApiGroupApp.CommunityApiGroup.SimilarApi
	{
		// 需要认证和记录操作的路由
		similarRouter.POST("application", similarApi.CreateSimilarApplication)            // 创建相同圈子申请
		similarRouter.PUT("application", similarApi.UpdateSimilarApplication)             // 更新相同圈子申请
		similarRouter.DELETE("application", similarApi.DeleteSimilarApplication)          // 删除相同圈子申请
		similarRouter.PATCH("application/status", similarApi.UpdateSimilarApplicationStatus) // 更新相同圈子申请状态
	}
	{
		// 需要认证但不记录操作的路由
		similarRouterWithoutRecord.GET("application", similarApi.GetSimilarApplication)          // 获取单个相同圈子申请
		similarRouterWithoutRecord.GET("application/list", similarApi.GetSimilarApplicationList) // 获取相同圈子申请列表
		similarRouterWithoutRecord.GET("circles", similarApi.GetSimilarCircles)                  // 获取相同圈子列表
		similarRouterWithoutRecord.GET("circle/members", similarApi.GetSimilarCircleMembers)     // 获取相同圈子成员列表
	}
	{
		// 公开路由，不需要认证
		similarPublicRouter.GET("categories", similarApi.GetSimilarCategories) // 获取所有相同圈子分类
	}
}
