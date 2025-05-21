package community

import (
	"errors"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/request"
	"github.com/flipped-aurora/gin-vue-admin/server/model/community"
	"gorm.io/gorm"
)

// CreateComment 创建评论
func (communityService *CommunityService) CreateComment(comment community.Comment) (err error) {
	if err = global.GVA_DB.Create(&comment).Error; err != nil {
		return err
	}
	
	// 更新帖子的评论数量
	if comment.PostId != 0 {
		err = global.GVA_DB.Model(&community.Post{}).Where("id = ?", comment.PostId).
			UpdateColumn("comment_count", gorm.Expr("comment_count + ?", 1)).Error
		if err != nil {
			global.GVA_LOG.Error("更新帖子评论数量失败", err)
		}
	}
	
	return nil
}

// DeleteComment 删除评论
func (communityService *CommunityService) DeleteComment(id uint) (err error) {
	var comment community.Comment
	if err = global.GVA_DB.Where("id = ?", id).First(&comment).Error; err != nil {
		return err
	}
	
	// 开启事务
	return global.GVA_DB.Transaction(func(tx *gorm.DB) error {
		// 删除评论
		if err = tx.Delete(&comment).Error; err != nil {
			return err
		}
		
		// 更新帖子的评论数量
		if comment.PostId != 0 {
			if err = tx.Model(&community.Post{}).Where("id = ?", comment.PostId).
				UpdateColumn("comment_count", gorm.Expr("comment_count - ?", 1)).Error; err != nil {
				global.GVA_LOG.Error("更新帖子评论数量失败", err)
				return err
			}
		}
		
		// 删除子评论
		var childComments []community.Comment
		if err = tx.Where("parent_id = ?", id).Find(&childComments).Error; err != nil {
			return err
		}
		
		if len(childComments) > 0 {
			// 删除所有子评论
			if err = tx.Delete(&community.Comment{}, "parent_id = ?", id).Error; err != nil {
				return err
			}
			
			// 更新帖子的评论数量（减去子评论数量）
			if comment.PostId != 0 {
				if err = tx.Model(&community.Post{}).Where("id = ?", comment.PostId).
					UpdateColumn("comment_count", gorm.Expr("comment_count - ?", len(childComments))).Error; err != nil {
					global.GVA_LOG.Error("更新帖子评论数量失败", err)
					return err
				}
			}
		}
		
		return nil
	})
}

// DeleteCommentByIds 批量删除评论
func (communityService *CommunityService) DeleteCommentByIds(ids request.IdsReq) (err error) {
	var comments []community.Comment
	
	// 先查询评论信息，以便更新帖子的评论数量
	if err = global.GVA_DB.Where("id in ?", ids.Ids).Find(&comments).Error; err != nil {
		return err
	}
	
	// 开启事务
	return global.GVA_DB.Transaction(func(tx *gorm.DB) error {
		// 删除评论
		if err = tx.Delete(&[]community.Comment{}, "id in ?", ids.Ids).Error; err != nil {
			return err
		}
		
		// 统计各帖子的评论数量变化
		postCommentCount := make(map[uint]int)
		for _, comment := range comments {
			if comment.PostId != 0 {
				postCommentCount[comment.PostId]++
				
				// 查找并删除子评论
				var childCount int64
				if err = tx.Model(&community.Comment{}).Where("parent_id = ?", comment.ID).Count(&childCount).Error; err != nil {
					return err
				}
				
				if childCount > 0 {
					// 删除所有子评论
					if err = tx.Delete(&community.Comment{}, "parent_id = ?", comment.ID).Error; err != nil {
						return err
					}
					
					// 更新统计
					postCommentCount[comment.PostId] += int(childCount)
				}
			}
		}
		
		// 更新帖子评论数量
		for postID, count := range postCommentCount {
			if err = tx.Model(&community.Post{}).Where("id = ?", postID).
				UpdateColumn("comment_count", gorm.Expr("comment_count - ?", count)).Error; err != nil {
				global.GVA_LOG.Error("更新帖子评论数量失败", err)
				return err
			}
		}
		
		return nil
	})
}

// GetComment 根据id获取评论
func (communityService *CommunityService) GetComment(id uint) (comment community.Comment, err error) {
	if err = global.GVA_DB.Where("id = ?", id).First(&comment).Error; err != nil {
		return comment, errors.New("评论不存在")
	}
	return
}

// GetCommentInfoList 分页获取评论列表
func (communityService *CommunityService) GetCommentInfoList(info community.CommentSearch) (list []community.Comment, total int64, err error) {
	limit := info.PageSize
	offset := info.PageSize * (info.Page - 1)
	// 创建db
	db := global.GVA_DB.Model(&community.Comment{})
	var comments []community.Comment
	
	// 查询条件
	if info.PostId != nil {
		db = db.Where("post_id = ?", *info.PostId)
	}
	if info.AuthorId != nil {
		db = db.Where("author_id = ?", *info.AuthorId)
	}
	if info.Status != nil {
		db = db.Where("status = ?", *info.Status)
	}
	if info.Content != "" {
		db = db.Where("content LIKE ?", "%"+info.Content+"%")
	}
	
	// 查询数据
	err = db.Count(&total).Error
	if err != nil {
		return
	}
	err = db.Limit(limit).Offset(offset).Order("id desc").Find(&comments).Error
	
	return comments, total, err
}

// ChangeCommentStatus 修改评论状态
func (communityService *CommunityService) ChangeCommentStatus(id uint, status int) (err error) {
	var comment community.Comment
	if err = global.GVA_DB.Where("id = ?", id).First(&comment).Error; err != nil {
		return errors.New("评论不存在")
	}
	if err = global.GVA_DB.Model(&comment).Update("status", status).Error; err != nil {
		return err
	}
	return nil
}
