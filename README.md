# 优课联盟 - 在线课程教学平台

## 📖 项目简介

优课联盟是一个基于Web的在线教育平台，支持多用户角色（学生、教师、管理员），提供完整的课程管理、学习管理和用户管理功能。平台采用纯前端技术栈，使用LocalStorage作为数据存储解决方案。

## 启动方法
1. npm install
2. npm run start

## ✨ 核心功能

### 🎯 多角色用户系统
- **学生** - 课程学习、作业提交、学习进度管理
- **教师** - 课程发布、学生管理、作业批改
- **管理员** - 平台管理、用户管理、数据统计

### 📚 课程管理系统
- 课程发布与编辑
- 多媒体课件上传支持
- 课程分类管理（理学·工学、计算机、教育·语言等8大类别）
- 课程轮播图管理
- 课程评论和笔记功能

### 🎨 用户界面特色
- 响应式设计，支持移动端适配
- 现代化UI风格
- 轮播图展示
- 课程搜索和筛选
- 动态导航栏

### 🔐 认证与安全
- 用户注册/登录系统
- 密码哈希加密
- 会话管理
- 账户状态管理
- 登录错误次数限制和账户冻结机制

## 🛠️ 技术栈

### 前端技术
- **HTML5** - 语义化页面结构
- **CSS3** - 现代化样式设计，支持响应式布局
- **JavaScript (ES6+)** - 动态交互和数据处理
- **Font Awesome** - 图标库

### 数据存储
- **LocalStorage** - 本地数据持久化存储
- **JSON** - 数据格式化

### 架构模式
- **MVC架构** - 模型-视图-控制器分离
- **组件化设计** - 可复用UI组件
- **模块化开发** - 功能模块独立

## 📁 项目结构

```
last_project/
├── Homepage/                    # 主页模块
│   ├── js/                     # 主页JavaScript文件
│   │   ├── courses.js          # 课程管理逻辑
│   │   ├── main.js             # 主要业务逻辑
│   │   ├── auth.js             # 认证相关
│   │   └── ...
│   ├── css/                    # 样式文件目录
│   ├── images/                 # 图片资源
│   ├── WebsiteHomepage.html   # 主页入口
│   ├── courseList.html         # 课程列表页
│   ├── league.html             # 联盟院校页面
│   ├── about-us.html           # 关于我们页面
│   └── ...
├── student/                    # 学生模块
│   ├── student-profile.html    # 学生个人中心
│   ├── student-profile.css     # 学生页面样式
│   ├── student-profile-database.js # 学生数据管理
│   └── images/                 # 学生模块图片
├── teacher/                    # 教师模块
│   ├── teacher-profile.html    # 教师个人中心
│   ├── courseManager.html      # 课程管理页面
│   ├── courseManager.js        # 课程发布逻辑
│   ├── course.html             # 课程详情页
│   └── ...
├── account/                    # 账户管理模块
│   ├── login.html              # 登录页面
│   ├── register.html           # 注册页面
│   ├── admin-profile.html      # 管理员中心
│   ├── student-setting.html    # 学生设置
│   ├── teacher-setting.html    # 教师设置
│   └── ...
├── course/                     # 课程模块
│   ├── course.html             # 课程详情页
│   ├── course.js               # 课程业务逻辑
│   └── course.css              # 课程页面样式
├── header-footer/              # 公共组件
│   ├── common.css              # 公共样式
│   ├── logo.png                # 平台Logo
│   ├── ico.png                 # 网站图标
│   └── images/                 # 公共图片资源
└── database.js                 # 数据库初始化文件
```

## 🚀 快速开始

### 环境要求
- 现代Web浏览器（Chrome、Firefox、Safari、Edge）
- 本地Web服务器（推荐使用Live Server扩展）

### 安装步骤

1. **克隆项目**
   ```bash
   git clone [项目地址]
   cd last_project
   ```

2. **启动本地服务器**
   ```bash
   # 使用Python（如果已安装）
   python -m http.server 8000
   
   # 或使用Node.js http-server
   npx http-server
   
   # 或使用VS Code Live Server扩展
   ```

3. **访问应用**
   ```
   http://localhost:8000/Homepage/WebsiteHomepage.html
   ```

### 默认账户

系统预设了以下测试账户：

| 角色 | 用户ID | 密码 | 说明 |
|------|--------|------|------|
| 管理员 | admin | admin | 系统管理员账户 |
| 教师 | teacher | teacher | 默认教师账户 |

> 学生账户需要通过注册页面自行创建

## 📖 使用指南

### 学生用户
1. **注册账户** - 通过注册页面创建学生账户
2. **浏览课程** - 在主页查看推荐、热门、最新课程
3. **搜索筛选** - 使用搜索框或分类筛选查找课程
4. **学习课程** - 点击课程卡片进入学习页面
5. **管理学习** - 在个人中心查看学习进度和作业

### 教师用户
1. **登录系统** - 使用教师账户登录
2. **发布课程** - 在课程管理页面创建新课程
3. **上传资料** - 添加课件、图片等教学资源
4. **管理学生** - 查看学生学习情况和作业提交
5. **设置作业** - 为课程添加作业任务和截止时间

### 管理员用户
1. **用户管理** - 管理学生和教师账户状态
2. **平台监控** - 查看平台使用数据和统计信息
3. **内容审核** - 审核课程内容和用户评论
4. **系统设置** - 配置平台参数和功能开关

## 🔧 开发说明

### 代码规范
- 遵循ES6+语法标准
- 使用语义化HTML标签
- CSS采用BEM命名规范
- JavaScript使用模块化开发

### 数据结构
项目使用LocalStorage存储数据，主要数据结构包括：

```javascript
// 用户数据结构
{
  userid: '用户ID',
  username: '用户名',
  phone: '手机号',
  password: '加密密码',
  avatar: '头像URL',
  identity: '身份角色',
  status: '账户状态'
}

// 课程数据结构
{
  id: '课程ID',
  title: '课程标题',
  description: '课程描述',
  category: '课程分类',
  teacher: '授课教师',
  coverImage: '封面图片',
  enrollCount: '报名人数',
  recommended: '是否推荐'
}
```

### 核心功能模块

#### 1. 认证系统 (`account.js`)
- 用户注册/登录验证
- 密码加密与校验
- 会话管理

#### 2. 课程管理 (`courseManager.js`)
- 课程CRUD操作
- 课件文件管理
- 作业系统

#### 3. 用户界面 (`Homepage.js`)
- 动态内容加载
- 搜索和筛选
- 响应式交互

## 🎨 UI/UX设计特色

### 响应式设计
- 移动端优先设计理念
- 弹性布局适配不同屏幕
- 触控友好的交互设计

### 视觉设计
- 现代化卡片式布局
- 一致的色彩系统
- 优雅的动画过渡效果
- 直观的图标使用

### 用户体验
- 清晰的导航结构
- 快速的页面加载
- 友好的错误提示
- 无障碍访问支持

## 🔄 版本更新

### 当前版本特性
- ✅ 完整的用户角色系统
- ✅ 课程发布和管理功能
- ✅ 响应式UI设计
- ✅ 本地数据存储
- ✅ 多媒体内容支持
- ✅ 联盟院校展示页面
- ✅ 关于我们介绍页面

### 后续规划
- 🔄 集成真实后端数据库
- 🔄 增加实时通信功能
- 🔄 优化移动端体验
- 🔄 添加更多交互功能
- 🔄 性能优化和代码重构

## 🤝 贡献指南

1. Fork 项目仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码质量要求
- 遵循项目代码规范
- 添加必要的注释
- 确保跨浏览器兼容性
- 测试新增功能

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- 项目维护者：优课联盟开发团队
- 邮箱：support@youke-union.com
- 官网：https://www.youke-union.com

---

**优课联盟** - 让学习更简单，让教学更高效 🎓 