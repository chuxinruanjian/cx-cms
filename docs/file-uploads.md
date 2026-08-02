# 统一文件上传系统

本文档是 CX CMS 的项目级上传约定。头像、商品图、封面、视频、合同和压缩包
都必须复用本模块，业务页面不得重新实现请求、分片、重试或删除逻辑。

## 架构与目录

```text
apps/api/
├── app/controllers/                 上传、附件与清理接口
├── app/models/admin_attachment*     文件与业务关联模型
├── app/models/admin_upload_*        分片会话和分片模型
├── app/services/upload/
│   ├── attachment_service.ts        文件生命周期、绑定、排序、删除
│   ├── upload_session_service.ts    分片初始化、续传、合并、取消
│   ├── upload_cleanup_service.ts    过期文件和会话清理
│   ├── file_inspector_service.ts    扩展名、MIME、文件头、大小、哈希
│   └── storage/                     local、OSS、S3 适配器边界
└── commands/cleanup_uploads.ts      可交给 cron 调用的 Ace 命令

apps/admin/src/
├── components/Uploader/             所有业务共用的上传任务管理器和组件
├── services/upload.ts               上传与附件 API
└── pages/uploads/                   演示、任务、临时文件和资源管理
```

本地私有文件保存在根目录 `storage/uploads`。`.chunks` 是未完成分片的暂存
目录，源文件、分片和测试文件都不会进入 Git。

## 数据与生命周期

四张表统一使用后台 `admin_` 前缀：

- `admin_attachments`：源文件和派生文件记录。
- `admin_attachment_relations`：文件与任意业务记录的多态关联。
- `admin_upload_sessions`：分片任务、有效期和服务商上传 ID。
- `admin_upload_chunks`：分片序号、大小、SHA-256、ETag 和状态。

生命周期为：

```text
uploading -> temporary -> active
     |            |          |
     v            v          v
   failed    pending_delete  解除最后引用后回到 temporary
                    |
                    v
                  deleted
```

上传完成只代表文件可用，不代表业务提交成功，因此默认状态是 `temporary`。
业务事务成功后，调用绑定接口同步某个业务字段的最终附件 ID 集合。接口会：

1. 按传入顺序新增或更新关联；
2. 删除该业务字段不再出现的旧关联；
3. 将新附件改为 `active`；
4. 将已无任何引用的旧附件改回 `temporary`，等待删除或过期清理。

传入空的 `attachmentIds` 可清空该业务字段的附件。业务表不要只保存物理
路径；需要快速查询时可额外保存附件 ID，但关联表仍是引用计数的依据。

## 接口

所有接口位于 `/api/v1/admin`，使用后台 Bearer Token 和 RBAC：

| 方法 | 地址 | 权限 | 用途 |
|---|---|---|---|
| GET | `/upload-config` | `admin.attachments.upload` | 读取阈值、分片和限制 |
| POST | `/uploads` | `admin.attachments.upload` | 小文件普通上传 |
| POST | `/uploads/init` | `admin.attachments.upload` | 初始化分片上传 |
| POST | `/uploads/:uploadId/chunks` | `admin.attachments.upload` | 上传一个分片 |
| GET | `/uploads/:uploadId` | `admin.attachments.upload` | 断点续传状态 |
| POST | `/uploads/:uploadId/complete` | `admin.attachments.upload` | 合并并校验文件 |
| POST | `/uploads/:uploadId/abort` | `admin.attachments.upload` | 取消并清理分片 |
| GET | `/uploads` | `admin.attachments.view` | 上传任务列表 |
| GET | `/attachments` | `admin.attachments.view` | 文件资源列表 |
| GET | `/attachments/:id` | 所有者或 view | 文件与引用详情 |
| GET | `/attachments/:id/content` | 所有者或 view | 私有预览/下载 |
| POST | `/attachments/bind` | `admin.attachments.bind` | 同步业务附件集合 |
| POST | `/attachments/sort` | `admin.attachments.bind` | 保存完整排序 |
| DELETE | `/attachments/:id` | 所有者或 delete | 幂等物理删除 |
| POST | `/uploads/cleanup` | `admin.attachments.cleanup` | 手工运行过期清理 |

初始化和普通上传都必须携带 8–64 位的 `uploadToken`。文件名只用于显示和
下载；真实对象名由日期、UUID 和扩展名组成。后端会重新校验扩展名、MIME、
文件头、大小和 SHA-256，且会阻止路径穿越、重复冲突分片及越权删除。

## 后台组件

业务页面从 `@/components/Uploader` 使用以下组件：

- `AvatarUploader`
- `SquareImageUploader`
- `CoverImageUploader`
- `MultiImageUploader`
- `VideoUploader`
- `FileUploader`
- `BaseUploader`
- `useUploader`

它们都调用 `uploadTaskManager.ts`。任务管理器从服务端读取阈值：小文件走
普通上传，大文件自动分片，并提供并发、重试、进度、暂停、继续和取消。
分片会话 ID 会按文件指纹写入 `localStorage`。浏览器不能在刷新后保留
`File` 对象，所以重新打开页面后需要用户再次选择同一个本地文件；管理器
会查询服务端状态并只补传缺失分片。

图片场景统一基于 Ant Design `Upload` 二次封装。`MultiImageUploader`
使用 `picture-card` 照片墙并支持拖拽排序；`AvatarUploader` 使用圆形预览，
选择图片后必须先完成 1:1 裁剪。业务页面不得直接使用 `Upload` 重写上传、
预览、删除或裁剪流程。

典型业务保存流程：

```tsx
const [attachments, setAttachments] = useState<Attachment[]>([]);

<MultiImageUploader
  value={attachments}
  onChange={setAttachments}
  maxCount={20}
/>;

// 业务数据提交成功后调用，attachmentIds 的顺序就是业务排序
await bindAttachments({
  attachmentIds: attachments.map((item) => item.id),
  businessType: 'products',
  businessId: String(product.id),
  fieldName: 'gallery',
});
```

用户在表单中点击删除时，组件会调用真实删除接口。已被业务引用的文件会被
后端拒绝物理删除；应先在成功的业务更新事务后调用 `bindAttachments`
解除引用，再执行删除。

## 配置

配置位于 `apps/api/.env`，完整模板见 `.env.example`。常用项：

```dotenv
UPLOAD_DISK=local
UPLOAD_NORMAL_MAX_MB=20
UPLOAD_CHUNK_SIZE_MB=5
UPLOAD_CHUNK_CONCURRENCY=3
UPLOAD_MAX_RETRIES=3
UPLOAD_TEMPORARY_TTL_HOURS=24
UPLOAD_SESSION_TTL_HOURS=24
```

图片、视频、音频、文档、压缩包和其他文件有独立大小上限。允许扩展名在
`apps/api/config/upload.ts` 中集中维护，不允许仅依赖前端 `accept`。

`UPLOAD_DEDUPLICATE`、病毒扫描、内容审核、图片质量和 OSS 直传开关已进入
配置契约，但默认关闭。启用这些能力前必须接入对应处理器，不能只打开环境
变量。

## 定时清理与部署

项目没有常驻队列或调度器，因此提供可重复执行的 Ace 命令：

```bash
npm run uploads:cleanup
```

生产环境建议每小时执行一次。例如 crontab：

```cron
17 * * * * cd /var/www/cx-cms && npm run uploads:cleanup >> /var/log/cx-cms/upload-cleanup.log 2>&1
```

清理任务逐项处理过期会话和无引用的临时文件。单个对象删除失败只会记录
日志，不会阻断整批；物理文件已经不存在时视为成功。`storage/uploads`
必须挂载持久化磁盘，并由运行 API 的用户独占写权限。

## OSS 与 S3 接入

当前开箱即用的是私有本地存储。`StorageAdapter`、`StorageManager` 和
`CloudStorageAdapter` 已固定云存储边界，业务代码不会依赖具体 SDK。
接入阿里云 OSS 或 S3 时：

1. 新建实现 `StorageAdapter` 的适配器，SDK 只允许出现在该目录；
2. 在应用启动 Provider 中调用 `StorageManager.register('oss', adapter)`；
3. 使用短期 STS 或受限签名，永久 AccessKey 只保存在服务端密钥系统；
4. 实现 `put/read/delete/exists/abortMultipart`，删除不存在的对象必须幂等；
5. 增加服务商错误、终止分片、派生文件级联删除的集成测试；
6. 验证完成后才设置 `UPLOAD_DISK=oss`。

现有 `CloudStorageAdapter` 会明确返回 503，避免误把未配置的 OSS/S3 当成
可用存储。测试使用假 OSS 适配器验证了删除和终止分片始终经过统一边界。
客户端直传需要再扩展“申请短期凭证”和“服务端确认对象”接口；在完成对象
路径、大小、文件头和哈希复核前，不得设置 `UPLOAD_DIRECT_ENABLED=true`。

## 图片、视频和后续处理

表结构支持 `width`、`height`、`duration` 和 `parent_attachment_id`，删除
源文件会递归删除派生记录及其物理对象。当前基础包不强制安装 Sharp、
FFmpeg 或云转码 SDK，因此默认只保存并校验原文件，不生成缩略图、WebP、
视频封面或转码文件。

业务需要媒体处理时，应增加独立处理服务和队列：派生文件继续写入
`admin_attachments`，通过 `parent_attachment_id` 关联源文件；处理失败
记录错误但不伪造成功 URL。CPU 密集型图片压缩、视频时长提取和转码不要放
在上传 HTTP 请求中同步执行。

## 验证范围

后端功能测试覆盖普通上传、分片完整性、失败重试、重复分片、续传查询、
合并、取消、过期清理、绑定替换、清空与排序、引用保护、越权删除、源文件
缺失、重复删除和假 OSS 适配器。前端单元测试覆盖阈值切换与刷新后续传只
上传缺失分片。
