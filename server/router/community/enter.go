package community

import "github.com/gin-gonic/gin"

type RouterGroup struct {
	CommunityRouter
}

// InitCommunityRouterGroup 初始化社区相关路由
func (r *RouterGroup) InitCommunityRouterGroup(Router *gin.RouterGroup) {
	communityRouter := Router.Group("community")
	communityRouterWithoutRecord := Router.Group("community")
	communityRouterPublic := Router.Group("community")
	{
		r.CommunityRouter.InitCommunityRouter(communityRouter)
	}
}
