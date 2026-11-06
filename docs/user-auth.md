# 前台用户认证

用户与管理员使用独立的 `users`、`user_access_tokens` 和认证 guard。接口前缀为 `/api/v1`，受保护接口使用登录返回的 `Authorization: Bearer <token>`。不提供管理员公开注册入口。

## 接口

| 方法 | 路径 | 请求/用途 |
| --- | --- | --- |
| POST | `/auth/login` | `{ username, password }`，用户名密码登录 |
| POST | `/auth/wechat/mini-program` | `{ code }`，小程序 `wx.login` 换码登录 |
| GET | `/auth/wechat/official-account/authorize` | 返回公众号授权 `url`，建立浏览器会话与一次性 state |
| POST | `/auth/wechat/official-account` | `{ code, state }`，公众号回调换码登录，须携带上述同一会话 cookie |
| GET | `/auth/me` | 当前用户资料 |
| PATCH | `/auth/me` | `{ nickname?, avatar? }`，更新用户授权资料 |
| PATCH | `/auth/username` | `{ username }`，修改一次用户名 |
| PUT | `/auth/password` | `{ password, currentPassword? }`，设置/修改密码 |
| DELETE | `/auth/logout` | 撤销当前访问令牌 |

登录返回 `{ isNewUser, user, token: { type, value, expiresAt } }`。令牌有效期为 30 天。用户资料包含 `id`、`username`、`mobile`、`nickname`、`avatar`、`status`、`passwordLoginEnabled`、`canChangeUsername` 及时间字段，不包含密码和微信身份凭据。

微信首次登录自动创建随机用户名，并保存默认密码 `123456` 的哈希。按产品约定，默认密码不能用于登录；用户在微信授权登录后设置至少 8 位的新密码，才启用密码登录。已启用后修改密码必须提供正确的 `currentPassword`；成功后保留当前令牌并撤销其他令牌。

用户名为 3–64 位小写字母、数字或下划线，以字母开头。成功修改一次后不能再修改；提交当前用户名或名称冲突不消耗机会。手机号字段可空且唯一，预留给后续经过验证的绑定流程；当前资料接口不接受直接修改手机号。

## 微信配置及资料授权

服务端配置见 `apps/api/.env.example` 的 `WECHAT_*` 变量。小程序和公众号分别配置 appId、appSecret；公众号额外配置固定的回调 URI 和 scope。需要头像昵称时使用 `snsapi_userinfo`，`snsapi_base` 仅提供身份。实际接入须在微信平台配置相应应用权限、合法域名及回调域名，客户端不得取得 appSecret。

公众号流程：浏览器调用 authorize 接口，保留会话 cookie，再跳转返回的授权 URL。微信回调前端后，将 code/state 提交到登录接口，并携带同一会话 cookie。state 绑定浏览器及应用，10 分钟有效且只能消费一次；失效后重新发起授权。回调 URI 由服务端配置，不能由请求指定。账号资料通过服务端用户信息接口获取，不信任客户端声明的 openid、unionid、头像或昵称。

小程序登录仅完成身份认证，不从登录请求读取头像昵称。用户通过 `chooseAvatar`、昵称输入组件单独授权后：先使用用户令牌调用共享 `/uploads` 上传临时头像文件（字段与上传服务一致），取得持久 URL，再调用 `PATCH /auth/me` 保存头像 URL 和昵称。不能保存小程序临时路径、data URL 或 blob URL。共享上传还提供 `/upload-config`、分片及直传接口，并以用户身份检查资源归属。

登录服务只信任微信服务端换码结果。微信账号按 provider/appId/openid 的大小写敏感摘要区分。返回 UnionID 时同时记录；只有实际绑定同一个微信开放平台的应用，才应将各自 `WECHAT_*_OPEN_PLATFORM_ID` 配置为同一个稳定标识。未配置时 UnionID 只在当前 appId 范围匹配。不同应用无法提供 UnionID 时不会猜测合并账户；若已存在两个不同用户的身份冲突，返回 409，不自动迁移业务数据。以后调整开放平台绑定配置前需评估已有身份关联。

微信 session_key、access_token 和 secret 不保存到用户资料，也不向客户端返回。微信网络失败、错误响应均返回通用错误。登录接口按 IP 限流，超限返回 429 和 `Retry-After`；禁用账号返回 403。

## 验证及迁移

所有表通过 Lucid 迁移创建，兼容 SQLite/MySQL 的查询与字段。运行迁移前备份现有数据库；已有安装须先核对迁移历史与当前基线，不应直接重建业务数据库。

自动化测试覆盖模拟微信响应、UnionID、并发去重、OAuth state、密码启用、一次改名、资料更新、用户上传和管理员身份隔离。真实微信授权仍需使用实际应用凭据及微信客户端联调。此功能只提供 API，不初始化 H5 或小程序前端工程。
