package community

import (
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/request"
)

// 社区管理请求结构体

// CommunitySearch 社区搜索条件
type CommunitySearch struct {
	request.PageInfo
	Name     string `json:"name" form:"name"`         // 社区名称
	Status   *int   `json:"status" form:"status"`     // 状态
	Location string `json:"location" form:"location"` // 地理位置
	Tags     string `json:"tags" form:"tags"`         // 标签
}

// GroupSearch 群组搜索条件
type GroupSearch struct {
	request.PageInfo
	Name        string `json:"name" form:"name"`               // 群组名称
	CommunityId *uint  `json:"communityId" form:"communityId"` // 所属社区ID
	Status      *int   `json:"status" form:"status"`           // 状态
	Tags        string `json:"tags" form:"tags"`               // 标签
}

// PostSearch 帖子搜索条件
type PostSearch struct {
	request.PageInfo
	Title       string `json:"title" form:"title"`             // 帖子标题
	CommunityId *uint  `json:"communityId" form:"communityId"` // 所属社区ID
	GroupId     *uint  `json:"groupId" form:"groupId"`         // 所属群组ID
	Status      *int   `json:"status" form:"status"`           // 状态
	AuthorId    *uint  `json:"authorId" form:"authorId"`       // 作者ID
	Tags        string `json:"tags" form:"tags"`               // 标签
}

// CommentSearch 评论搜索条件
type CommentSearch struct {
	request.PageInfo
	PostId   *uint  `json:"postId" form:"postId"`     // 所属帖子ID
	AuthorId *uint  `json:"authorId" form:"authorId"` // 作者ID
	Status   *int   `json:"status" form:"status"`     // 状态
	Content  string `json:"content" form:"content"`   // 评论内容关键词
}
