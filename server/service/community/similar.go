package community

import (
	"errors"
	"time"

	"github.com/wz-project/wz-backend-web/server/global"
	"github.com/wz-project/wz-backend-web/server/model/common/request"
	"github.com/wz-project/wz-backend-web/server/model/community"
	communityReq "github.com/wz-project/wz-backend-web/server/model/community/request"
	"gorm.io/gorm"
)

type SimilarService struct {
}

// CreateSimilarApplication 创建相同圈子申请
func (s *SimilarService) CreateSimilarApplication(application community.SimilarApplication) error {
	// 设置默认状态和时间
	application.Status = "pending"
	return global.GVA_DB.Create(&application).Error
}

// DeleteSimilarApplication 删除相同圈子申请
func (s *SimilarService) DeleteSimilarApplication(application community.SimilarApplication) error {
	return global.GVA_DB.Delete(&application).Error
}

// UpdateSimilarApplication 更新相同圈子申请
func (s *SimilarService) UpdateSimilarApplication(application community.SimilarApplication) error {
	return global.GVA_DB.Model(&application).Updates(map[string]interface{}{
		"application_type": application.ApplicationType,
		"name":             application.Name,
		"gender":           application.Gender,
		"birthplace":       application.Birthplace,
		"occupation":       application.Occupation,
		"education":        application.Education,
		"work_position":    application.WorkPosition,
		"work_place":       application.WorkPlace,
		"hobby":            application.Hobby,
		"address":          application.Address,
		"contact_type":     application.ContactType,
		"contact_value":    application.ContactValue,
		"description":      application.Description,
	}).Error
}

// UpdateSimilarApplicationStatus 更新相同圈子申请状态
func (s *SimilarService) UpdateSimilarApplicationStatus(id string, status string) error {
	// 获取当前管理员信息
	currentAdmin := "admin" // 这里应该从上下文获取当前管理员ID

	// 更新状态
	var application community.SimilarApplication
	if err := global.GVA_DB.First(&application, "id = ?", id).Error; err != nil {
		return err
	}

	updates := map[string]interface{}{
		"status": status,
	}

	// 如果是审批通过，设置审批信息
	if status == "approved" {
		updates["approved_at"] = time.Now()
		updates["approved_by"] = currentAdmin

		// 如果审批通过，需要创建或关联圈子
		if err := s.handleApprovedApplication(&application); err != nil {
			return err
		}
	}

	return global.GVA_DB.Model(&application).Updates(updates).Error
}

// handleApprovedApplication 处理审批通过的申请
func (s *SimilarService) handleApprovedApplication(application *community.SimilarApplication) error {
	// 查找是否已有相同类型的圈子
	var circle community.SimilarCircle
	err := global.GVA_DB.Where("circle_type = ?", application.ApplicationType).First(&circle).Error
	
	// 如果没有，则创建新圈子
	if err != nil && errors.Is(err, gorm.ErrRecordNotFound) {
		circle = community.SimilarCircle{
			CircleType:  application.ApplicationType,
			Name:        application.ApplicationType + "圈子",
			Description: application.ApplicationType + "的相同圈子",
			Status:      "active",
			CreatorID:   application.UserID,
		}
		if err := global.GVA_DB.Create(&circle).Error; err != nil {
			return err
		}
	} else if err != nil {
		return err
	}

	// 关联申请与圈子
	application.CircleID = circle.ID.String()
	if err := global.GVA_DB.Save(application).Error; err != nil {
		return err
	}

	// 将申请人添加为圈子成员
	member := community.SimilarCircleMember{
		CircleID:      circle.ID.String(),
		UserID:        application.UserID,
		Role:          "member",
		JoinedAt:      time.Now(),
		ApplicationID: application.ID.String(),
		Status:        "active",
		LastActiveAt:  time.Now(),
	}

	// 如果是第一个成员，设为管理员
	count := int64(0)
	if err := global.GVA_DB.Model(&community.SimilarCircleMember{}).Where("circle_id = ?", circle.ID).Count(&count).Error; err != nil {
		return err
	}
	
	if count == 0 {
		member.Role = "admin"
	}

	// 添加成员
	if err := global.GVA_DB.Create(&member).Error; err != nil {
		return err
	}

	// 更新圈子成员数量
	return global.GVA_DB.Model(&circle).UpdateColumn("member_count", gorm.Expr("member_count + ?", 1)).Error
}

// GetSimilarApplication 获取单个相同圈子申请
func (s *SimilarService) GetSimilarApplication(id string) (community.SimilarApplication, error) {
	var application community.SimilarApplication
	err := global.GVA_DB.Preload("User").Where("id = ?", id).First(&application).Error
	return application, err
}

// GetSimilarApplicationList 获取相同圈子申请列表
func (s *SimilarService) GetSimilarApplicationList(info communityReq.SimilarApplicationSearch) (list []community.SimilarApplication, total int64, err error) {
	limit := info.PageSize
	offset := info.PageSize * (info.Page - 1)
	db := global.GVA_DB.Model(&community.SimilarApplication{}).Preload("User")

	// 添加查询条件
	if info.ApplicationType != "" {
		db = db.Where("application_type = ?", info.ApplicationType)
	}
	if info.Status != "" {
		db = db.Where("status = ?", info.Status)
	}
	if info.Name != "" {
		db = db.Where("name LIKE ?", "%"+info.Name+"%")
	}
	if info.UserID != "" {
		db = db.Where("user_id = ?", info.UserID)
	}
	if info.Keyword != "" {
		db = db.Where("name LIKE ? OR description LIKE ?", "%"+info.Keyword+"%", "%"+info.Keyword+"%")
	}
	if info.StartTime != "" && info.EndTime != "" {
		db = db.Where("created_at BETWEEN ? AND ?", info.StartTime, info.EndTime)
	}

	// 获取总数
	err = db.Count(&total).Error
	if err != nil {
		return
	}

	// 获取数据
	err = db.Limit(limit).Offset(offset).Order("created_at DESC").Find(&list).Error
	return
}

// GetSimilarCategories 获取所有相同圈子分类
func (s *SimilarService) GetSimilarCategories() ([]community.SimilarCategory, error) {
	// 获取所有同X分类
	categories := []community.SimilarCategory{
		{Code: string(community.SimilarCategoryTongYong), Name: string(community.SimilarCategoryTongYong)},
		{Code: string(community.SimilarCategoryTongHao), Name: string(community.SimilarCategoryTongHao)},
		{Code: string(community.SimilarCategoryTongGou), Name: string(community.SimilarCategoryTongGou)},
		{Code: string(community.SimilarCategoryTongNian), Name: string(community.SimilarCategoryTongNian)},
		{Code: string(community.SimilarCategoryTongYou), Name: string(community.SimilarCategoryTongYou)},
		{Code: string(community.SimilarCategoryTongZai), Name: string(community.SimilarCategoryTongZai)},
		{Code: string(community.SimilarCategoryTongShi), Name: string(community.SimilarCategoryTongShi)},
		{Code: string(community.SimilarCategoryTongQi), Name: string(community.SimilarCategoryTongQi)},
		{Code: string(community.SimilarCategoryTongQin), Name: string(community.SimilarCategoryTongQin)},
		{Code: string(community.SimilarCategoryTongBan), Name: string(community.SimilarCategoryTongBan)},
		{Code: string(community.SimilarCategoryTongShi2), Name: string(community.SimilarCategoryTongShi2)},
		{Code: string(community.SimilarCategoryTongYe), Name: string(community.SimilarCategoryTongYe)},
		{Code: string(community.SimilarCategoryTongWang), Name: string(community.SimilarCategoryTongWang)},
		{Code: string(community.SimilarCategoryTongGong), Name: string(community.SimilarCategoryTongGong)},
		{Code: string(community.SimilarCategoryTongWu), Name: string(community.SimilarCategoryTongWu)},
		{Code: string(community.SimilarCategoryTongYi), Name: string(community.SimilarCategoryTongYi)},
		{Code: string(community.SimilarCategoryTongWan), Name: string(community.SimilarCategoryTongWan)},
		{Code: string(community.SimilarCategoryTongXian), Name: string(community.SimilarCategoryTongXian)},
		{Code: string(community.SimilarCategoryTongPai), Name: string(community.SimilarCategoryTongPai)},
		{Code: string(community.SimilarCategoryTongXiang), Name: string(community.SimilarCategoryTongXiang)},
		{Code: string(community.SimilarCategoryTongXue), Name: string(community.SimilarCategoryTongXue)},
	}
	return categories, nil
}

// GetSimilarCircles 获取相同圈子列表
func (s *SimilarService) GetSimilarCircles(info request.PageInfo) (list []community.SimilarCircle, total int64, err error) {
	limit := info.PageSize
	offset := info.PageSize * (info.Page - 1)
	db := global.GVA_DB.Model(&community.SimilarCircle{}).Preload("Creator")

	// 获取总数
	err = db.Count(&total).Error
	if err != nil {
		return
	}

	// 获取数据
	err = db.Limit(limit).Offset(offset).Order("created_at DESC").Find(&list).Error
	return
}

// GetSimilarCircleMembers 获取相同圈子成员列表
func (s *SimilarService) GetSimilarCircleMembers(info communityReq.CircleMemberSearch) (list []community.SimilarCircleMember, total int64, err error) {
	limit := info.PageSize
	offset := info.PageSize * (info.Page - 1)
	db := global.GVA_DB.Model(&community.SimilarCircleMember{}).
		Preload("User").
		Preload("Application").
		Where("circle_id = ?", info.CircleID)

	// 添加查询条件
	if info.Role != "" {
		db = db.Where("role = ?", info.Role)
	}
	if info.Status != "" {
		db = db.Where("status = ?", info.Status)
	}
	if info.Keyword != "" {
		// 联表查询用户名或昵称
		db = db.Joins("LEFT JOIN sys_users ON similar_circle_members.user_id = sys_users.id").
			Where("sys_users.nick_name LIKE ? OR sys_users.username LIKE ?", "%"+info.Keyword+"%", "%"+info.Keyword+"%")
	}

	// 获取总数
	err = db.Count(&total).Error
	if err != nil {
		return
	}

	// 获取数据
	err = db.Limit(limit).Offset(offset).Order("joined_at DESC").Find(&list).Error
	return
}

// UpdateSimilarCircleStatus 更新相同圈子状态
func (s *SimilarService) UpdateSimilarCircleStatus(id string, status string) error {
	var circle community.SimilarCircle
	if err := global.GVA_DB.First(&circle, "id = ?", id).Error; err != nil {
		return err
	}

	return global.GVA_DB.Model(&circle).Update("status", status).Error
}

// UpdateMemberRole 更新成员角色
func (s *SimilarService) UpdateMemberRole(id string, role string) error {
	// 验证角色有效性
	if role != "admin" && role != "member" {
		return errors.New("无效的角色类型")
	}

	// 获取成员信息
	var member community.SimilarCircleMember
	if err := global.GVA_DB.First(&member, "id = ?", id).Error; err != nil {
		return err
	}

	// 更新角色
	return global.GVA_DB.Model(&member).Update("role", role).Error
}

// UpdateMemberStatus 更新成员状态
func (s *SimilarService) UpdateMemberStatus(id string, status string) error {
	// 验证状态有效性
	if status != "active" && status != "banned" {
		return errors.New("无效的状态类型")
	}

	// 获取成员信息
	var member community.SimilarCircleMember
	if err := global.GVA_DB.First(&member, "id = ?", id).Error; err != nil {
		return err
	}

	// 更新状态
	return global.GVA_DB.Model(&member).Updates(map[string]interface{}{
		"status":       status,
		"last_active_at": time.Now(),
	}).Error
}

// RemoveMember 移除成员
func (s *SimilarService) RemoveMember(id string) error {
	// 获取成员信息
	var member community.SimilarCircleMember
	if err := global.GVA_DB.First(&member, "id = ?", id).Error; err != nil {
		return err
	}

	// 获取圈子信息
	var circle community.SimilarCircle
	if err := global.GVA_DB.First(&circle, "id = ?", member.CircleID).Error; err != nil {
		return err
	}

	// 事务处理
	return global.GVA_DB.Transaction(func(tx *gorm.DB) error {
		// 1. 删除成员
		if err := tx.Delete(&member).Error; err != nil {
			return err
		}

		// 2. 更新圈子成员数量
		if err := tx.Model(&circle).UpdateColumn("member_count", gorm.Expr("member_count - ?", 1)).Error; err != nil {
			return err
		}

		return nil
	})
}
