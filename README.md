# wz-backend-web

万知微服务前端项目，基于Vue.js框架实现。提供管理后台界面，支持多租户模式。

## 项目结构

```
wz-backend-web/
├── public/              # 静态资源
├── src/                 # 源代码
│   ├── api/             # API接口
│   ├── assets/          # 项目资源
│   ├── components/      # 公共组件
│   ├── layout/          # 布局组件
│   ├── router/          # 路由配置
│   ├── store/           # 状态管理
│   ├── styles/          # 样式文件
│   ├── utils/           # 工具函数
│   └── views/           # 页面视图
├── tests/               # 测试文件
├── babel.config.js      # Babel配置
├── package.json         # 项目依赖
└── vue.config.js        # Vue配置
```

## 技术栈

- Vue.js 3.0
- Vue Router
- Vuex
- Axios
- Element Plus
- ECharts
- Vue I18n

## 主要功能

- 用户认证与授权
- 内容管理
- 站点配置
- 数据统计与分析
- 交易管理
- 多租户管理

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run serve
```

### 构建生产环境

```bash
npm run build
```

### 运行测试

```bash
npm run test
```

### 代码检查

```bash
npm run lint
```

## 浏览器支持

- Chrome
- Firefox
- Safari
- Edge
