package community

import (
	"errors"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/request"
	"github.com/flipped-aurora/gin-vue-admin/server/model/community"
	"gorm.io/gorm"
)

// CreateGroup 创建群组
func (communityService *CommunityService) CreateGroup(group community.Group) (err error) {
	if err = global.GVA_DB.Create(&group).Error; err != nil {
		return err
	}
	
	// 更新社区的群组数量
	err = global.GVA_DB.Model(&community.Community{}).Where("id = ?", group.CommunityId).
		UpdateColumn("group_count", gorm.Expr("group_count + ?", 1)).Error
		
	return nil
}

// DeleteGroup 删除群组
func (communityService *CommunityService) DeleteGroup(id uint) (err error) {
	var group community.Group
	if err = global.GVA_DB.Where("id = ?", id).First(&group).Error; err != nil {
		return err
	}
	
	if err = global.GVA_DB.Delete(&group).Error; err != nil {
		return err
	}
	
	// 更新社区的群组数量
	err = global.GVA_DB.Model(&community.Community{}).Where("id = ?", group.CommunityId).
		UpdateColumn("group_count", gorm.Expr("group_count - ?", 1)).Error
		
	return nil
}

// DeleteGroupByIds 批量删除群组
func (communityService *CommunityService) DeleteGroupByIds(ids request.IdsReq) (err error) {
	var groups []community.Group
	
	// 先查询群组信息，以便更新社区的群组数量
	if err = global.GVA_DB.Where("id in ?", ids.Ids).Find(&groups).Error; err != nil {
		return err
	}
	
	// 删除群组
	if err = global.GVA_DB.Delete(&[]community.Group{}, "id in ?", ids.Ids).Error; err != nil {
		return err
	}
	
	// 更新各社区的群组数量
	for _, group := range groups {
		err = global.GVA_DB.Model(&community.Community{}).Where("id = ?", group.CommunityId).
			UpdateColumn("group_count", gorm.Expr("group_count - ?", 1)).Error
		if err != nil {
			global.GVA_LOG.Error("更新社区群组数量失败", err)
		}
	}
	
	return nil
}

// UpdateGroup 更新群组
func (communityService *CommunityService) UpdateGroup(group community.Group) (err error) {
	var oldGroup community.Group
	if err = global.GVA_DB.Where("id = ?", group.ID).First(&oldGroup).Error; err != nil {
		return errors.New("群组不存在")
	}
	
	// 如果更新了所属社区
	if oldGroup.CommunityId != 0 && oldGroup.CommunityId != group.CommunityId {
		// 减少原社区的群组数量
		err = global.GVA_DB.Model(&community.Community{}).Where("id = ?", oldGroup.CommunityId).
			UpdateColumn("group_count", gorm.Expr("group_count - ?", 1)).Error
		if err != nil {
			global.GVA_LOG.Error("更新社区群组数量失败", err)
		}
		
		// 增加新社区的群组数量
		err = global.GVA_DB.Model(&community.Community{}).Where("id = ?", group.CommunityId).
			UpdateColumn("group_count", gorm.Expr("group_count + ?", 1)).Error
		if err != nil {
			global.GVA_LOG.Error("更新社区群组数量失败", err)
		}
	}
	
	if err = global.GVA_DB.Save(&group).Error; err != nil {
		return err
	}
	
	return nil
}

// GetGroup 根据id获取群组
func (communityService *CommunityService) GetGroup(id uint) (group community.Group, err error) {
	if err = global.GVA_DB.Where("id = ?", id).First(&group).Error; err != nil {
		return group, errors.New("群组不存在")
	}
	return
}

// GetGroupInfoList 分页获取群组列表
func (communityService *CommunityService) GetGroupInfoList(info community.GroupSearch) (list []community.Group, total int64, err error) {
	limit := info.PageSize
	offset := info.PageSize * (info.Page - 1)
	// 创建db
	db := global.GVA_DB.Model(&community.Group{})
	var groups []community.Group
	
	// 查询条件
	if info.Name != "" {
		db = db.Where("name LIKE ?", "%"+info.Name+"%")
	}
	if info.CommunityId != nil {
		db = db.Where("community_id = ?", *info.CommunityId)
	}
	if info.Status != nil {
		db = db.Where("status = ?", *info.Status)
	}
	if info.Tags != "" {
		db = db.Where("tags LIKE ?", "%"+info.Tags+"%")
	}
	
	// 查询数据
	err = db.Count(&total).Error
	if err != nil {
		return
	}
	err = db.Limit(limit).Offset(offset).Order("id desc").Find(&groups).Error
	
	return groups, total, err
}

// ChangeGroupStatus 修改群组状态
func (communityService *CommunityService) ChangeGroupStatus(id uint, status int) (err error) {
	var group community.Group
	if err = global.GVA_DB.Where("id = ?", id).First(&group).Error; err != nil {
		return errors.New("群组不存在")
	}
	if err = global.GVA_DB.Model(&group).Update("status", status).Error; err != nil {
		return err
	}
	return nil
}
