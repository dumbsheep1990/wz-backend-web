// 全局XHR请求拦截器 - 用于模拟后端API响应
// 这个文件直接拦截所有的XHR请求，不依赖于任何框架或库

// 模拟数据状态
const mockState = {
  isLoggedIn: false,
  token: '',
  userInfo: null
};

// 创建一个模拟响应对象
const createMockResponse = (data) => {
  return {
    status: 200,
    statusText: 'OK',
    data: data,
    headers: {},
    config: {},
    request: {}
  };
};

// 模拟数据响应
const mockResponses = {
  // 登录接口
  '/base/login': (config) => {
    try {
      const requestData = JSON.parse(config.data || '{}');
      const { username } = requestData;
      const nickname = username === 'admin' ? '超级管理员' : '普通用户';
      const authorityId = username === 'admin' ? '888' : '9528';
      
      // 创建用户信息
      const userInfo = {
        ID: 1,
        uuid: `user-${username}-uuid`,
        userName: username,
        nickName: nickname,
        headerImg: 'https://qmplusimg.henrongyi.top/gva_header.jpg',
        sideMode: 'dark',
        activeColor: '#1890ff',
        baseColor: '#fff',
        authority: {
          defaultRouter: 'dashboard'
        },
        authorityId: authorityId,
        authorities: [{ 
          authorityId: authorityId, 
          authorityName: nickname
        }]
      };
      
      // 生成token
      const token = `mock-token-${username}-${Date.now()}`;
      
      // 更新状态
      mockState.isLoggedIn = true;
      mockState.token = token;
      mockState.userInfo = userInfo;
      
      // 返回登录成功响应
      return {
        code: 0,
        data: {
          user: userInfo,
          token: token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).getTime()
        },
        msg: '登录成功'
      };
    } catch (error) {
      console.error('Mock login error:', error);
      return {
        code: 7,
        data: {},
        msg: '登录失败: ' + error.message
      };
    }
  },
  
  // 验证码接口
  '/base/captcha': () => {
    return {
      code: 0,
      data: {
        captchaId: `mock-captcha-${Date.now()}`,
        picPath: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAoCAMAAAA/pR6tAAAAh1BMVEX///8AAAD8/Pz5+fn29vbz8/Pw8PDt7e3q6urm5ubj4+Pf39/c3NzY2NjV1dXR0dHNzc3Jycm/v7+7u7u3t7ezs7Ovr6+rq6unp6eioqKenp6ampqWlpaSkpKOjo6KiYmGhoaCgoJ+fn56enp2dnZycnJubm5qamplZWVhYWFdXV1ZWVlUVFRFdOZ7AAAD2UlEQVRIx5WWi3aiMABFX4EkEAMIAcQXD6u1/f8PnIRHnDh2HHtndbHMhnOTm0dw3esPmAIxhOvxxj4KvmzTY34YK/ihzZPhjWbIizM9aBFnAshRSY0CIVqZUQ5nTQqR+nRPlEh9CJHu9FahvcvYRRZ0T5dYnAWPcp8uogAewEn3Ugxo5HRPKXFaZDJ4hCBLG68T0IhpItJzSXyyaUwPwGjkdE8ZT+Aok0kcgVHSRMZNdKAIaEybDoCwGgcEa0lTWQnuG3mUSDoFwKU7GkWiZFJWg9A9jDLkCT2gCZOxwsyiSLqKV3AEjP1JbzCWNFGhMc5SkjGlbxhLmkrnULg0HrkYUw0j8uPkgWMI9XocoWMIezpWN84R7ehcQkPndRxj6SfgGeIhXUlCrz4vOOY7OheOhpE4Ghwlj5kUDxinPZ0LDSOh7ypcZnSuzYNLMaJz8WEscJTl11a0/2BcLnQNrcdoO9DsaRzqChxlwYdWgdGgzqNGqZ7yxKOJGAKMxZHGlWHEv5+LxIiH4MitYRQ/1sWHYVwT3tcFPyPRMMoPw1JfuBgpXQ/0Qv0YiBaNi9A44l8YlhYc8YY+IR3GWOD4jfGCx/w7hsMHBBUfjMucviPthYHrUn3HcDhuQn5jVE2M1Cq9Y6j6YRieMYJuGAo7jEjbYYze1gWfaUZpYVTCBkPbYUws66J1YejYUFpgOC8YxsQ6iOwwdLwdxv+CsdbvGL5+WRfrhYkNhhCWGIOXdcGxYbhgfGGcLBh7/bIuODYYmm+PcWxi7Ky2o/WFEQ/o3Oa4Pba/GKHVdpTnJoZlQiPgbxihtMII5QuGdjD2wt6rDQbHEqOJ8fSFof8gjK3VdsSxjUHfcMB4vsxAWmGoNkZ1W5dbOaVXDPXBoH8wTnYYlTeYgbTaV/sJ/RHD8LXVDF/OMy/YYvQnND9bYyS3NzYTOpC2GOVl7xr6D3u3scdIh86VfWPHdmtnqD8YB9O+sRd2Z2xqixH//c62GDGc7c7YvpPQXxgV2zKwbcjEvxgFmPv2dqytvsV4y+Ttu54+I9EfGGe+4/0YrC1GdJ26lGNXHAuMGb/K0QCM/TEfYG3JkF9lGALGvB9A27tYbhbVGzgEdO6jnE7gcBNe7ow/jsnKt7dI3Gz8eVkKbm6s/M3/4wCPzfRlNOJ7V97K7m7uHm0wfPbhU9c/gj7mQwiRRxNRCg8YvD4RQPeYBuNiUvYHZhRnQWfqiHoUUBj/vESEyUTBr5OhpUHDVUEHyWuEPiD/AXyR06LhHfLvAAAAAElFTkSuQmCC'
      },
      msg: '验证码获取成功'
    };
  },
  
  // 获取用户信息
  '/user/getUserInfo': () => {
    // 使用存储的用户信息或默认信息
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
    };
  },
  
  // 登出接口
  '/jwt/jsonInBlacklist': () => {
    // 清除登录状态
    mockState.isLoggedIn = false;
    mockState.token = '';
    mockState.userInfo = null;
    
    return {
      code: 0,
      data: {},
      msg: '登出成功'
    };
  },
  
  // 存储侧边导航的配置数据
  sideNavigationItems: [
    {
      id: 1,
      title: '系统设置',
      url: '/system',
      icon: 'setting',
      parent_id: 0,
      sort: 1,
      status: 1
    },
    {
      id: 2,
      title: '用户管理',
      url: '/user',
      icon: 'user',
      parent_id: 0,
      sort: 2,
      status: 1
    },
    {
      id: 3,
      title: '内容管理',
      url: '/content',
      icon: 'document',
      parent_id: 0,
      sort: 3,
      status: 1
    },
    {
      id: 4,
      title: '文章管理',
      url: '/content/article',
      icon: 'notebook',
      parent_id: 3, // 作为内容管理的子菜单
      sort: 1,
      status: 1
    },
    {
      id: 5,
      title: '分类管理',
      url: '/content/category',
      icon: 'collection',
      parent_id: 3, // 作为内容管理的子菜单
      sort: 2,
      status: 1
    },
    {
      id: 6,
      title: '导航管理',
      url: '/navigation',
      icon: 'compass',
      parent_id: 0,
      sort: 3,
      status: 1
    },
    {
      id: 7,
      title: '侧边导航配置',
      url: '/navigation/side',
      icon: 'indent',
      parent_id: 6, // 作为导航管理的子菜单
      sort: 1,
      status: 1
    },
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
    },
    {
      id: 8,
      title: '侧边导航相关接口',
      url: '/api/v1/admin/navigation/side',
      icon: 'api',
      parent_id: 7, // 作为侧边导航配置的子菜单
      sort: 1,
      status: 1
    }
  ],
  
  // 将侧边导航配置项转换为系统菜单格式
  convertSideNavToMenus: function() {
    // 创建一个映射用于快速查找
    const itemMap = {};
    const menuItems = [];
    
    // 先将所有项目放入映射
    this.sideNavigationItems.forEach(item => {
      if (item.status !== 1) return; // 忽略禁用的项目
      
      const menuItem = {
        ID: item.id,
        CreatedAt: '2023-01-01T00:00:00Z',
        UpdatedAt: '2023-01-01T00:00:00Z',
        parentId: item.parent_id.toString(),
        path: item.url.startsWith('/') ? item.url.substring(1) : item.url,
        name: 'menu_' + item.id,
        hidden: false,
        component: this.guessComponentPath(item.url),
        sort: item.sort,
        meta: {
          title: item.title,
          icon: item.icon
        }
      };
      
      itemMap[item.id] = menuItem;
    });
    
    // 构建菜单树
    this.sideNavigationItems.forEach(item => {
      if (item.status !== 1) return; // 忽略禁用的项目
      
      const menuItem = itemMap[item.id];
      if (!menuItem) return;
      
      if (item.parent_id === 0) {
        // 顶级菜单直接添加
        menuItems.push(menuItem);
      } else {
        // 子菜单添加到父级的children数组
        const parentItem = itemMap[item.parent_id];
        if (parentItem) {
          if (!parentItem.children) {
            parentItem.children = [];
          }
          parentItem.children.push(menuItem);
        } else {
          // 如果父级不存在或被禁用，作为顶级菜单添加
          menuItems.push(menuItem);
        }
      }
    });
    
    // 添加仪表盘
    menuItems.unshift({
      ID: 999,
      CreatedAt: '2023-01-01T00:00:00Z',
      UpdatedAt: '2023-01-01T00:00:00Z',
      parentId: '0',
      path: 'dashboard',
      name: 'dashboard',
      hidden: false,
      component: 'view/dashboard/index.vue',
      sort: 0,
      meta: {
        title: '仪表盘',
        icon: 'odometer'
      }
    });
    
    return menuItems;
  },
  
  // 根据URL猜测组件路径
  guessComponentPath: function(url) {
    if (!url || url === '/') {
      return 'view/dashboard/index.vue';
    }
    
    // 移除开头的斜杠
    const path = url.startsWith('/') ? url.substring(1) : url;
    
    // 对特殊URL进行映射
    const specialPaths = {
      'user': 'view/user/index.vue',
      'system': 'view/system/index.vue',
      'navigation/side': 'view/navigation/side/index.vue',
      'content/article': 'view/content/article/index.vue',
      'content/category': 'view/content/category/index.vue'
    };
    
    if (specialPaths[path]) {
      return specialPaths[path];
    }
    
    // 一般情况下，尝试构造标准路径
    return `view/${path}/index.vue`;
  },
  
  // 获取菜单
  '/menu/getMenu': (config) => {
    return {
      code: 0,
      data: {
        menus: mockResponses.convertSideNavToMenus()
      },
      msg: '获取菜单成功'
    };
  },
  
  // 获取权限列表
  '/authority/getAuthorityList': () => {
    return {
      code: 0,
      data: [
        {
          authorityId: '888',
          authorityName: '超级管理员',
          parentId: '0',
          dataAuthorityId: null,
          children: null,
          menus: null,
          defaultRouter: 'dashboard'
        },
        {
          authorityId: '9528',
          authorityName: '普通用户',
          parentId: '0',
          dataAuthorityId: null,
          children: null,
          menus: null,
          defaultRouter: 'dashboard'
        }
      ],
      msg: '获取成功'
    };
  },
  
  // 获取策略列表
  '/casbin/getPolicyPathByAuthorityId': () => {
    return {
      code: 0,
      data: [],
      msg: '获取成功'
    };
  },
  
  // 获取侧边导航配置列表
  '/api/v1/admin/navigation/side': (config) => {
    // 如果是GET请求，返回侧边导航的配置项
    if (config.method.toLowerCase() === 'get') {
      return {
        code: 0,
        data: mockResponses.sideNavigationItems.filter(item => !item.url.startsWith('/api')),
        msg: '获取侧边导航列表成功'
      };
    }
    // 如果是POST请求，保存侧边导航配置
    else if (config.method.toLowerCase() === 'post') {
      try {
        const data = JSON.parse(config.data);
        
        // 如果是编辑已有项目
        if (data.id) {
          const index = mockResponses.sideNavigationItems.findIndex(item => item.id === data.id);
          if (index !== -1) {
            mockResponses.sideNavigationItems[index] = { ...data };
          }
        } 
        // 如果是新增项目
        else {
          // 生成新的ID
          const maxId = Math.max(...mockResponses.sideNavigationItems.map(item => item.id), 0);
          data.id = maxId + 1;
          mockResponses.sideNavigationItems.push(data);
        }
        
        return {
          code: 0,
          data: data,
          msg: '保存侧边导航配置成功'
        };
      } catch (error) {
        console.error('保存侧边导航数据失败:', error);
        return {
          code: 1,
          data: {},
          msg: '保存失败: ' + error.message
        };
      }
    }
    
    return defaultHandler(config.url);
  },
  
  // 删除侧边导航配置
  '/api/v1/admin/navigation/side/(\\d+)': (config, matches) => {
    if (config.method.toLowerCase() === 'delete' && matches && matches[1]) {
      const id = parseInt(matches[1], 10);
      const index = mockResponses.sideNavigationItems.findIndex(item => item.id === id);
      
      if (index !== -1) {
        // 找到子项，将其父级ID设为0（提升到顶级）
        mockResponses.sideNavigationItems.forEach(item => {
          if (item.parent_id === id) {
            item.parent_id = 0;
          }
        });
        
        // 删除项目
        mockResponses.sideNavigationItems.splice(index, 1);
        
        return {
          code: 0,
          data: {},
          msg: '删除成功'
        };
      } else {
        return {
          code: 1,
          data: {},
          msg: '未找到指定的导航项'
        };
      }
    }
    
    return defaultHandler(config.url);
  }
};

// 默认响应处理函数
const defaultHandler = (url) => {
  // 根据URL前缀返回不同类型的默认响应
  if (url.includes('/user/')) {
    return {
      code: 0,
      data: {},
      msg: '用户操作成功'
    };
  } else if (url.includes('/api/')) {
    return {
      code: 0,
      data: [],
      msg: 'API请求成功'
    };
  } else if (url.includes('/system/')) {
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
  } else {
    return {
      code: 0,
      data: {},
      msg: '请求成功'
    };
  }
};

// 初始化XHR拦截器
export function setupMockXHR() {
  // 保存原始XMLHttpRequest
  const originalXHR = window.XMLHttpRequest;
  
  // 创建自定义的XMLHttpRequest
  const MockXMLHttpRequest = function() {
    const xhr = new originalXHR();
    
    // 保存请求状态和数据
    this.requestMethod = null;
    this.requestUrl = null;
    this.requestData = null;
    this.requestHeaders = {};
    this.responseType = '';
    
    // 保存回调函数
    this.onreadystatechange = null;
    this.onload = null;
    this.onerror = null;
    
    // 模拟XHR属性
    this.readyState = 0;
    this.response = null;
    this.responseText = null;
    this.responseXML = null;
    this.status = 0;
    this.statusText = '';
    
    // 拦截open方法
    this.open = function(method, url) {
      this.requestMethod = method;
      this.requestUrl = url;
      this.readyState = 1;
      
      // 如果不是需要拦截的请求，则直接使用原始XHR
      const isApiUrl = url.includes('/api/') || url.startsWith('/base/') || url.startsWith('/user/') || 
                       url.startsWith('/jwt/') || url.startsWith('/menu/') || url.startsWith('/authority/') ||
                       url.startsWith('/casbin/');
      
      if (!isApiUrl) {
        return xhr.open.apply(xhr, arguments);
      }
      
      // 记录请求信息，但不实际发送
      console.log('[Mock XHR] Intercepted request:', method, url);
    };
    
    // 拦截setRequestHeader方法
    this.setRequestHeader = function(header, value) {
      this.requestHeaders[header] = value;
    };
    
    // 拦截send方法
    this.send = function(data) {
      this.requestData = data;
      
      // 检查是否为API请求，需要拦截
      const url = this.requestUrl;
      const isApiUrl = url.includes('/api/') || url.startsWith('/base/') || url.startsWith('/user/') || 
                       url.startsWith('/jwt/') || url.startsWith('/menu/') || url.startsWith('/authority/') ||
                       url.startsWith('/casbin/');
      
      if (!isApiUrl) {
        // 不需要拦截的请求，使用原始XHR
        return xhr.send.apply(xhr, arguments);
      }
      
      // 构建请求配置对象
      const config = {
        method: this.requestMethod,
        url: this.requestUrl,
        headers: this.requestHeaders,
        data: this.requestData
      };
      
      // 模拟请求延迟
      setTimeout(() => {
        // 查找对应的模拟处理器
        let responseData;
        let handler = mockResponses[url];
        
        // 如果没有直接匹配的处理器，尝试正则表达式匹配
        if (!handler) {
          const regexHandlers = Object.keys(mockResponses).filter(key => key.includes('('));
          
          for (const pattern of regexHandlers) {
            const regex = new RegExp(pattern);
            const matches = url.match(regex);
            
            if (matches) {
              handler = mockResponses[pattern];
              responseData = handler(config, matches);
              console.log(`[Mock XHR] Using regex handler for: ${url} with pattern ${pattern}`);
              break;
            }
          }
        }
        
        if (handler && !responseData) {
          responseData = handler(config);
          console.log(`[Mock XHR] Using specific handler for: ${url}`);
        } else if (!responseData) {
          // 使用默认处理器
          responseData = defaultHandler(url);
          console.log(`[Mock XHR] Using default handler for: ${url}`);
        }
        
        // 设置响应状态
        this.readyState = 4;
        this.status = 200;
        this.statusText = 'OK';
        
        // 根据responseType格式化响应
        const responseStr = JSON.stringify(responseData);
        this.response = responseData;
        this.responseText = responseStr;
        
        // 触发回调
        if (this.onreadystatechange) {
          this.onreadystatechange();
        }
        
        if (this.onload) {
          this.onload();
        }
        
      }, 100); // 模拟100ms网络延迟
    };
    
    // 拦截getResponseHeader方法
    this.getResponseHeader = function(name) {
      return null;
    };
    
    // 拦截getAllResponseHeaders方法
    this.getAllResponseHeaders = function() {
      return '';
    };
    
    // 拦截其他必要的XHR方法
    this.abort = function() {};
  };
  
  // 替换全局的XMLHttpRequest
  window.XMLHttpRequest = MockXMLHttpRequest;
  console.log('[Mock XHR] Global XMLHttpRequest interceptor installed');
}
