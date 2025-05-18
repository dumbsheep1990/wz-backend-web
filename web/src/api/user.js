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
// @Produce  application/json
// @Param data body {username:"string",password:"string"}
// @Router /base/login [post]
export const login = (data) => {
  // 如果使用MOCK模式
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { username, password } = data;
        
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
        resolve({
          code: 0,
          data: {
            user: userInfo,
            token: token,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).getTime() // 24小时后过期
          },
          msg: '登录成功'
        });
      }, 300); // 模拟网络延迟
    });
  }
  
  // 如果不使用MOCK模式，发送真实请求
  return service({
    url: '/base/login',
    method: 'post',
    data: data
  });
}

// @Summary 获取验证码
// @Produce  application/json
// @Param data body {username:"string",password:"string"}
// @Router /base/captcha [post]
export const captcha = () => {
  // 如果使用MOCK模式
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 0,
          data: {
            captchaId: `mock-captcha-${Date.now()}`,
            picPath: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAoCAMAAAA/pR6tAAAAh1BMVEX///8AAAD8/Pz5+fn29vbz8/Pw8PDt7e3q6urm5ubj4+Pf39/c3NzY2NjV1dXR0dHNzc3Jycm/v7+7u7u3t7ezs7Ovr6+rq6unp6eioqKenp6ampqWlpaSkpKOjo6KiYmGhoaCgoJ+fn56enp2dnZycnJubm5qamplZWVhYWFdXV1ZWVlUVFRFdOZ7AAAD2UlEQVRIx5WWi3aiMABFX4EkEAMIAcQXD6u1/f8PnIRHnDh2HHtndbHMhnOTm0dw3esPmAIxhOvxxj4KvmzTY34YK/ihzZPhjWbIizM9aBFnAshRSY0CIVqZUQ5nTQqR+nRPlEh9CJHu9FahvcvYRRZ0T5dYnAWPcp8uogAewEn3Ugxo5HRPKXFaZDJ4hCBLG68T0IhpItJzSXyyaUwPwGjkdE8ZT+Aok0kcgVHSRMZNdKAIaEybDoCwGgcEa0lTWQnuG3mUSDoFwKU7GkWiZFJWg9A9jDLkCT2gCZOxwsyiSLqKV3AEjP1JbzCWNFGhMc5SkjGlbxhLmkrnULg0HrkYUw0j8uPkgWMI9XocoWMIezpWN84R7ehcQkPndRxj6SfgGeIhXUlCrz4vOOY7OheOhpE4Ghwlj5kUDxinPZ0LDSOh7ypcZnSuzYNLMaJz8WEscJTl11a0/2BcLnQNrcdoO9DsaRzqChxlwYdWgdGgzqNGqZ7yxKOJGAKMxZHGlWHEv5+LxIiH4MitYRQ/1sWHYVwT3tcFPyPRMMoPw1JfuBgpXQ/0Qv0YiBaNi9A44l8YlhYc8YY+IR3GWOD4jfGCx/w7hsMHBBUfjMucviPthYHrUn3HcDhuQn5jVE2M1Cq9Y6j6YRieMYJuGAo7jEjbYYze1gWfaUZpYVTCBkPbYUws66J1YejYUFpgOC8YxsQ6iOwwdLwdxv+CsdbvGL5+WRfrhYkNhhCWGIOXdcGxYbhgfGGcLBh7/bIuODYYmm+PcWxi7Ky2o/WFEQ/o3Oa4Pba/GKHVdpTnJoZlQiPgbxihtMII5QuGdjD2wt6rDQbHEqOJ8fSFof8gjK3VdsSxjUHfcMB4vsxAWmGoNkZ1W5dbOaVXDPXBoH8wTnYYlTeYgbTaV/sJ/RHD8LXVDF/OMy/YYvQnND9bYyS3NzYTOpC2GOVl7xr6D3u3scdIh86VfWPHdmtnqD8YB9O+sRd2Z2xqixH//c62GDGc7c7YvpPQXxgV2zKwbcjEvxgFmPv2dqytvsV4y+Ttu54+I9EfGGe+4/0YrC1GdJ26lGNXHAuMGb/K0QCM/TEfYG3JkF9lGALGvB9A27tYbhbVGzgEdO6jnE7gcBNe7ow/jsnKt7dI3Gz8eVkKbm6s/M3/4wCPzfRlNOJ7V97K7m7uHm0wfPbhU9c/gj7mQwiRRxNRCg8YvD4RQPeYBuNiUvYHZhRnQWfqiHoUUBj/vESEyUTBr5OhpUHDVUEHyWuEPiD/AXyR06LhHfLvAAAAAElFTkSuQmCC'
          },
          msg: '验证码获取成功'
        });
      }, 200);
    });
  }
  
  // 如果不使用MOCK模式，发送真实请求
  return service({
    url: '/base/captcha',
    method: 'post'
  });
}

// @Summary 用户注册
// @Produce  application/json
// @Param data body {username:"string",password:"string"}
// @Router /base/resige [post]
export const register = (data) => {
  return service({
    url: '/user/admin_register',
    method: 'post',
    data: data
  })
}

// @Summary 修改密码
// @Produce  application/json
// @Param data body {username:"string",password:"string",newPassword:"string"}
// @Router /user/changePassword [post]
export const changePassword = (data) => {
  return service({
    url: '/user/changePassword',
    method: 'post',
    data: data
  })
}

// @Tags User
// @Summary 分页获取用户列表
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body modelInterface.PageInfo true "分页获取用户列表"
// @Success 200 {string} json "{"success":true,"data":{},"msg":"获取成功"}"
// @Router /user/getUserList [post]
export const getUserList = (data) => {
  return service({
    url: '/user/getUserList',
    method: 'post',
    data: data
  })
}

// @Tags User
// @Summary 设置用户权限
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body api.SetUserAuth true "设置用户权限"
// @Success 200 {string} json "{"success":true,"data":{},"msg":"修改成功"}"
// @Router /user/setUserAuthority [post]
export const setUserAuthority = (data) => {
  return service({
    url: '/user/setUserAuthority',
    method: 'post',
    data: data
  })
}

// @Tags SysUser
// @Summary 删除用户
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.SetUserAuth true "删除用户"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"修改成功"}"
// @Router /user/deleteUser [delete]
export const deleteUser = (data) => {
  return service({
    url: '/user/deleteUser',
    method: 'delete',
    data: data
  })
}

// @Tags SysUser
// @Summary 设置用户信息
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body model.SysUser true "设置用户信息"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"修改成功"}"
// @Router /user/setUserInfo [put]
export const setUserInfo = (data) => {
  return service({
    url: '/user/setUserInfo',
    method: 'put',
    data: data
  })
}

// @Tags SysUser
// @Summary 设置用户信息
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body model.SysUser true "设置用户信息"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"修改成功"}"
// @Router /user/setSelfInfo [put]
export const setSelfInfo = (data) => {
  return service({
    url: '/user/setSelfInfo',
    method: 'put',
    data: data
  })
}

// @Tags SysUser
// @Summary 设置自身界面配置
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body model.SysUser true "设置自身界面配置"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"修改成功"}"
// @Router /user/setSelfSetting [put]
export const setSelfSetting = (data) => {
  return service({
    url: '/user/setSelfSetting',
    method: 'put',
    data: data
  })
}

// @Tags User
// @Summary 设置用户权限
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body api.setUserAuthorities true "设置用户权限"
// @Success 200 {string} json "{"success":true,"data":{},"msg":"修改成功"}"
// @Router /user/setUserAuthorities [post]
export const setUserAuthorities = (data) => {
  return service({
    url: '/user/setUserAuthorities',
    method: 'post',
    data: data
  })
}

// @Tags User
// @Summary 获取用户信息
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Success 200 {string} json "{"success":true,"data":{},"msg":"获取成功"}"
// @Router /user/getUserInfo [get]
export const getUserInfo = () => {
  // 如果使用MOCK模式
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 使用存储的用户信息或者默认信息
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
        
        resolve({
          code: 0,
          data: {
            userInfo: userInfo
          },
          msg: '获取用户信息成功'
        });
      }, 200);
    });
  }
  
  // 如果不使用MOCK模式，发送真实请求
  return service({
    url: '/user/getUserInfo',
    method: 'get'
  });
}

export const resetPassword = (data) => {
  return service({
    url: '/user/resetPassword',
    method: 'post',
    data: data
  })
}
