# 统一文件上传

项目保留统一上传能力，不提供素材库或附件绑定功能。业务表单直接保存上传后返回的 URL：单文件字段使用 `string | null`，多文件字段使用 `string[]`。

## 设计边界

- `attachments` 仅是上传模块的内部文件记录，用于普通上传、分片状态、七牛直传校验和失败清理，不能作为业务外键。
- `upload_sessions`、`upload_chunks` 仅用于分片续传。
- 不存在 `attachment_relations`，也没有资源列表、业务绑定、排序或素材管理接口。
- 普通上传完成后文件立即可用，不需要额外绑定。
- 业务删除或替换 URL 时只修改自己的字段，不由上传组件物理删除文件，避免用户取消表单或多个字段复用同一 URL 时误删。

## URL 规则

- 本地存储返回 `/api/v1/uploads/files/{uuid}`。该地址无需管理端令牌即可渲染，文件仍保存在根目录 `storage/uploads`，不会写入 `public`。
- 七牛云返回配置的 CDN 完整 URL。
- 业务字段只保存上述可长期访问的 URL，不保存文件 ID、磁盘路径、Bearer 保护地址、Blob URL 或 Data URL。

## API

上传接口位于 `/api/v1/admin`，需要登录并拥有 `admin.uploads.create` 权限。

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/upload-config` | 读取文件限制、分片和直传配置 |
| POST | `/uploads` | 普通上传，直接返回文件 URL |
| POST | `/uploads/init` | 初始化分片上传 |
| POST | `/uploads/:uploadId/chunks` | 上传分片 |
| GET | `/uploads/:uploadId` | 查询断点续传状态 |
| POST | `/uploads/:uploadId/complete` | 合并文件并返回 URL |
| POST | `/uploads/:uploadId/abort` | 取消分片上传 |
| POST | `/uploads/direct/init` | 获取七牛直传凭证 |
| POST | `/uploads/direct/:attachmentId/complete` | 服务端校验七牛对象并返回 URL |

公开读取接口为 `GET /api/v1/uploads/files/:uuid`。`attachmentId` 只在七牛直传握手和上传任务内部出现，不能进入业务表。

## 前端组件

统一从 `apps/admin/src/components/Uploader` 导入：

- `AvatarUploader`、`SquareImageUploader`、`CoverImageUploader`、`VideoUploader`：值为 `string | null`。
- `MultiImageUploader`、`FileUploader`：值为 `string[]`。
- `AvatarUploader` 固定保留 1:1 裁剪。

```tsx
const [coverUrl, setCoverUrl] = useState<string | null>(null)
const [galleryUrls, setGalleryUrls] = useState<string[]>([])

<CoverImageUploader
  value={coverUrl}
  onChange={(value) => setCoverUrl(typeof value === 'string' ? value : null)}
/>

<MultiImageUploader
  value={galleryUrls}
  onChange={(value) => setGalleryUrls(Array.isArray(value) ? value : [])}
/>
```

业务提交时直接把 `coverUrl`、`galleryUrls` 写入对应数据表字段。多图需要保持顺序时，按数组顺序保存 JSON 或写入业务自己的明细表。

## 清理

`npm run uploads:cleanup` 只清理过期分片会话和未完成/失败的上传。已完成且已返回 URL 的文件不会按“是否绑定”判断和自动删除。
