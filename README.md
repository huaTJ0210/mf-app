# MF Admin — 基于 Module Federation 的微前端后台管理系统

## 项目简介

基于 **Vue 3 + TypeScript + Element Plus** 和 **Module Federation** 技术构建的微前端后台管理系统，采用 **RBAC** 权限模型，支持 4 套环境配置和完整的子应用部署方案。

## 架构概览

```
┌─────────────────────────────────────────────────────────┐
│                    Shell 主应用 (:5003)                   │
│  ┌──────────┐  ┌─────────────┐  ┌──────────────────────┐ │
│  │ 路由守卫  │  │ 动态路由生成  │  │  Component Map 解析  │ │
│  └──────────┘  └─────────────┘  └──────────────────────┘ │
│  ┌──────────────────────────────────────────────────────┐│
│  │           Layout (Sidebar + Navbar + TagsView)       ││
│  └──────────────────────────────────────────────────────┘│
│           │                              │                │
│     MF Remote Load                MF Remote Load          │
│           ▼                              ▼                │
│  ┌──────────────────┐        ┌──────────────────┐        │
│  │ system-admin (:5001)│      │ business (:5002) │        │
│  │  - UserList       │        │  - Dashboard     │        │
│  │  - RoleList       │        │  - Orders        │        │
│  │  - MenuList       │        │                  │        │
│  └──────────────────┘        └──────────────────┘        │
└─────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────┐
│  Mock Server (:3000)  │
│  Express + 内存 DB     │
└──────────────────┘
```

## 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | Vue 3.5 + TypeScript 5.6 |
| UI 库 | Element Plus 2.14 |
| 状态管理 | Pinia 3.0 |
| 路由 | Vue Router 4.5 |
| 构建工具 | Vite 5.4 + @originjs/vite-plugin-federation 1.4 |
| 包管理 | pnpm 10 (workspace monorepo) |
| Mock 服务 | Express 4 + tsx |
| 部署 | Docker + Nginx |

## 目录结构

```
mf-app/
├── pnpm-workspace.yaml          # pnpm workspace 配置
├── package.json                  # 根 package.json（脚本 + pnpm overrides）
├── tsconfig.base.json            # 共享 TS 配置
├── docker-compose.yml            # Docker 编排
├── .github/
│   └── workflows/
│       └── ci-cd.yml             # CI/CD 流水线
├── deploy/
│   ├── Dockerfile                # 通用多阶段 Dockerfile
│   ├── Dockerfile.mock           # Mock Server Dockerfile
│   └── nginx/                    # Nginx 配置
│       ├── shell.conf
│       ├── system-admin.conf
│       └── business.conf
├── packages/
│   └── shared/                   # @mf/shared 共享内核
│       └── src/
│           ├── types/            # RBAC 类型定义
│           ├── constants/        # 常量（白名单、存储键名等）
│           ├── utils/            # 工具（请求、权限、认证）
│           ├── stores/           # Pinia stores（user/permission/app/tagsView）
│           ├── directives/       # v-permission 指令
│           ├── api/              # API 接口
│           └── index.ts          # 统一导出
├── mock-server/                  # Express Mock Server
│   └── src/
│       ├── db.ts                 # 内存数据库（用户/角色/菜单/订单）
│       ├── middleware/auth.ts    # JWT 认证中间件
│       └── routes/               # API 路由
├── apps/
│   ├── shell/                    # 主应用
│   │   ├── src/
│   │   │   ├── main.ts           # 应用入口
│   │   │   ├── App.vue
│   │   │   ├── router/           # 路由（守卫/静态路由/组件映射）
│   │   │   ├── layout/           # 布局（Sidebar/Navbar/TagsView）
│   │   │   └── views/            # 页面（登录/首页/错误页/重定向）
│   │   └── .env.*                # 多环境配置
│   ├── system-admin/             # 子应用：系统管理
│   │   └── src/
│   │       ├── main.ts           # 入口（独立模式/远程模块模式）
│   │       ├── router/           # 独立模式路由
│   │       └── views/            # UserList / RoleList / MenuList
│   └── business/                 # 子应用：业务管理
│       └── src/
│           ├── main.ts
│           ├── router/
│           └── views/            # Dashboard / Orders
```

## 快速开始

### 环境要求

- Node.js >= 20
- pnpm >= 9

### 一键启动（推荐）

```bash
# 安装依赖
pnpm install

# 一键启动所有服务（Mock Server + 3 个前端应用）
pnpm dev
```

### 微前端联调（推荐）

当需要在本地开发时让主应用稳定消费子应用产物（`remoteEntry.js`）并支持子应用实时增量构建，使用：

```bash
pnpm dev:mf
```

该命令会并发启动：

- `mock-server`（:3000）
- `shell` 开发服务（:5003）
- `system-admin`：`vite build --watch` + `vite preview`（:5001）
- `business`：`vite build --watch` + `vite preview`（:5002）

> 说明：`dev:mf` 模式下，子应用由 `preview` 提供 `dist/assets/remoteEntry.js`，更接近线上行为。

启动后访问：

| 服务 | 地址 |
|------|------|
| Shell 主应用 | http://localhost:5003 |
| system-admin 子应用（独立模式） | http://localhost:5001 |
| business 子应用（独立模式） | http://localhost:5002 |
| Mock Server API | http://localhost:3000/api |

### 测试账号

| 账号 | 密码 | 角色 | 权限范围 |
|------|------|------|---------|
| admin | 123456 | 超级管理员 | 全部菜单 + 全部按钮权限 |
| editor | 123456 | 业务编辑员 | 首页 + 业务模块 |
| viewer | 123456 | 访客 | 仅首页 |

### 单独启动某个服务

```bash
pnpm dev:mock          # 仅启动 Mock Server
pnpm dev:shell         # 仅启动 Shell 主应用
pnpm dev:system-admin  # 仅启动 system-admin 子应用
pnpm dev:business      # 仅启动 business 子应用
```

## 环境配置

每个应用支持 5 套环境配置文件：

| 文件 | 环境 | 说明 |
|------|------|------|
| `.env` | 基础 | 所有环境共享的变量 |
| `.env.dev` | 开发 | 本地开发，连接本地 Mock Server |
| `.env.test` | 测试 | 测试环境，连接测试 API |
| `.env.uat` | 预发布 | UAT 环境 |
| `.env.prod` | 生产 | 生产环境，连接 CDN 和生产 API |
| `.env.docker` | Docker | Docker Compose 部署，通过 Nginx 代理 |

### 关键环境变量

| 变量 | 说明 |
|------|------|
| `VITE_API_BASE_URL` | 后端 API 基础路径 |
| `VITE_PORT` | 开发服务器端口 |
| `VITE_SYSTEM_ADMIN_REMOTE_URL` | system-admin 子应用 remoteEntry.js 地址 |
| `VITE_BUSINESS_REMOTE_URL` | business 子应用 remoteEntry.js 地址 |
| `VITE_STANDALONE` | 子应用是否独立运行模式 |

当前 `dev` 环境默认端口：

- `shell`：`5003`
- `system-admin`：`5001`
- `business`：`5002`

## RBAC 权限系统

### 权限模型

```
用户 → 角色 → 菜单（目录/菜单/按钮）
```

- **目录**：侧边栏分组，如「系统管理」
- **菜单**：实际页面路由，如「用户管理」
- **按钮**：页面内操作权限点，如「新增用户」「删除用户」

### 核心流程

```
登录 → 获取 token
  → 路由守卫检测 token
  → 调用 getUserInfo 获取角色/权限/菜单树
  → generateRoutes 将菜单树转为动态路由
  → addRoute 注册到 Vue Router
  → 重新导航到目标页面
```

### 按钮级权限

使用 `v-permission` 指令控制按钮显示：

```vue
<el-button v-permission="'system:user:add'">新增</el-button>
<el-button v-permission="['system:user:edit', 'system:user:delete']">操作</el-button>
```

## Module Federation 设计要点

### 共享依赖（Singleton）

以下依赖通过 MF `singleton: true` 共享，确保跨应用单例：

- `vue` — 确保只有一个 Vue 实例
- `vue-router` — 确保只有一个路由实例
- `pinia` — 确保状态共享（defineStore 按 ID 缓存）
- `element-plus` — 避免重复加载 UI 库
- `@element-plus/icons-vue` — 图标单例
- `@mf/shared` — 跨应用共享请求客户端、权限指令与公共 store 能力

### 组件映射（Component Map）

菜单数据中的 `component` 字段是字符串，通过组件映射器解析为懒加载组件：

| component 值 | 解析结果 |
|---|---|
| `Layout` | 路由分组占位组件（仅承载子路由，不重复渲染 Shell 顶层布局） |
| `shell/Dashboard` | Shell 本地视图 `views/dashboard/index.vue` |
| `system-admin/UserList` | 通过 MF 远程加载 system-admin 的 UserList |
| `business/Orders` | 通过 MF 远程加载 business 的 Orders |

### 子应用独立模式

子应用通过 `VITE_STANDALONE` 环境变量控制运行模式：

- `true`：独立开发模式，自带路由和布局，可独立运行调试
- `false`：远程模块模式，仅暴露组件供宿主加载

## 构建与部署

### 本地构建

```bash
# 构建所有应用（生产模式）
pnpm build:prod

# 按环境构建
pnpm build:dev    # 开发环境
pnpm build:test   # 测试环境
pnpm build:uat    # 预发布环境
pnpm build:prod   # 生产环境
```

### Docker 部署

```bash
# 一键启动全栈（Mock Server + 3 个前端应用）
docker-compose up -d --build

# 访问 http://localhost:8080
```

### 部署顺序（Remote-First）

Module Federation 要求子应用先于主应用部署：

```bash
# 1. 先部署子应用
docker-compose up -d mf-business
docker-compose up -d mf-system-admin

# 2. 再部署主应用
docker-compose up -d mf-shell
```

### Nginx 配置要点

子应用的 Nginx 配置包含 MF 必需的 CORS 和缓存策略：

- `remoteEntry.js`：设置 `Access-Control-Allow-Origin *`，不缓存
- `__federation_*.js`：设置 CORS 头，长缓存（immutable）
- `index.html`：不缓存

### CI/CD 流水线

GitHub Actions 流水线（`.github/workflows/ci-cd.yml`）：

1. **质量检查**：TypeScript 类型检查
2. **构建子应用**：remote-first，先构建 system-admin 和 business
3. **构建主应用**：构建 shell
4. **Docker 镜像**：构建并推送到 GHCR
5. **部署**：输出部署指令

## 开发指南

### 新增子应用

1. 在 `apps/` 下创建新应用，配置 `vite.config.ts` 的 federation `exposes`
2. 在 Shell 的 `vite.config.ts` 中添加 `remotes` 配置
3. 在 Shell 的 `src/remote-modules.d.ts` 中添加模块类型声明
4. 在 Mock Server 的菜单数据中添加 `component: 'new-app/ComponentName'`
5. 在 Shell 的 `component-map.ts` 中确认解析逻辑（已自动处理远程导入）

### 新增页面权限

1. 在 Mock Server 的 `db.ts` 中添加菜单/按钮数据
2. 将权限码分配给对应角色的 `menuIds`
3. 在页面中使用 `v-permission="'module:resource:action'"` 控制按钮

### 类型检查

```bash
# 检查所有应用
npx vue-tsc --noEmit -p apps/shell/tsconfig.json
npx vue-tsc --noEmit -p apps/system-admin/tsconfig.json
npx vue-tsc --noEmit -p apps/business/tsconfig.json
```

## 常见问题排查

### 1) `remoteEntry.js` 加载失败 / 404

优先确认以下两点：

1. 对应子应用服务是否启动并监听正确端口（`5001`/`5002`）
2. `remoteEntry.js` 返回内容是否为 **JS**（不是 `index.html`）

可直接验证：

```bash
curl -i http://localhost:5001/assets/remoteEntry.js
curl -i http://localhost:5002/assets/remoteEntry.js
```

### 2) 主应用进入子应用页面后内容空白

- 推荐先使用 `pnpm dev:mf` 联调模式重启全部服务
- 确认三端 federation 都包含 `@mf/shared` 共享配置
- 清理 shell 的 Vite 缓存后重启：

```bash
rm -rf apps/shell/node_modules/.vite
pnpm dev:mf
```

### 3) 进入子应用页面后出现重复顶部栏/菜单栏

动态路由中的 `Layout` 仅用于目录分组，不应再次映射为 Shell 顶层布局。  
项目已将其映射为路由占位组件（仅 `router-view`），避免双层布局重复渲染。
