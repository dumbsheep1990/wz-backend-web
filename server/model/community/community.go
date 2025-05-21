package community

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
)

// Community 社区模型
type Community struct {
	global.GVA_MODEL
	Name        string `json:"name" gorm:"comment:社区名称"`
	Description string `json:"description" gorm:"type:text;comment:社区描述"`
	OwnerId     uint   `json:"ownerId" gorm:"comment:创建者ID"`
	Avatar      string `json:"avatar" gorm:"comment:社区头像"`
	Cover       string `json:"cover" gorm:"comment:社区封面"`
	Tags        string `json:"tags" gorm:"comment:社区标签，多个用逗号分隔"`
	Location    string `json:"location" gorm:"comment:社区地理位置"`
	Status      int    `json:"status" gorm:"default:1;comment:状态 1:正常 2:禁用"`
	MemberCount int    `json:"memberCount" gorm:"default:0;comment:成员数量"`
	GroupCount  int    `json:"groupCount" gorm:"default:0;comment:群组数量"`
	PostCount   int    `json:"postCount" gorm:"default:0;comment:帖子数量"`
}

// TableName 设置表名
func (Community) TableName() string {
	return "communities"
}
