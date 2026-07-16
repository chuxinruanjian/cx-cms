# CX CMS

CX CMS 是一个面向 AI 持续开发的通用项目底座，采用 npm workspaces 管理：

- AdonisJS 7：API 与服务端业务
- Lucid ORM：统一支持 SQLite 和 MySQL
- Ant Design Pro 6：管理后台
- `apps/h5`：预留 H5 应用目录

仓库地址：<https://github.com/chuxinruanjian/cx-cms>

## 环境要求

安装前请确认本机已具备以下环境：

- Node.js >= 24.x
- npm >= 11.x
- Git

检查版本：

```bash
node --version
npm --version
git --version
```

如果使用 nvm，可以直接在项目根目录执行：

```bash
nvm install
nvm use
```

项目根目录的 `.nvmrc` 固定使用 Node.js 24。

## 安装教程

### 1. 克隆项目

```bash
git clone https://github.com/chuxinruanjian/cx-cms.git
cd cx-cms
```

### 2. 安装依赖

项目使用 npm workspaces，所有依赖都由根目录的 `package-lock.json` 统一管理：

```bash
npm ci
```

不要分别进入 `apps/api` 或 `apps/admin` 执行安装，也不要提交任何
`node_modules` 目录。

### 3. 创建后端环境配置

```bash
cp apps/api/.env.example apps/api/.env
npm run app:key
```

`npm run app:key` 会生成 AdonisJS 所需的 `APP_KEY` 并写入
`apps/api/.env`。`.env` 包含本地配置和密钥，不会上传 Git。

### 4. 初始化数据库

默认使用 SQLite，不需要安装数据库服务：

```bash
npm run db:migrate
```

数据库文件会生成在 `storage/database/app.sqlite3`，该文件不会上传 Git。

### 5. 启动项目

同时启动 API 和管理后台：

```bash
npm run dev
```

启动成功后访问：

- API：<http://localhost:3333>
- 管理后台：<http://localhost:8000>

管理后台开发环境会自动把 `/api` 请求代理到 AdonisJS API。

也可以分别启动：

```bash
npm run dev:api
npm run dev:admin
```

## 切换到 MySQL

项目已经安装 `mysql2` 驱动。先创建数据库，然后修改
`apps/api/.env`：

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=cx_cms
```

应用迁移：

```bash
npm run db:migrate
```

业务代码必须使用 Lucid Model 或 Query Builder，避免编写只能在 SQLite
或 MySQL 单独运行的数据库逻辑。

## 常用命令

```bash
npm run dev          # 同时启动 API 和管理后台
npm run dev:api      # 只启动 API
npm run dev:admin    # 只启动管理后台
npm run app:key      # 生成 AdonisJS APP_KEY
npm run db:migrate   # 执行数据库迁移
npm run db:rollback  # 回滚最近一批迁移
npm run typecheck    # TypeScript 类型检查
npm run lint         # 检查代码规范
npm test             # 运行全部测试
npm run build        # 构建 API 和管理后台
```

## 目录说明

```text
apps/api/                         AdonisJS API
apps/admin/                       Ant Design Pro 管理后台
apps/h5/                          预留 H5 应用
storage/database/                 SQLite 数据库文件
storage/logs/                     应用日志
storage/uploads/images/           上传图片
storage/uploads/videos/           上传视频
storage/uploads/files/            其他上传文件
storage/certificates/payment/     支付证书与私钥
```

`storage` 中只上传 README 和 `.gitkeep` 目录占位。数据库、日志、上传产物、
支付证书和私钥都不会上传 Git，生产环境需要使用持久化磁盘或挂载目录。

AI 开发前请先阅读根目录 `AGENTS.md`；修改管理后台时还需要阅读
`apps/admin/AGENTS.md`。
