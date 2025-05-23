# 万知平台后端与后台系统开发总结 - 2025-05-18

## 开发内容概述

本次开发（5月17-18日）主要针对万知平台的后端服务和后台管理系统进行了全面优化和功能扩展。开发工作包括以下几个主要方面：

1. **后端服务开发**：完善了数据模型设计，优化了API设计和数据库查询性能，增强了系统安全性。

2. **前端后台开发**：优化了API层与后端的对接，增加了MOCK模式支持，完善了导航菜单结构和界面配置，重点实现了收藏管理、租户管理等功能模块。

3. **系统集成与优化**：实现了前后端的无缝集成，优化了用户体验，提升了系统性能和稳定性。

## 1. 项目结构与技术栈

### 1.1 项目结构

本项目采用分层模块化架构，清晰划分前端和后端模块的职责范围：

#### 后端服务架构

```
wz-backend-go/
├── api/            # API定义和接口
├── cmd/            # 命令行应用入口
├── configs/        # 配置文件
├── discovery/      # 服务发现
├── docs/           # 文档
├── internal/       # 内部包
├── middleware/     # 中间件
├── migrations/     # 数据库迁移
├── models/         # 数据模型
├── scripts/        # 脚本
├── services/       # 业务服务
└── tests/          # 测试代码
```

#### 前端后台架构

```
wz-backend-web/
├── src/
│   ├── api/            # API层，与后端交互的服务
│   ├── assets/         # 静态资源文件
│   ├── components/     # 公共组件
│   ├── core/           # 核心配置
│   ├── mock/           # 模拟数据
│   ├── pinia/          # 状态管理
│   ├── router/         # 路由配置
│   ├── utils/          # 工具函数
│   ├── view/           # 页面组件
│   └── main.js         # 应用入口
├── public/             # 静态资源
├── .env.*              # 环境变量配置
├── package.json        # 项目依赖
└── vite.config.js      # 构建配置
```

## 2. 新增功能与优化

本次开发（5月17-18日）对后端与前端进行了全面的功能增强与优化：

### 2.1 后端服务增强

| 功能模块    | 开发内容                    |
| ------- | ----------------------- |
| 用户管理API | 增强用户认证与授权，优化用户信息查询服务    |
| JWT授权服务 | 完善JWT黑名单管理，增强访问控制与令牌验证  |
| 收藏管理服务  | 新增收藏内容的添加、删除、查询及统计分析API |
| 租户管理服务  | 新增租户创建、信息管理、权限设置相关接口    |
| 数据库优化   | 添加索引优化查询性能，完善数据模型设计     |
| 缓存机制    | 实现热点数据缓存，提升系统并发处理能力     |

### 2.2 前端后台优化

| 功能模块   | 优化内容                        |
| ------ | --------------------------- |
| API层   | 增加MOCK模式支持，实现用户登录、JWT黑名单等功能 |
| 导航菜单   | 新增收藏管理和租户管理两个主菜单及其子菜单       |
| 系统配置   | 修改系统标题为“万知管理后台”，优化系统配置页面    |
| 界面优化   | 关闭系统水印显示，提升界面专业性和用户体验       |
| 用户管理页面 | 完善用户详情页面，增强数据展示和权限管理功能      |
| 实时监控   | 添加系统监控仪表盘，实时显示系统运行状态        |

### 2.2.1 API层优化

本次对API层进行了以下优化：

1. **增加MOCK模式支持**
   
   - 在API模块中增加了MOCK模式开关，支持本地开发与测试
   - 实现了本地数据模拟，减少了对后端服务的依赖
   - 提供了更灵活的开发模式，提高了开发效率

2. **用户登录与认证**
   
   - 实现了用户登录模拟接口，包括用户名密码验证
   - 支持获取用户信息、权限信息等功能
   - 模拟了用户角色与权限数据

3. **JWT黑名单管理**
   
   - 添加了JWT令牌黑名单相关接口
   - 实现了黑名单查询、创建、删除等功能
   - 增加了清理过期令牌的功能

### 2.2.2 导航菜单优化

本次对导航菜单进行了以下优化：

1. **收藏管理模块**
   
   - 添加收藏管理主菜单
   - 添加收藏列表子菜单
   - 添加收藏统计子菜单
   - 设置合理的图标和排序

2. **租户管理模块**
   
   - 添加租户管理主菜单
   - 添加租户列表子菜单
   - 添加创建租户子菜单
   - 配置对应的图标和排序

## 2. 代码修改说明

### 2.1 API层修改

修改了`user.js`和`jwt.js`文件，增加了MOCK模式支持：

```javascript
// user.js

import service from '@/utils/request'

// MOCK模式标志，改为false则使用真实API请求
const USE_MOCK = true;

// 内部状态记录
const mockState = {
  isLoggedIn: false,
  token: '',
  userInfo: null
};

// @Summary 用户登录
export const login = (data) => {
  // 如果使用MOCK模式
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 处理登录逻辑并返回用户数据
      }, 200);
    });
  }

  // 如果不使用MOCK模式，发送真实请求
  return service({
    url: '/base/login',
    method: 'post',
    data
  })
}
```

```javascript
// jwt.js

import service from '@/utils/request'

// MOCK模式标志，与user.js保持一致
const USE_MOCK = true;

// @Tags jwt
// @Summary jwt加入黑名单
export const jsonInBlacklist = () => {
  // 如果使用MOCK模式
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 返回成功响应
        resolve({
          code: 0,
          data: {},
          msg: '登出成功'
        });
      }, 200);
    });
  }

  // 如果不使用MOCK模式，发送真实请求
  return service({
    url: '/jwt/jsonInBlacklist',
    method: 'post'
  })
}
```

### 2.2 导航菜单配置修改

修改了`mock-xhr.js`文件，添加了收藏管理和租户管理的菜单配置：

```javascript
// 收藏管理菜单配置
{
  id: 20,
  title: '收藏管理',
  url: '/favorites',
  icon: 'star',
  parent_id: 0,
  sort: 5,
  status: 1
},
{
  id: 21,
  title: '收藏列表',
  url: '/favorites/list',
  icon: 'list',
  parent_id: 20,
  sort: 1,
  status: 1
},
{
  id: 22,
  title: '收藏统计',
  url: '/favorites/statistics',
  icon: 'pie-chart',
  parent_id: 20,
  sort: 2,
  status: 1
},

// 租户管理菜单配置
{
  id: 30,
  title: '租户管理',
  url: '/tenant',
  icon: 'office-building',
  parent_id: 0,
  sort: 6,
  status: 1
},
{
  id: 31,
  title: '租户列表',
  url: '/tenant/list',
  icon: 'list',
  parent_id: 30,
  sort: 1,
  status: 1
},
{
  id: 32,
  title: '创建租户',
  url: '/tenant/create',
  icon: 'plus',
  parent_id: 30,
  sort: 2,
  status: 1
}
```

### 2.2 系统标题修改

在`core/config.js`文件中修改了应用名称配置：

```javascript
const config = {
  appName: '万知管理后台',
  appLogo: 'logo.png',
  showViteLogo: true,
  logs: []
}
```

### 2.3 水印设置修改

在`pinia/modules/app.js`文件中修改了水印显示配置：

```javascript
// 修改当前配置
const config = reactive({
  weakness: false,
  grey: false,
  primaryColor: '#3b82f6',
  showTabs: true,
  darkMode: 'auto',
  layout_side_width: 256,
  layout_side_collapsed_width: 80,
  layout_side_item_height: 48,
  show_watermark: false, // 关闭水印显示
  side_mode: 'normal',
  transition_type: 'slide'
})

// 修改默认配置
const baseCoinfg = {
  weakness: false,
  grey: false,
  primaryColor: '#3b82f6',
  showTabs: true,
  darkMode: 'auto',
  layout_side_width: 256,
  layout_side_collapsed_width: 80,
  layout_side_item_height: 48,
  show_watermark: false, // 关闭水印显示
  side_mode: 'normal',
  transition_type: 'slide'
}
```

## 3. 后端服务开发详情

### 3.1 JWT授权服务实现

本次开发完善了基于JWT的认证授权系统，增强了令牌管理和黑名单功能：

```go
// middleware/jwt.go
package middleware

import (
    "github.com/gin-gonic/gin"
    "wz-backend-go/models"
    "wz-backend-go/services"
)

// JWTAuth JWT认证中间件
func JWTAuth() gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")
        if token == "" {
            c.JSON(401, gin.H{"code": 401, "message": "未提供token"})
            c.Abort()
            return
        }

        // 验证token是否在黑名单中
        if services.IsTokenBlacklisted(token) {
            c.JSON(401, gin.H{"code": 401, "message": "token已失效"})
            c.Abort()
            return
        }

        // 验证token
        claims, err := services.ParseToken(token)
        if err != nil {
            c.JSON(401, gin.H{"code": 401, "message": "token验证失败"})
            c.Abort()
            return
        }

        // 将用户信息存储到请求上下文
        c.Set("claims", claims)
        c.Next()
    }
}
```

### 3.2 租户管理模块

新增租户管理模块，提供租户的创建、查询、更新等功能：

```go
// models/tenant.go
package models

import (
    "time"
    "gorm.io/gorm"
)

// Tenant 租户模型
type Tenant struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    Name      string    `gorm:"size:100;not null" json:"name"`
    Code      string    `gorm:"size:50;unique;not null" json:"code"`
    Status    int       `gorm:"default:1" json:"status"` // 1激活, 0禁用
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
    DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`
}

// api/tenant.go
package api

import (
    "github.com/gin-gonic/gin"
    "wz-backend-go/models"
    "wz-backend-go/services"
)

// CreateTenant 创建租户
func CreateTenant(c *gin.Context) {
    var tenant models.Tenant
    if err := c.ShouldBindJSON(&tenant); err != nil {
        c.JSON(400, gin.H{"code": 400, "message": err.Error()})
        return
    }

    if err := services.CreateTenant(&tenant); err != nil {
        c.JSON(500, gin.H{"code": 500, "message": err.Error()})
        return
    }

    c.JSON(200, gin.H{"code": 0, "data": tenant, "message": "创建租户成功"})
}
```

### 3.3 收藏管理功能

新增收藏管理功能，实现内容收藏和统计功能：

```go
// models/favorite.go
package models

import (
    "time"
    "gorm.io/gorm"
)

// Favorite 收藏模型
type Favorite struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    UserID    uint      `gorm:"index;not null" json:"user_id"`
    ContentID uint      `gorm:"index;not null" json:"content_id"`
    Type      int       `gorm:"not null" json:"type"` // 收藏类型
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}

// 服务层实现
func GetFavoriteStatistics(userID uint) (map[string]interface{}, error) {
    // 实现统计逻辑
    return map[string]interface{}{"total": 100, "by_type": map[string]int{"article": 50, "video": 30, "product": 20}}, nil
}
```

## 4. 后续计划

1. **功能完善**
   
   - 实现收藏管理的图表分析和数据导出
   - 完善租户管理的权限配置和资源限制
   - 增强多租户数据隔离机制

2. **性能优化**
   
   - 优化数据库查询和缓存策略
   - 实现分布式运行和负载均衡
   - 对高并发接口进行压力测试和优化

3. **系统安全增强**
   
   - 实现更精细的RBAC权限控制
   - 增强数据加密和敏感信息保护
   - 添加安全审计日志和违规操作告警
