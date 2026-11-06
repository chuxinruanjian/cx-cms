# System Configuration Implementation Plan

> Implement inline with test-driven development and verification-before-completion.

**Goal:** 一张共享配置表及具有公开/内部 Tabs 的后台管理页。
**Architecture:** Lucid `system_configs` 持久化字符串配置；内部值用现有 AES-GCM 加密，仅服务端服务解密。管理接口始终脱敏，公开接口只读取 public 行。
**Tech Stack:** AdonisJS 7 / Lucid / Vine / Ant Design Pro / Japa / Vitest。

## Confirmed scope

- 系统配置表包含唯一 config_key、name、type（public/internal）、value、description 和时间。
- 配置键和类型创建后不可修改；内部值编辑留空保留已有值。
- 公开 GET `/api/v1/system-configs/public`；管理 CRUD `/api/v1/admin/system-configs` 使用独立 RBAC 权限。
- 后台 `/system-config` 使用 AdminPage、公开/内部 Tabs、展开筛选、ProTable 原生工具、带图标的三点菜单、四字段编辑弹窗和中英双语。
- 证书保存私有路径，普通 logo 保存耐久 URL。此功能不迁移现有 .env 配置，也不增加私有证书上传接口。
- 不提交、不推送，不重置运行数据库。

## Review focus

- 内部配置的值、密文不能进入列表、CRUD 响应或公开接口。
- 内部更新不填 value 保留原值；不允许把原记录改为 public。
- 配置键唯一、仅小写；分页和筛选不跨 Tabs 串数据。
- 无权限管理员无法增删改查，权限撤销立即生效。
- 新建、编辑、删除、切换 Tabs 和窄屏可用；证书提示不引导公开上传。

## Tasks

- [x] 写 API 回归测试并验证缺少接口时失败。
- [x] 新增可回滚迁移、模型和服务，生成 schema，完成校验、控制器、路由和 RBAC 种子。
- [x] 实现 Tabs 管理页、共用样式、权限入口、请求服务和双语文案。
- [x] 运行测试、类型检查、lint、构建及浏览器交互验证，独立审查。
- [x] 更新项目约定和最小接入说明。


## Verification and rulings

- API 35 + admin 79 项测试通过，其中新增系统配置 API 测试 7 项。
- 前后台 typecheck、lint、build 通过；新建库迁移及回滚通过，MySQL 只进行跨库 schema API 检查，未连接实库。
- 独立复查无阻塞问题；补充重复创建时数据库唯一约束的安全错误转换。
- 浏览器通过真实隔离 API/SQLite 验证增删改查、内部值不回显、公开隔离、Tabs 清空筛选、只读权限、英文和 390px 窄屏。
- Ruling: 不自动改动现有本地数据库。该库仍保留旧上传迁移基线的记录，需先对齐已有迁移历史后再正常运行迁移；本任务不会为新配置表重置旧业务数据。
