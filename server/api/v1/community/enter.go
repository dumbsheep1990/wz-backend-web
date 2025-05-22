package community

import "github.com/flipped-aurora/gin-vue-admin/server/service"

type ApiGroup struct {
	CommunityApi
	GroupApi
	PostApi
	CommentApi
	SimilarApi
}

var (
	communityService = service.ServiceGroupApp.CommunityServiceGroup.CommunityService
	groupService = service.ServiceGroupApp.CommunityServiceGroup.GroupService
	postService = service.ServiceGroupApp.CommunityServiceGroup.PostService
	commentService = service.ServiceGroupApp.CommunityServiceGroup.CommentService
	similarService = service.ServiceGroupApp.CommunityServiceGroup.SimilarService
)
