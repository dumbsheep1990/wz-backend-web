package community

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
)

// Post 帖子模型
type Post struct {
	global.GVA_MODEL
	Title        string `json:"title" gorm:"comment:帖子标题"`
	Content      string `json:"content" gorm:"type:text;comment:帖子内容"`
	CommunityId  uint   `json:"communityId" gorm:"comment:所属社区ID"`
	GroupId      uint   `json:"groupId" gorm:"comment:所属群组ID"`
	AuthorId     uint   `json:"authorId" gorm:"comment:作者ID"`
	Status       int    `json:"status" gorm:"default:1;comment:状态 1:正常 2:隐藏 3:禁止"`
	ViewCount    int    `json:"viewCount" gorm:"default:0;comment:浏览次数"`
	LikeCount    int    `json:"likeCount" gorm:"default:0;comment:点赞数"`
	CommentCount int    `json:"commentCount" gorm:"default:0;comment:评论数"`
	Tags         string `json:"tags" gorm:"comment:帖子标签，多个用逗号分隔"`
}

// TableName 设置表名
func (Post) TableName() string {
	return "community_posts"
}
