package community

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
)

// Comment 评论模型
type Comment struct {
	global.GVA_MODEL
	Content   string `json:"content" gorm:"type:text;comment:评论内容"`
	PostId    uint   `json:"postId" gorm:"comment:所属帖子ID"`
	AuthorId  uint   `json:"authorId" gorm:"comment:作者ID"`
	ParentId  uint   `json:"parentId" gorm:"default:0;comment:父评论ID，0表示顶级评论"`
	Status    int    `json:"status" gorm:"default:1;comment:状态 1:正常 2:隐藏"`
	LikeCount int    `json:"likeCount" gorm:"default:0;comment:点赞数"`
}

// TableName 设置表名
func (Comment) TableName() string {
	return "community_comments"
}
