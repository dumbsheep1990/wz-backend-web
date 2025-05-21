package community

import (
	"errors"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/request"
	"github.com/flipped-aurora/gin-vue-admin/server/model/community"
	"gorm.io/gorm"
)

type CommunityService struct{}

// CreateCommunity 创建社区
func (communityService *CommunityService) CreateCommunity(community community.Community) (err error) {
	if err = global.GVA_DB.Create(&community).Error; err != nil {
		return err
	}
	return nil
}

// DeleteCommunity 删除社区
func (communityService *CommunityService) DeleteCommunity(id uint) (err error) {
	var community community.Community
	if err = global.GVA_DB.Where("id = ?", id).First(&community).Error; err != nil {
		return err
	}
	if err = global.GVA_DB.Delete(&community).Error; err != nil {
		return err
	}
	return nil
}

// DeleteCommunityByIds 批量删除社区
func (communityService *CommunityService) DeleteCommunityByIds(ids request.IdsReq) (err error) {
	if err = global.GVA_DB.Delete(&[]community.Community{}, "id in ?", ids.Ids).Error; err != nil {
		return err
	}
	return nil
}

// UpdateCommunity 更新社区
func (communityService *CommunityService) UpdateCommunity(community community.Community) (err error) {
	var oldCommunity community.Community
	if err = global.GVA_DB.Where("id = ?", community.ID).First(&oldCommunity).Error; err != nil {
		return errors.New("社区不存在")
	}
	if err = global.GVA_DB.Save(&community).Error; err != nil {
		return err
	}
	return nil
}

// GetCommunity 根据id获取社区
func (communityService *CommunityService) GetCommunity(id uint) (community community.Community, err error) {
	if err = global.GVA_DB.Where("id = ?", id).First(&community).Error; err != nil {
		return community, errors.New("社区不存在")
	}
	return
}

// GetCommunityInfoList 分页获取社区列表
func (communityService *CommunityService) GetCommunityInfoList(info community.CommunitySearch) (list []community.Community, total int64, err error) {
	limit := info.PageSize
	offset := info.PageSize * (info.Page - 1)
	// 创建db
	db := global.GVA_DB.Model(&community.Community{})
	var communities []community.Community
	
	// 查询条件
	if info.Name != "" {
		db = db.Where("name LIKE ?", "%"+info.Name+"%")
	}
	if info.Status != nil {
		db = db.Where("status = ?", *info.Status)
	}
	if info.Location != "" {
		db = db.Where("location LIKE ?", "%"+info.Location+"%")
	}
	if info.Tags != "" {
		db = db.Where("tags LIKE ?", "%"+info.Tags+"%")
	}
	
	// 查询数据
	err = db.Count(&total).Error
	if err != nil {
		return
	}
	err = db.Limit(limit).Offset(offset).Order("id desc").Find(&communities).Error
	
	return communities, total, err
}

// ChangeCommunityStatus 修改社区状态
func (communityService *CommunityService) ChangeCommunityStatus(id uint, status int) (err error) {
	var community community.Community
	if err = global.GVA_DB.Where("id = ?", id).First(&community).Error; err != nil {
		return errors.New("社区不存在")
	}
	if err = global.GVA_DB.Model(&community).Update("status", status).Error; err != nil {
		return err
	}
	return nil
}
