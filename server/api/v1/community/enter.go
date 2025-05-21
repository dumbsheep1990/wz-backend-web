package community

import "github.com/flipped-aurora/gin-vue-admin/server/service"

type ApiGroup struct {
	CommunityApi
	GroupApi
	PostApi
	CommentApi
}

var (
	communityService = service.ServiceGroupApp.CommunityServiceGroup.CommunityService
)
