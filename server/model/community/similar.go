package community

import (
	"github.com/wz-project/wz-backend-web/server/global"
	"time"
)

// SimilarCategoryType 同X分类类型
type SimilarCategoryType string

// 同X分类常量
const (
	SimilarCategoryTongYong  SimilarCategoryType = "同用" // 同用
	SimilarCategoryTongHao   SimilarCategoryType = "同好" // 同好
	SimilarCategoryTongGou   SimilarCategoryType = "同购" // 同购
	SimilarCategoryTongNian  SimilarCategoryType = "同年" // 同年
	SimilarCategoryTongYou   SimilarCategoryType = "同游" // 同游
	SimilarCategoryTongZai   SimilarCategoryType = "同在" // 同在
	SimilarCategoryTongShi   SimilarCategoryType = "同市" // 同市
	SimilarCategoryTongQi    SimilarCategoryType = "同企" // 同企
	SimilarCategoryTongQin   SimilarCategoryType = "同亲" // 同亲
	SimilarCategoryTongBan   SimilarCategoryType = "同班" // 同班
	SimilarCategoryTongShi2  SimilarCategoryType = "同师" // 同师
	SimilarCategoryTongYe    SimilarCategoryType = "同业" // 同业
	SimilarCategoryTongWang  SimilarCategoryType = "同网" // 同网
	SimilarCategoryTongGong  SimilarCategoryType = "同工" // 同工
	SimilarCategoryTongWu    SimilarCategoryType = "同务" // 同务
	SimilarCategoryTongYi    SimilarCategoryType = "同艺" // 同艺
	SimilarCategoryTongWan   SimilarCategoryType = "同玩" // 同玩
	SimilarCategoryTongXian  SimilarCategoryType = "同闲" // 同闲
	SimilarCategoryTongPai   SimilarCategoryType = "同拍" // 同拍
	SimilarCategoryTongXiang SimilarCategoryType = "同乡" // 同乡
	SimilarCategoryTongXue   SimilarCategoryType = "同学" // 同学
)

// SimilarCategory 同X分类
type SimilarCategory struct {
	Code string `json:"code" gorm:"column:code;comment:分类代码"`
	Name string `json:"name" gorm:"column:name;comment:分类名称"`
}

// SimilarApplication 入同申请模型
type SimilarApplication struct {
	global.GVA_MODEL
	UserID          string    `json:"userId" gorm:"column:user_id;comment:用户ID"`
	ApplicationType string    `json:"applicationType" gorm:"column:application_type;comment:申请类型(同用/同好/同购等)"`
	Name            string    `json:"name" gorm:"column:name;comment:姓名"`
	Gender          string    `json:"gender" gorm:"column:gender;comment:性别"`
	Birthplace      string    `json:"birthplace" gorm:"column:birthplace;comment:出生地点"`
	Occupation      string    `json:"occupation" gorm:"column:occupation;comment:职业"`
	Education       string    `json:"education" gorm:"column:education;comment:学历"`
	WorkPosition    string    `json:"workPosition" gorm:"column:work_position;comment:工作岗位"`
	WorkPlace       string    `json:"workPlace" gorm:"column:work_place;comment:工作地点"`
	Hobby           string    `json:"hobby" gorm:"column:hobby;comment:爱好"`
	Address         string    `json:"address" gorm:"column:address;comment:地址"`
	ContactType     string    `json:"contactType" gorm:"column:contact_type;comment:联系方式类型"`
	ContactValue    string    `json:"contactValue" gorm:"column:contact_value;comment:联系方式值"`
	Description     string    `json:"description" gorm:"column:description;type:text;comment:个人简介"`
	Status          string    `json:"status" gorm:"column:status;default:pending;comment:状态(pending/approved/rejected)"`
	ApprovedAt      time.Time `json:"approvedAt" gorm:"column:approved_at;comment:审批时间"`
	ApprovedBy      string    `json:"approvedBy" gorm:"column:approved_by;comment:审批人"`
	CircleID        string    `json:"circleId" gorm:"column:circle_id;comment:关联的圈子ID"`
	User            User      `json:"user" gorm:"foreignKey:UserID;references:ID"`
}

// SimilarCircle 相同圈子模型
type SimilarCircle struct {
	global.GVA_MODEL
	CircleType   string `json:"circleType" gorm:"column:circle_type;comment:圈子类型(同用/同好/同购等)"`
	Name         string `json:"name" gorm:"column:name;comment:圈子名称"`
	Description  string `json:"description" gorm:"column:description;type:text;comment:圈子描述"`
	Avatar       string `json:"avatar" gorm:"column:avatar;comment:圈子头像"`
	Banner       string `json:"banner" gorm:"column:banner;comment:圈子横幅"`
	MemberCount  int    `json:"memberCount" gorm:"column:member_count;default:0;comment:成员数量"`
	Location     string `json:"location" gorm:"column:location;comment:地点"`
	ContactInfo  string `json:"contactInfo" gorm:"column:contact_info;comment:联系信息"`
	Status       string `json:"status" gorm:"column:status;default:active;comment:状态(active/inactive)"`
	CreatorID    string `json:"creatorId" gorm:"column:creator_id;comment:创建人ID"`
	Creator      User   `json:"creator" gorm:"foreignKey:CreatorID;references:ID"`
}

// SimilarCircleMember 相同圈子成员模型
type SimilarCircleMember struct {
	global.GVA_MODEL
	CircleID        string    `json:"circleId" gorm:"column:circle_id;comment:圈子ID;index:idx_circle_user,priority:1"`
	UserID          string    `json:"userId" gorm:"column:user_id;comment:用户ID;index:idx_circle_user,priority:2"`
	Role            string    `json:"role" gorm:"column:role;default:member;comment:角色(admin/member)"`
	JoinedAt        time.Time `json:"joinedAt" gorm:"column:joined_at;comment:加入时间"`
	ApplicationID   string    `json:"applicationId" gorm:"column:application_id;comment:关联的申请ID"`
	Status          string    `json:"status" gorm:"column:status;default:active;comment:状态(active/inactive)"`
	LastActiveAt    time.Time `json:"lastActiveAt" gorm:"column:last_active_at;comment:最后活跃时间"`
	Circle          SimilarCircle        `json:"circle" gorm:"foreignKey:CircleID;references:ID"`
	User            User                 `json:"user" gorm:"foreignKey:UserID;references:ID"`
	Application     SimilarApplication   `json:"application" gorm:"foreignKey:ApplicationID;references:ID"`
}

// TableName 获取表名
func (SimilarApplication) TableName() string {
	return "similar_applications"
}

// TableName 获取表名
func (SimilarCircle) TableName() string {
	return "similar_circles"
}

// TableName 获取表名
func (SimilarCircleMember) TableName() string {
	return "similar_circle_members"
}

// User 简化的用户模型（用于关联查询）
type User struct {
	ID        uint      `gorm:"primarykey" json:"ID"`
	CreatedAt time.Time `json:"CreatedAt" gorm:"comment:创建时间"`
	UpdatedAt time.Time `json:"UpdatedAt" gorm:"comment:更新时间"`
	Username  string    `json:"userName" gorm:"comment:用户登录名"`
	NickName  string    `json:"nickName" gorm:"default:系统用户;comment:用户昵称"`
	Avatar    string    `json:"headerImg" gorm:"default:https://qmplusimg.henrongyi.top/gva_header.jpg;comment:用户头像"`
	Phone     string    `json:"phone"  gorm:"comment:用户手机号"`
	Email     string    `json:"email"  gorm:"comment:用户邮箱"`
}
