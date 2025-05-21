package community

import (
	"errors"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/request"
	"github.com/flipped-aurora/gin-vue-admin/server/model/community"
	"gorm.io/gorm"
)

// CreatePost 创建帖子
func (communityService *CommunityService) CreatePost(post community.Post) (err error) {
	if err = global.GVA_DB.Create(&post).Error; err != nil {
		return err
	}
	
	// 更新社区的帖子数量
	if post.CommunityId != 0 {
		err = global.GVA_DB.Model(&community.Community{}).Where("id = ?", post.CommunityId).
			UpdateColumn("post_count", gorm.Expr("post_count + ?", 1)).Error
		if err != nil {
			global.GVA_LOG.Error("更新社区帖子数量失败", err)
		}
	}
	
	// 更新群组的帖子数量
	if post.GroupId != 0 {
		err = global.GVA_DB.Model(&community.Group{}).Where("id = ?", post.GroupId).
			UpdateColumn("post_count", gorm.Expr("post_count + ?", 1)).Error
		if err != nil {
			global.GVA_LOG.Error("更新群组帖子数量失败", err)
		}
	}
	
	return nil
}

// DeletePost 删除帖子
func (communityService *CommunityService) DeletePost(id uint) (err error) {
	var post community.Post
	if err = global.GVA_DB.Where("id = ?", id).First(&post).Error; err != nil {
		return err
	}
	
	if err = global.GVA_DB.Delete(&post).Error; err != nil {
		return err
	}
	
	// 更新社区的帖子数量
	if post.CommunityId != 0 {
		err = global.GVA_DB.Model(&community.Community{}).Where("id = ?", post.CommunityId).
			UpdateColumn("post_count", gorm.Expr("post_count - ?", 1)).Error
		if err != nil {
			global.GVA_LOG.Error("更新社区帖子数量失败", err)
		}
	}
	
	// 更新群组的帖子数量
	if post.GroupId != 0 {
		err = global.GVA_DB.Model(&community.Group{}).Where("id = ?", post.GroupId).
			UpdateColumn("post_count", gorm.Expr("post_count - ?", 1)).Error
		if err != nil {
			global.GVA_LOG.Error("更新群组帖子数量失败", err)
		}
	}
	
	return nil
}

// DeletePostByIds 批量删除帖子
func (communityService *CommunityService) DeletePostByIds(ids request.IdsReq) (err error) {
	var posts []community.Post
	
	// 先查询帖子信息，以便更新社区和群组的帖子数量
	if err = global.GVA_DB.Where("id in ?", ids.Ids).Find(&posts).Error; err != nil {
		return err
	}
	
	// 删除帖子
	if err = global.GVA_DB.Delete(&[]community.Post{}, "id in ?", ids.Ids).Error; err != nil {
		return err
	}
	
	// 更新统计数量
	communityPostCount := make(map[uint]int)
	groupPostCount := make(map[uint]int)
	
	// 统计各社区、群组的帖子数量变化
	for _, post := range posts {
		if post.CommunityId != 0 {
			communityPostCount[post.CommunityId]++
		}
		if post.GroupId != 0 {
			groupPostCount[post.GroupId]++
		}
	}
	
	// 更新社区帖子数量
	for communityID, count := range communityPostCount {
		err = global.GVA_DB.Model(&community.Community{}).Where("id = ?", communityID).
			UpdateColumn("post_count", gorm.Expr("post_count - ?", count)).Error
		if err != nil {
			global.GVA_LOG.Error("更新社区帖子数量失败", err)
		}
	}
	
	// 更新群组帖子数量
	for groupID, count := range groupPostCount {
		err = global.GVA_DB.Model(&community.Group{}).Where("id = ?", groupID).
			UpdateColumn("post_count", gorm.Expr("post_count - ?", count)).Error
		if err != nil {
			global.GVA_LOG.Error("更新群组帖子数量失败", err)
		}
	}
	
	return nil
}

// UpdatePost 更新帖子
func (communityService *CommunityService) UpdatePost(post community.Post) (err error) {
	var oldPost community.Post
	if err = global.GVA_DB.Where("id = ?", post.ID).First(&oldPost).Error; err != nil {
		return errors.New("帖子不存在")
	}
	
	// 如果更改了社区
	if oldPost.CommunityId != post.CommunityId && oldPost.CommunityId != 0 && post.CommunityId != 0 {
		// 减少原社区的帖子数量
		err = global.GVA_DB.Model(&community.Community{}).Where("id = ?", oldPost.CommunityId).
			UpdateColumn("post_count", gorm.Expr("post_count - ?", 1)).Error
		if err != nil {
			global.GVA_LOG.Error("更新社区帖子数量失败", err)
		}
		
		// 增加新社区的帖子数量
		err = global.GVA_DB.Model(&community.Community{}).Where("id = ?", post.CommunityId).
			UpdateColumn("post_count", gorm.Expr("post_count + ?", 1)).Error
		if err != nil {
			global.GVA_LOG.Error("更新社区帖子数量失败", err)
		}
	}
	
	// 如果更改了群组
	if oldPost.GroupId != post.GroupId && oldPost.GroupId != 0 && post.GroupId != 0 {
		// 减少原群组的帖子数量
		err = global.GVA_DB.Model(&community.Group{}).Where("id = ?", oldPost.GroupId).
			UpdateColumn("post_count", gorm.Expr("post_count - ?", 1)).Error
		if err != nil {
			global.GVA_LOG.Error("更新群组帖子数量失败", err)
		}
		
		// 增加新群组的帖子数量
		err = global.GVA_DB.Model(&community.Group{}).Where("id = ?", post.GroupId).
			UpdateColumn("post_count", gorm.Expr("post_count + ?", 1)).Error
		if err != nil {
			global.GVA_LOG.Error("更新群组帖子数量失败", err)
		}
	}
	
	if err = global.GVA_DB.Save(&post).Error; err != nil {
		return err
	}
	
	return nil
}

// GetPost 根据id获取帖子
func (communityService *CommunityService) GetPost(id uint) (post community.Post, err error) {
	if err = global.GVA_DB.Where("id = ?", id).First(&post).Error; err != nil {
		return post, errors.New("帖子不存在")
	}
	return
}

// GetPostInfoList 分页获取帖子列表
func (communityService *CommunityService) GetPostInfoList(info community.PostSearch) (list []community.Post, total int64, err error) {
	limit := info.PageSize
	offset := info.PageSize * (info.Page - 1)
	// 创建db
	db := global.GVA_DB.Model(&community.Post{})
	var posts []community.Post
	
	// 查询条件
	if info.Title != "" {
		db = db.Where("title LIKE ?", "%"+info.Title+"%")
	}
	if info.CommunityId != nil {
		db = db.Where("community_id = ?", *info.CommunityId)
	}
	if info.GroupId != nil {
		db = db.Where("group_id = ?", *info.GroupId)
	}
	if info.Status != nil {
		db = db.Where("status = ?", *info.Status)
	}
	if info.AuthorId != nil {
		db = db.Where("author_id = ?", *info.AuthorId)
	}
	if info.Tags != "" {
		db = db.Where("tags LIKE ?", "%"+info.Tags+"%")
	}
	
	// 查询数据
	err = db.Count(&total).Error
	if err != nil {
		return
	}
	err = db.Limit(limit).Offset(offset).Order("id desc").Find(&posts).Error
	
	return posts, total, err
}

// ChangePostStatus 修改帖子状态
func (communityService *CommunityService) ChangePostStatus(id uint, status int) (err error) {
	var post community.Post
	if err = global.GVA_DB.Where("id = ?", id).First(&post).Error; err != nil {
		return errors.New("帖子不存在")
	}
	if err = global.GVA_DB.Model(&post).Update("status", status).Error; err != nil {
		return err
	}
	return nil
}
