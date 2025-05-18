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
      {
        ID: 2,
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
            ID: 21,
            parentId: 2,
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
            ID: 22,
            parentId: 2,
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
            path: 'article',
            name: 'articleContent',
            component: 'view/EmptyPage.vue',
            meta: {
              title: '文章管理',
              icon: 'newspaper'
            }
          },
          {
            ID: 32,
            parentId: 3,
            path: 'category',
            name: 'categoryContent',
            component: 'view/EmptyPage.vue',
            meta: {
              title: '分类管理',
              icon: 'folder-tree'
            }
          }
        ]
      },
      {
        ID: 4,
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
            ID: 41,
            parentId: 4,
            path: 'admin',
            name: 'admin',
            component: 'view/EmptyPage.vue',
            meta: {
              title: '用户管理',
              icon: 'coordinate'
            }
          }
        ]
      },
      {
        ID: 5,
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
            ID: 51,
            parentId: 5,
            path: 'list',
            name: 'favoritesList',
            component: 'view/favorites/index.vue',
            meta: {
              title: '收藏列表',
              icon: 'list'
            }
          },
          {
            ID: 52,
            parentId: 5,
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
        ID: 6,
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
            ID: 61,
            parentId: 6,
            path: 'list',
            name: 'tenantList',
            component: 'view/tenant/index.vue',
            meta: {
              title: '租户列表',
              icon: 'list'
            }
          },
          {
            ID: 62,
            parentId: 6,
            path: 'create',
            name: 'createTenant',
            component: 'view/tenant/create.vue',
            meta: {
              title: '创建租户',
              icon: 'plus'
            }
          }
        ]
      }
    ]
  },
  msg: '获取菜单成功'
}