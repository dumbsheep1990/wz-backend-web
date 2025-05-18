// 权限相关的mock数据
export const authData = {
  // 权限列表
  authority: [
    {
      authorityId: '888',
      authorityName: '超级管理员',
      parentId: '0',
      dataAuthorityId: null,
      children: [
        {
          authorityId: '8881',
          authorityName: '系统管理员',
          parentId: '888',
          dataAuthorityId: null,
          children: []
        },
        {
          authorityId: '8882',
          authorityName: '内容管理员',
          parentId: '888',
          dataAuthorityId: null,
          children: []
        }
      ]
    },
    {
      authorityId: '999',
      authorityName: '普通用户',
      parentId: '0',
      dataAuthorityId: null,
      children: []
    }
  ],
  
  // 策略列表
  casbin: {
    policyPathMaps: [
      {
        id: 1,
        path: '/dashboard',
        authoritys: ['888', '999']
      },
      {
        id: 2,
        path: '/system',
        authoritys: ['888']
      },
      {
        id: 3,
        path: '/content',
        authoritys: ['888', '8882']
      }
    ]
  }
} 