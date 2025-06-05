// 菜单接口的mock数据
export const menuData = {
  code: 0,
  data: {
    menus: [
      {
        ID: 1,
        parentId: 0,
        path: 'dashboard',
        name: 'dashboard',
        component: 'view/dashboard/index.vue',
        meta: {
          title: '仪表盘',
          icon: 'odometer'
        }
      },
      // 核心业务管理
      {
        ID: 2,
        parentId: 0,
        path: 'user',
        name: 'user',
        component: 'view/routerHolder.vue',
        meta: {
          title: '用户管理',
          icon: 'user'
        },
        children: [
          {
            ID: 21,
            parentId: 2,
            path: 'list',
            name: 'userList',
            component: 'view/user/index.vue',
            meta: {
              title: '用户列表',
              icon: 'users'
            }
          },
          {
            ID: 22,
            parentId: 2,
            path: 'roles',
            name: 'userRoles',
            component: 'view/EmptyPage.vue',
            meta: {
              title: '用户角色',
              icon: 'user-tag'
            }
          }
        ]
      },
      {
        ID: 3,
        parentId: 0,
        path: 'content',
        name: 'content',
        component: 'view/routerHolder.vue',
        meta: {
          title: '内容管理',
          icon: 'file-alt'
        },
        children: [
          {
            ID: 31,
            parentId: 3,
            path: 'list',
            name: 'contentList',
            component: 'view/content/article/index.vue',
            meta: {
              title: '内容列表',
              icon: 'newspaper'
            }
          },
          {
            ID: 32,
            parentId: 3,
            path: 'category',
            name: 'categoryContent',
            component: 'view/content/category/index.vue',
            meta: {
              title: '分类管理',
              icon: 'folder-tree'
            }
          },
          {
            ID: 33,
            parentId: 3,
            path: 'tag',
            name: 'tagContent',
            component: 'view/content/tag/index.vue',
            meta: {
              title: '标签管理',
              icon: 'tags'
            }
          },
          {
            ID: 34,
            parentId: 3,
            path: 'comment',
            name: 'commentContent',
            component: 'view/content/comment/index.vue',
            meta: {
              title: '评论管理',
              icon: 'comments'
            }
          }
        ]
      },
      {
        ID: 4,
        parentId: 0,
        path: 'column',
        name: 'column',
        component: 'view/routerHolder.vue',
        meta: {
          title: '栏目管理',
          icon: 'columns'
        },
        children: [
          {
            ID: 41,
            parentId: 4,
            path: 'list',
            name: 'columnList',
            component: 'view/EmptyPage.vue',
            meta: {
              title: '栏目列表',
              icon: 'list'
            }
          },
          {
            ID: 42,
            parentId: 4,
            path: 'category',
            name: 'columnCategory',
            component: 'view/EmptyPage.vue',
            meta: {
              title: '栏目分类',
              icon: 'sitemap'
            }
          }
        ]
      },
      {
        ID: 5,
        parentId: 0,
        path: 'audit',
        name: 'audit',
        component: 'view/routerHolder.vue',
        meta: {
          title: '审核管理',
          icon: 'shield-halved'
        },
        children: [
          {
            ID: 51,
            parentId: 5,
            path: 'article',
            name: 'auditArticle',
            component: 'view/EmptyPage.vue',
            meta: {
              title: '文章审核',
              icon: 'file-lines'
            }
          },
          {
            ID: 52,
            parentId: 5,
            path: 'comment',
            name: 'auditComment',
            component: 'view/EmptyPage.vue',
            meta: {
              title: '评论审核',
              icon: 'comments'
            }
          }
        ]
      },
      {
        ID: 6,
        parentId: 0,
        path: 'community',
        name: 'community',
        component: 'view/routerHolder.vue',
        meta: {
          title: '社区管理',
          icon: 'users-rectangle'
        },
        children: [
          {
            ID: 61,
            parentId: 6,
            path: 'post',
            name: 'communityPost',
            component: 'view/community/post/index.vue',
            meta: {
              title: '帖子管理',
              icon: 'message'
            }
          },
          {
            ID: 62,
            parentId: 6,
            path: 'comment',
            name: 'communityComments',
            component: 'view/community/comment/commentList.vue',
            meta: {
              title: '评论管理',
              icon: 'comments'
            }
          },
          {
            ID: 63,
            parentId: 6,
            path: 'group',
            name: 'communityGroup',
            component: 'view/community/group/index.vue',
            meta: {
              title: '群组管理',
              icon: 'users-between-lines'
            }
          }
        ]
      },
      // 交易与物流
      {
        ID: 7,
        parentId: 0,
        path: 'order',
        name: 'order',
        component: 'view/routerHolder.vue',
        meta: {
          title: '订单管理',
          icon: 'clipboard-list'
        },
        children: [
          {
            ID: 71,
            parentId: 7,
            path: 'list',
            name: 'orderManagement',
            component: 'view/trade/order/orderList.vue',
            meta: {
              title: '订单列表',
              icon: 'list'
            }
          },
          {
            ID: 72,
            parentId: 7,
            path: 'pending',
            name: 'pendingOrders',
            component: 'view/EmptyPage.vue',
            meta: {
              title: '待处理订单',
              icon: 'clock'
            }
          }
        ]
      },
      {
        ID: 8,
        parentId: 0,
        path: 'trade',
        name: 'trade',
        component: 'view/routerHolder.vue',
        meta: {
          title: '交易管理',
          icon: 'shopping-cart'
        },
        children: [
          {
            ID: 81,
            parentId: 8,
            path: 'refund',
            name: 'refundManagement',
            component: 'view/trade/refund/index.vue',
            meta: {
              title: '退款管理',
              icon: 'money-bill-transfer'
            }
          },
          {
            ID: 82,
            parentId: 8,
            path: 'payment',
            name: 'paymentConfig',
            component: 'view/EmptyPage.vue',
            meta: {
              title: '支付配置',
              icon: 'credit-card'
            }
          }
        ]
      },
      {
        ID: 9,
        parentId: 0,
        path: 'logistics',
        name: 'logistics',
        component: 'view/routerHolder.vue',
        meta: {
          title: '物流管理',
          icon: 'truck'
        },
        children: [
          {
            ID: 91,
            parentId: 9,
            path: 'shipping',
            name: 'shipping',
            component: 'view/EmptyPage.vue',
            meta: {
              title: '发货管理',
              icon: 'box'
            }
          },
          {
            ID: 92,
            parentId: 9,
            path: 'tracking',
            name: 'tracking',
            component: 'view/EmptyPage.vue',
            meta: {
              title: '订单跟踪',
              icon: 'location-dot'
            }
          }
        ]
      },
      // 网站功能与配置
      {
        ID: 10,
        parentId: 0,
        path: 'site',
        name: 'site',
        component: 'view/routerHolder.vue',
        meta: {
          title: '网站管理',
          icon: 'globe'
        },
        children: [
          {
            ID: 101,
            parentId: 10,
            path: 'settings',
            name: 'siteSettings',
            component: 'view/site/settings.vue',
            meta: {
              title: '网站设置',
              icon: 'gear'
            }
          },
          {
            ID: 102,
            parentId: 10,
            path: 'banners',
            name: 'siteBanners',
            component: 'view/site/banners.vue',
            meta: {
              title: '轮播图管理',
              icon: 'images'
            }
          }
        ]
      },
      {
        ID: 11,
        parentId: 0,
        path: 'navigation',
        name: 'navigation',
        component: 'view/routerHolder.vue',
        meta: {
          title: '导航管理',
          icon: 'bars'
        },
        children: [
          {
            ID: 111,
            parentId: 11,
            path: 'menu',
            name: 'navigationMenu',
            component: 'view/navigation/menu.vue',
            meta: {
              title: '菜单管理',
              icon: 'list-ul'
            }
          }
        ]
      },
      {
        ID: 12,
        parentId: 0,
        path: 'tenant',
        name: 'tenant',
        component: 'view/routerHolder.vue',
        meta: {
          title: '租户管理',
          icon: 'office-building'
        },
        children: [
          {
            ID: 121,
            parentId: 12,
            path: 'list',
            name: 'tenantList',
            component: 'view/tenant/index.vue',
            meta: {
              title: '租户列表',
              icon: 'list'
            }
          },
          {
            ID: 122,
            parentId: 12,
            path: 'create',
            name: 'createTenant',
            component: 'view/tenant/create.vue',
            meta: {
              title: '创建租户',
              icon: 'plus'
            }
          }
        ]
      },
      // 营销与数据
      {
        ID: 13,
        parentId: 0,
        path: 'recommend',
        name: 'recommend',
        component: 'view/routerHolder.vue',
        meta: {
          title: '推荐系统',
          icon: 'thumbs-up'
        },
        children: [
          {
            ID: 131,
            parentId: 13,
            path: 'rules',
            name: 'recommendRules',
            component: 'view/EmptyPage.vue',
            meta: {
              title: '推荐规则',
              icon: 'rectangle-list'
            }
          }
        ]
      },
      {
        ID: 14,
        parentId: 0,
        path: 'ad',
        name: 'ad',
        component: 'view/routerHolder.vue',
        meta: {
          title: '广告管理',
          icon: 'rectangle-ad'
        },
        children: [
          {
            ID: 141,
            parentId: 14,
            path: 'spaces',
            name: 'adSpaces',
            component: 'view/EmptyPage.vue',
            meta: {
              title: '广告位',
              icon: 'browser'
            }
          }
        ]
      },
      {
        ID: 15,
        parentId: 0,
        path: 'search',
        name: 'search',
        component: 'view/routerHolder.vue',
        meta: {
          title: '搜索管理',
          icon: 'search'
        },
        children: [
          {
            ID: 151,
            parentId: 15,
            path: 'config',
            name: 'searchConfig',
            component: 'view/EmptyPage.vue',
            meta: {
              title: '搜索配置',
              icon: 'gear'
            }
          }
        ]
      },
      {
        ID: 16,
        parentId: 0,
        path: 'points',
        name: 'points',
        component: 'view/routerHolder.vue',
        meta: {
          title: '积分管理',
          icon: 'coins'
        },
        children: [
          {
            ID: 161,
            parentId: 16,
            path: 'rules',
            name: 'pointsRules',
            component: 'view/EmptyPage.vue',
            meta: {
              title: '积分规则',
              icon: 'list-check'
            }
          }
        ]
      },
      {
        ID: 17,
        parentId: 0,
        path: 'favorites',
        name: 'favorites',
        component: 'view/routerHolder.vue',
        meta: {
          title: '收藏管理',
          icon: 'star'
        },
        children: [
          {
            ID: 171,
            parentId: 17,
            path: 'list',
            name: 'favoritesList',
            component: 'view/favorites/index.vue',
            meta: {
              title: '收藏列表',
              icon: 'list'
            }
          },
          {
            ID: 172,
            parentId: 17,
            path: 'statistics',
            name: 'favoritesStatistics',
            component: 'view/favorites/statistics.vue',
            meta: {
              title: '收藏统计',
              icon: 'pie-chart'
            }
          }
        ]
      },
      {
        ID: 18,
        parentId: 0,
        path: 'links',
        name: 'links',
        component: 'view/routerHolder.vue',
        meta: {
          title: '链接管理',
          icon: 'link'
        },
        children: [
          {
            ID: 181,
            parentId: 18,
            path: 'list',
            name: 'linksList',
            component: 'view/EmptyPage.vue',
            meta: {
              title: '链接列表',
              icon: 'list'
            }
          }
        ]
      },
      {
        ID: 19,
        parentId: 0,
        path: 'analytics',
        name: 'analytics',
        component: 'view/routerHolder.vue',
        meta: {
          title: '统计分析',
          icon: 'chart-line'
        },
        children: [
          {
            ID: 191,
            parentId: 19,
            path: 'overview',
            name: 'analyticsOverview',
            component: 'view/EmptyPage.vue',
            meta: {
              title: '数据概览',
              icon: 'chart-pie'
            }
          }
        ]
      },
      // 系统配置
      {
        ID: 20,
        parentId: 0,
        path: 'system',
        name: 'System',
        component: 'view/routerHolder.vue',
        meta: {
          title: '系统管理',
          icon: 'setting'
        },
        children: [
          {
            ID: 201,
            parentId: 20,
            path: 'systemConfig',
            name: 'SystemConfig',
            component: 'view/EmptyPage.vue',
            meta: {
              title: '系统配置',
              icon: 'setting',
              closeTab: false
            }
          },
          {
            ID: 202,
            parentId: 20,
            path: 'jwt',
            name: 'Jwt',
            component: 'view/EmptyPage.vue',
            meta: {
              title: 'JWT管理',
              icon: 'key',
              closeTab: false
            }
          }
        ]
      }
    ]
  },
  msg: '获取菜单成功'
}