package community

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
)

// Group 群组模型
type Group struct {
	global.GVA_MODEL
	Name        string `json:"name" gorm:"comment:群组名称"`
	Description string `json:"description" gorm:"type:text;comment:群组描述"`
	CommunityId uint   `json:"communityId" gorm:"comment:所属社区ID"`
	OwnerId     uint   `json:"ownerId" gorm:"comment:创建者ID"`
	Avatar      string `json:"avatar" gorm:"comment:群组头像"`
	Tags        string `json:"tags" gorm:"comment:群组标签，多个用逗号分隔"`
	Status      int    `json:"status" gorm:"default:1;comment:状态 1:正常 2:禁用"`
	MemberCount int    `json:"memberCount" gorm:"default:0;comment:成员数量"`
	PostCount   int    `json:"postCount" gorm:"default:0;comment:帖子数量"`
}

// TableName 设置表名
func (Group) TableName() string {
	return "community_groups"
}
