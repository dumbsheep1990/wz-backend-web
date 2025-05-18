// 模拟接口响应数据
import { menuData } from './menu'
import { authData } from './auth'

// 启用debug模式，记录所有请求到控制台
const DEBUG = true;

// 创建一个全局导出对象，作为应用的状态管理
export const mockState = {
  isLoggedIn: false,
  loginAttempts: 0,
  token: '',
  userInfo: null
};

const mockData = {
  // 登录接口
  '/base/login': (config) => {
    const { username, password } = JSON.parse(config.data)
    // 简单的用户名密码验证 - 所有账户都能登录成功
    mockState.loginAttempts++;
    
    // 创建用户信息
    const userInfo = {
      ID: 1,
      uuid: `user-${username}-uuid`,
      userName: username,
      nickName: username === 'admin' ? '超级管理员' : '普通用户',
      headerImg: 'https://qmplusimg.henrongyi.top/gva_header.jpg',
      sideMode: 'dark',
      activeColor: '#1890ff',
      baseColor: '#fff',
      authority: {
        defaultRouter: 'dashboard'
      },
      authorityId: username === 'admin' ? '888' : '9528',
      authorities: [{ 
        authorityId: username === 'admin' ? '888' : '9528', 
        authorityName: username === 'admin' ? '超级管理员' : '普通用户' 
      }]
    };
    
    // 生成token
    const token = `mock-token-${username}-${Date.now()}`;
    
    // 更新状态
    mockState.isLoggedIn = true;
    mockState.token = token;
    mockState.userInfo = userInfo;
    
    // 返回登录成功的响应
    return {
      code: 0,
      data: {
        user: userInfo,
        token: token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).getTime() // 24小时后过期
      },
      msg: '登录成功'
    }
  },

  // 验证码接口
  '/base/captcha': () => {
    return {
      code: 0,
      data: {
        captchaId: 'mock-captcha-id',
        picPath: 'data:image/png;base64,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'
      },
      msg: '验证码获取成功'
    }
  },

  // 获取用户信息
  '/user/getUserInfo': () => {
    // 如果没有登录，返回默认的admin用户
    const userInfo = mockState.userInfo || {
      ID: 1,
      uuid: 'admin-uuid',
      userName: 'admin',
      nickName: '超级管理员',
      headerImg: 'https://qmplusimg.henrongyi.top/gva_header.jpg',
      sideMode: 'dark',
      activeColor: '#1890ff',
      baseColor: '#fff',
      authority: {
        defaultRouter: 'dashboard'
      },
      authorityId: '888',
      authorities: [{ authorityId: '888', authorityName: '超级管理员' }]
    };
    
    return {
      code: 0,
      data: {
        userInfo: userInfo
      },
      msg: '获取用户信息成功'
    }
  },

  // 获取菜单列表
  '/menu/getMenu': () => {
    // 直接动态导入最新的菜单数据，避免缓存
    // 注意：在现代浏览器中，这种方式不完全可靠，但在开发时可以解决部分缓存问题
    try {
      // 尝试使用控制台标记菜单重新加载
      console.log('[Mock] 菜单数据被请求，重新返回最新数据！');

      // 返回菜单数据，使用封装的方式确保是最新的
      return {
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
      };
    } catch (error) {
      console.error('[Mock] 加载菜单数据出错:', error);
      return menuData; // 出错时返回原始数据
    }
  },

  // 获取权限列表
  '/authority/getAuthorityList': () => {
    return {
      code: 0,
      data: authData.authority,
      msg: '获取成功'
    }
  },

  // 获取策略列表
  '/casbin/getPolicyPathByAuthorityId': (config) => {
    const { authorityId } = JSON.parse(config.data)
    return {
      code: 0,
      data: authData.casbin.policyPathMaps.filter(item => 
        item.authoritys.includes(authorityId)
      ),
      msg: '获取成功'
    }
  },
  
  // JWT黑名单接口
  '/jwt/jsonInBlacklist': () => {
    // 清除登录状态
    mockState.isLoggedIn = false;
    mockState.token = '';
    mockState.userInfo = null;
    
    return {
      code: 0,
      data: {},
      msg: '登出成功'
    }
  },
  
  // 验证码获取
  '/base/captcha': () => {
    return {
      code: 0,
      data: {
        captchaId: `mock-captcha-${Date.now()}`,
        picPath: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAoCAMAAAA/pR6tAAAAh1BMVEX///8AAAD8/Pz5+fn29vbz8/Pw8PDt7e3q6urm5ubj4+Pf39/c3NzY2NjV1dXR0dHNzc3Jycm/v7+7u7u3t7ezs7Ovr6+rq6unp6eioqKenp6ampqWlpaSkpKOjo6KiYmGhoaCgoJ+fn56enp2dnZycnJubm5qamplZWVhYWFdXV1ZWVlUVFRFdOZ7AAAD2UlEQVRIx5WWi3aiMABFX4EkEAMIAcQXD6u1/f8PnIRHnDh2HHtndbHMhnOTm0dw3esPmAIxhOvxxj4KvmzTY34YK/ihzZPhjWbIizM9aBFnAshRSY0CIVqZUQ5nTQqR+nRPlEh9CJHu9FahvcvYRRZ0T5dYnAWPcp8uogAewEn3Ugxo5HRPKXFaZDJ4hCBLG68T0IhpItJzSXyyaUwPwGjkdE8ZT+Aok0kcgVHSRMZNdKAIaEybDoCwGgcEa0lTWQnuG3mUSDoFwKU7GkWiZFJWg9A9jDLkCT2gCZOxwsyiSLqKV3AEjP1JbzCWNFGhMc5SkjGlbxhLmkrnULg0HrkYUw0j8uPkgWMI9XocoWMIezpWN84R7ehcQkPndRxj6SfgGeIhXUlCrz4vOOY7OheOhpE4Ghwlj5kUDxinPZ0LDSOh7ypcZnSuzYNLMaJz8WEscJTl11a0/2BcLnQNrcdoO9DsaRzqChxlwYdWgdGgzqNGqZ7yxKOJGAKMxZHGlWHEv5+LxIiH4MitYRQ/1sWHYVwT3tcFPyPRMMoPw1JfuBgpXQ/0Qv0YiBaNi9A44l8YlhYc8YY+IR3GWOD4jfGCx/w7hsMHBBUfjMucviPthYHrUn3HcDhuQn5jVE2M1Cq9Y6j6YRieMYJuGAo7jEjbYYze1gWfaUZpYVTCBkPbYUws66J1YejYUFpgOC8YxsQ6iOwwdLwdxv+CsdbvGL5+WRfrhYkNhhCWGIOXdcGxYbhgfGGcLBh7/bIuODYYmm+PcWxi7Ky2o/WFEQ/o3Oa4Pba/GKHVdpTnJoZlQiPgbxihtMII5QuGdjD2wt6rDQbHEqOJ8fSFof8gjK3VdsSxjUHfcMB4vsxAWmGoNkZ1W5dbOaVXDPXBoH8wTnYYlTeYgbTaV/sJ/RHD8LXVDF/OMy/YYvQnND9bYyS3NzYTOpC2GOVl7xr6D3u3scdIh86VfWPHdmtnqD8YB9O+sRd2Z2xqixH//c62GDGc7c7YvpPQXxgV2zKwbcjEvxgFmPv2dqytvsV4y+Ttu54+I9EfGGe+4/0YrC1GdJ26lGNXHAuMGb/K0QCM/TEfYG3JkF9lGALGvB9A27tYbhbVGzgEdO6jnE7gcBNe7ow/jsnKt7dI3Gz8eVkKbm6s/M3/4wCPzfRlNOJ7V97K7m7uHm0wfPbhU9c/gj7mQwiRRxNRCg8YvD4RQPeYBuNiUvYHZhRnQWfqiHoUUBj/vESEyUTBr5OhpUHDVUEHyWuEPiD/AXyR06LhHfLvAAAAAElFTkSuQmCC'
      },
      msg: '验证码获取成功'
    }
  },
  
  // 通用数据请求处理函数，用于处理没有在上面定义的API请求
  '__fallback__': (url, config) => {
    console.log(`[Mock] 处理未定义的请求: ${url}`);
    
    try {
      // 尝试解析请求数据和参数，如果有的话
      let requestData = {};
      if (config.data) {
        try {
          requestData = JSON.parse(config.data);
        } catch (e) {
          console.log('[Mock] 请求数据不是JSON格式');
        }
      }
      
      // 根据URL路径特征返回不同的响应
      // 用户相关的请求
      if (url.includes('/user/')) {
        if (url.includes('changePassword')) {
          return {
            code: 0,
            data: {},
            msg: '密码修改成功'
          };
        } else if (url.includes('setUserInfo') || url.includes('setSelfInfo')) {
          return {
            code: 0,
            data: requestData,
            msg: '用户信息设置成功'
          };
        } else if (url.includes('getUserList')) {
          return {
            code: 0,
            data: {
              list: [mockState.userInfo || {
                ID: 1,
                uuid: 'admin-uuid',
                userName: 'admin',
                nickName: '超级管理员',
                authorityId: '888',
                headerImg: 'https://qmplusimg.henrongyi.top/gva_header.jpg'
              }],
              total: 1,
              page: 1,
              pageSize: 10
            },
            msg: '获取用户列表成功'
          };
        }
        
        // 默认用户操作成功
        return {
          code: 0,
          data: {},
          msg: '用户操作成功'
        };
      } 
      // 菜单相关的请求
      else if (url.includes('/menu/')) {
        // 根据权限ID获取菜单
        return {
          code: 0,
          data: {
            menus: menuData.data.menus
          },
          msg: '请求成功'
        };
      }
      // API相关的请求
      else if (url.includes('/api/')) {
        return {
          code: 0,
          data: [],
          msg: 'API请求成功'
        };
      }
      // 系统相关的请求
      else if (url.includes('/system/')) {
        return {
          code: 0,
          data: {
            config: {
              logo: 'https://qmplusimg.henrongyi.top/gva_header.jpg',
              name: '管理系统',
              version: 'v1.0'
            }
          },
          msg: '系统请求成功'
        };
      }
      // 测试数据库相关的请求
      else if (url.includes('/init/')) {
        return {
          code: 0,
          data: {
            needInit: false
          },
          msg: '数据库已初始化'
        };
      }
      // 文件上传相关的请求
      else if (url.includes('/fileUploadAndDownload/')) {
        return {
          code: 0,
          data: {
            file: {
              url: 'https://qmplusimg.henrongyi.top/gva_header.jpg'
            }
          },
          msg: '上传成功'
        };
      }
      // 默认返回空数据但状态成功
      else {
        return {
          code: 0,
          data: {},
          msg: '请求成功'
        };
      }
    } catch (err) {
      console.error('[Mock] 处理请求异常:', err);
      // 发生异常时仍返回成功状态，避免前端报错
      return {
        code: 0,
        data: {},
        msg: '请求成功'
      };
    }
  }
}

// 请求拦截器，用于模拟接口响应
export function setupMock() {
  // 判断是否已存在window.axios，否则等待其加载
  const waitForAxios = () => {
    if (window.axios) {
      initMock();
    } else {
      // 如果axios还未加载，等待100毫秒后重试
      setTimeout(waitForAxios, 100);
    }
  }

  const initMock = () => {
    // 保存原始axios方法
    const originalAxios = window.axios.create;
    
    // 重写axios方法
    window.axios.create = function(config) {
      const instance = originalAxios.call(this, config);
      
      // 保存原始请求方法
      const originalRequest = instance.request;
      
      // 重写请求方法
      instance.request = function(config) {
        // 查找是否存在对应的mock数据
        const url = config.url;
        const mockResponse = mockData[url];
        
        if (mockResponse) {
          console.log('[Mock] 请求被拦截:', url);
          
          // 模拟请求延迟
          return new Promise((resolve) => {
            setTimeout(() => {
              const response = {
                data: mockResponse(config),
                status: 200,
                statusText: 'OK',
                headers: {},
                config: config
              };
              resolve(response);
            }, 500); // 延迟500ms模拟网络请求
          });
        }
        
        // 如果不存在特定的mock数据，使用通用拦截器
        if (mockData['__fallback__']) {
          console.log('[Mock] 使用通用拦截器处理请求:', url);
          
          return new Promise((resolve) => {
            setTimeout(() => {
              const response = {
                data: mockData['__fallback__'](url, config),
                status: 200,
                statusText: 'OK',
                headers: {},
                config: config
              };
              resolve(response);
            }, 500);
          });
        }
        
        // 如果不存在mock数据，使用原始请求方法
        console.log('[Mock] 未拦截的请求:', url);
        return originalRequest.call(this, config);
      };
      
      return instance;
    };
    
    console.log('[Mock] 模拟服务已启动');
  };

  // 开始等待axios加载
  waitForAxios();
} 