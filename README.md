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
cp apps/admin/.env.example apps/admin/.env
npm run app:key
```

`npm run app:key` 会生成 AdonisJS 所需的 `APP_KEY` 并写入
`apps/api/.env`。`.env` 包含本地配置和密钥，不会上传 Git。

管理后台的 `apps/admin/.env` 用于配置文字品牌信息和显示时区：

```dotenv
APP_TITLE=CX CMS
APP_SLOGAN_ZH_CN=让业务开发更简单
APP_SLOGAN_EN_US=Build business software faster
APP_COPYRIGHT_ZH_CN=© {year} 楚信软件 版权所有
APP_COPYRIGHT_EN_US=© {year} Chuxin Software. All rights reserved.
APP_TIMEZONE=Asia/Shanghai
```

后台 Logo 固定使用 `apps/admin/public/logo.png`，发布地址固定为
`/admin/logo.png`，无需环境变量。版权中的 `{year}` 会按照
`APP_TIMEZONE` 自动替换。前端所有业务时间统一通过
`apps/admin/src/utils/dayjs.ts` 解析和显示。请让 `APP_TIMEZONE` 与后端
`apps/api/.env` 中的 `TZ` 保持一致。

### 4. 初始化数据库

默认使用 SQLite，不需要安装数据库服务：

```bash
npm run db:migrate
npm run db:seed
```

数据库文件会生成在 `storage/database/app.sqlite3`，该文件不会上传 Git。

执行 `db:seed` 前，请先在 `apps/api/.env` 设置首个超级管理员：

```dotenv
ADMIN_USERNAME=admin
ADMIN_PASSWORD=请替换为强密码
ADMIN_NAME=超级管理员
ADMIN_EMAIL=admin@example.com
ADMIN_MOBILE=13800138000
```

初始化命令会创建后台 RBAC 权限、`super_admin` 角色和首个超级管理员，
可重复执行且不会重复插入数据。`ADMIN_MOBILE` 为可选项；需要使用短信登录时，
请设置管理员手机号。后台不提供公开注册接口。

### 5. 启动项目

同时启动 API 和管理后台：

```bash
npm run dev
```

启动成功后访问：

- API：`http://localhost:<apps/api/.env 中的 PORT>`
- 管理后台：<http://localhost:8000/admin/>

管理后台始终使用当前域名下的相对 `/api` 地址。开发环境会自动读取
`apps/api/.env` 的 `PORT`，把请求代理到本机 AdonisJS；修改后端端口后
只需重启开发服务。生产环境不需要配置额外的 API 域名。

管理后台仅提供简体中文和英文两种语言。

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
npm run db:seed      # 初始化 RBAC 和首个超级管理员
npm run uploads:cleanup # 清理过期上传会话和无引用临时文件
npm run typecheck    # TypeScript 类型检查
npm run lint         # 检查代码规范
npm test             # 运行全部测试
npm run build        # 依次构建管理后台和 API 发布包
npm run build:admin  # 后台构建到 apps/api/public/admin
npm run build:api    # API 构建到 apps/api/build
```

## 统一文件上传

项目内置统一的私有文件上传系统，支持普通上传、自动分片、并发与重试、
暂停/继续、断点续传、业务附件绑定、引用保护、幂等删除和临时文件清理。
后台的“文件上传”菜单包含各类组件演示、上传任务、临时文件和资源管理。

首次启用时执行迁移和权限种子：

```bash
npm run db:migrate
npm run db:seed
```

本地文件保存到 `storage/uploads`，默认超过 20MB 自动分片。阈值、分片
大小、并发数、重试数、各文件类型大小上限和临时有效期均由
`apps/api/.env` 配置。生产环境需要定时执行：

```bash
npm run uploads:cleanup
```

完整的接口、数据库、生命周期、业务接入示例、安全规范、cron 和 OSS/S3
适配说明见 [统一文件上传文档](docs/file-uploads.md)。

## 构建与部署

### 构建产物

从仓库根目录执行：

```bash
npm ci
npm run build
```

构建顺序不可颠倒：

1. 管理后台以 `/admin/` 为路由和资源前缀，直接构建到
   `apps/api/public/admin`。
2. AdonisJS 随后把整个 `apps/api/public` 复制到
   `apps/api/build/public`。
3. 最终运行入口为 `apps/api/build/bin/server.js`。

最终访问地址：

- API：`https://example.com/api/v1/...`
- 管理后台：`https://example.com/admin/`
- H5：`https://example.com/h5/`（H5 工程初始化并构建后）

`apps/api/public` 是公开静态文件源目录。域名验证文件（例如服务商提供的
`.txt` 文件）、`robots.txt` 和其他必须公开访问的文件可直接放在该目录，
提交到 Git 后会随 API 一起构建。例如 `apps/api/public/verify.txt` 的地址是
`https://example.com/verify.txt`。

`apps/api/public/admin` 和 `apps/api/public/h5` 是生成目录，已被 Git 忽略，
不要手工维护或提交。H5 选定框架后，应将它的基础路径固定为 `/h5/`，构建
输出固定为 `apps/api/public/h5`，并把 H5 构建命令插入后台和 API 构建之间。

### 启动生产服务

生产服务器保留仓库根目录的 `package.json`、`package-lock.json`、
`node_modules` 和 `apps/api/build`，然后执行：

```bash
cd apps/api/build
NODE_ENV=production node --env-file=../.env ace.js migration:run --force
NODE_ENV=production node --env-file=../.env bin/server.js
```

生产环境也可以通过进程管理器注入环境变量，此时无需使用 `--env-file`。
SQLite、日志、上传目录和证书目录在生产环境应配置为持久化磁盘上的绝对
路径，避免发布新版本时丢失。生产 `.env` 中的 `APP_URL` 也应填写完整
地址，不要保留变量插值：

```dotenv
APP_URL=https://example.com
SQLITE_DB_PATH=/var/lib/cx-cms/database/app.sqlite3
LOG_FILE=/var/log/cx-cms/app.log
UPLOAD_DIR=/var/lib/cx-cms/uploads
PAYMENT_CERT_DIR=/var/lib/cx-cms/certificates/payment
```

AdonisJS 已可直接提供 `build/public` 中的静态文件。流量较大时，建议让
Nginx 直接提供静态文件并把其余请求转发给 AdonisJS：

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/cx-cms/apps/api/build/public;

    location /admin/ {
        try_files $uri $uri/ /admin/index.html;
    }

    location /h5/ {
        try_files $uri $uri/ /h5/index.html;
    }

    location / {
        try_files $uri @adonis;
    }

    location @adonis {
        proxy_pass http://127.0.0.1:3333;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 目录说明

```text
apps/api/                         AdonisJS API
apps/api/public/                  域名验证等公开静态源文件
apps/api/public/admin/            管理后台构建产物（生成、忽略）
apps/api/public/h5/               H5 构建产物（生成、忽略）
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

## 后台认证与 RBAC

所有后台业务数据表统一使用 `admin_` 前缀。短信验证码属于跨端基础设施，
使用无后台前缀的 `sms_codes` 表：

| 表名 | 用途 |
| --- | --- |
| `admin_users` | 后台用户、手机号、基本资料、头像、状态、超级管理员标记和最后登录信息 |
| `admin_access_tokens` | 后台 Bearer Token，仅用于身份认证 |
| `admin_roles` | 角色 |
| `admin_permissions` | 原子权限 |
| `admin_user_roles` | 用户与角色关系 |
| `admin_role_permissions` | 角色与权限关系 |
| `sms_codes` | 短信验证码哈希、场景、有效期、发送状态和校验次数 |

后台认证接口：

- `POST /api/v1/admin/auth/login`
- `POST /api/v1/admin/auth/sms/send`
- `POST /api/v1/admin/auth/sms/login`
- `GET /api/v1/admin/auth/me`
- `PATCH /api/v1/admin/auth/me`
- `DELETE /api/v1/admin/auth/logout`

密码登录使用 `username`、`password` 和可选的 `remember`；短信登录使用
`mobile`、`code` 和可选的 `remember`。普通登录令牌有效期为 12 小时，
记住登录为 30 天。禁用用户不能登录。角色和权限不会固化到
Token 中，每个受保护请求都从数据库实时读取，因此修改角色、禁用角色或
禁用权限后会立即生效。

### 阿里云短信登录

在阿里云短信服务中准备短信签名和验证码模板，模板变量必须为 `code`。然后在
`apps/api/.env` 中配置：

```dotenv
ALIYUN_ACCESS_KEY_ID=请填写 AccessKey ID
ALIYUN_ACCESS_KEY_SECRET=请填写 AccessKey Secret
ALIYUN_SMS_SIGN_NAME=请填写短信签名
ALIYUN_SMS_LOGIN_TEMPLATE_CODE=SMS_000000000
ALIYUN_SMS_ENDPOINT=dysmsapi.aliyuncs.com
```

密钥只写入 `.env`，不要提交 Git。发送接口会校验管理员手机号和状态；手机号
未绑定有效管理员账号时返回 `E_ADMIN_MOBILE_NOT_BOUND`，且不会调用短信服务。
验证码有效期为 5 分钟，同一手机号 60 秒内不可重复发送，同一 IP 10 分钟最多
发送 10 次；验证码只保存 Argon 哈希，连续校验失败 5 次后失效，成功登录后
立即作废且不可重复使用。

当前管理员可通过 `PATCH /api/v1/admin/auth/me` 更新昵称、邮箱和个人简介。
头像先通过统一上传组件上传，再将 `avatarAttachmentId` 随基本资料提交；接口
会把图片绑定到当前管理员。没有配置头像时，后台统一显示由昵称生成的文字头像。

RBAC 管理接口位于 `/api/v1/admin/users`、`/api/v1/admin/roles` 和
`/api/v1/admin/permissions`。接口先经过 Bearer Token 认证，再通过
`adminRbac` 中间件校验 `admin.users.*`、`admin.roles.*` 或
`admin.permissions.*` 权限。`is_super_admin=true` 是明确的超级管理员
旁路，首个超级管理员由 `npm run db:seed` 创建。
