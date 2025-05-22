package request

import (
	"github.com/wz-project/wz-backend-web/server/model/common/request"
)

// SimilarApplicationSearch 相同圈子申请搜索条件
type SimilarApplicationSearch struct {
	request.PageInfo
	ApplicationType string `json:"applicationType" form:"applicationType"` // 申请类型
	Status          string `json:"status" form:"status"`                  // 状态
	Name            string `json:"name" form:"name"`                      // 姓名
	Keyword         string `json:"keyword" form:"keyword"`                // 关键词
	UserID          string `json:"userId" form:"userId"`                  // 用户ID
	StartTime       string `json:"startTime" form:"startTime"`            // 开始时间
	EndTime         string `json:"endTime" form:"endTime"`                // 结束时间
}

// CircleMemberSearch 圈子成员搜索条件
type CircleMemberSearch struct {
	request.PageInfo
	CircleID string `json:"circleId" form:"circleId"` // 圈子ID
	Role     string `json:"role" form:"role"`         // 角色
	Status   string `json:"status" form:"status"`     // 状态
	Keyword  string `json:"keyword" form:"keyword"`   // 关键词
}

// StatusRequest 状态更新请求
type StatusRequest struct {
	ID     string `json:"id" form:"id"`         // ID
	Status string `json:"status" form:"status"` // 状态
}

// RoleRequest 角色更新请求
type RoleRequest struct {
	ID   string `json:"id" form:"id"`     // ID
	Role string `json:"role" form:"role"` // 角色
}
